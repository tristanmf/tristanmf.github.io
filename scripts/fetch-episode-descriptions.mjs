// Visit each Radio France episode page once and pull:
//   1. A short search-friendly description (og:description preferred,
//      fallback to <meta name=description>). Stored on the entry so the
//      on-site filter can match against it.
//   2. The episode-specific og:image. If the entry currently uses the
//      generic Complorama show artwork (UUID 39bbb292…) — which is what
//      Radio France serves in the RSS for fresh episodes before the
//      illustration is uploaded — we replace it with the og:image as
//      soon as a real one is available. The next mirror run will pull
//      the file into complorama/assets/episodes/.
//
// Idempotent: entries that already have both a description and a
// non-generic image are left alone.
//
// Designed to run on the GitHub Actions runner — the local Claude Code
// sandbox cannot reach radiofrance.fr.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, 'complorama/episodes-data.js');

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const REQUEST_DELAY_MS = 250;   // be polite — ~30s for 108 episodes

// Radio France serves this UUID as the show-wide placeholder until a
// proper episode-specific illustration ships. We treat entries pointing
// at it as upgradable.
const GENERIC_SHOW_UUID = '39bbb292-d2d5-4b77-9f89-1b320bd4a4a5';

// HTML named entities Radio France's meta tags occasionally emit. Limited
// to the ones we've actually seen so the table stays tractable — anything
// else falls through to the numeric-entity decoders below.
const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  agrave: 'à', acirc: 'â', auml: 'ä', aring: 'å', aelig: 'æ', ccedil: 'ç',
  egrave: 'è', eacute: 'é', ecirc: 'ê', euml: 'ë',
  igrave: 'ì', iacute: 'í', icirc: 'î', iuml: 'ï',
  ograve: 'ò', oacute: 'ó', ocirc: 'ô', ouml: 'ö', oelig: 'œ',
  ugrave: 'ù', uacute: 'ú', ucirc: 'û', uuml: 'ü',
  ntilde: 'ñ', yacute: 'ý', yuml: 'ÿ', szlig: 'ß',
  Agrave: 'À', Acirc: 'Â', Auml: 'Ä', Aring: 'Å', AElig: 'Æ', Ccedil: 'Ç',
  Egrave: 'È', Eacute: 'É', Ecirc: 'Ê', Euml: 'Ë',
  Igrave: 'Ì', Iacute: 'Í', Icirc: 'Î', Iuml: 'Ï',
  Ograve: 'Ò', Oacute: 'Ó', Ocirc: 'Ô', Ouml: 'Ö', OElig: 'Œ',
  Ugrave: 'Ù', Uacute: 'Ú', Ucirc: 'Û', Uuml: 'Ü',
  Ntilde: 'Ñ', Yacute: 'Ý', szlig: 'ß',
  laquo: '«', raquo: '»', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
  hellip: '…', mdash: '—', ndash: '–', copy: '©', reg: '®', trade: '™',
  middot: '·', euro: '€', deg: '°',
};

function decodeEntities(s) {
  return s
    .replace(/&([a-zA-Z]+);/g, (m, name) => NAMED_ENTITIES[name] ?? m)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function pickMeta(html, attr, key) {
  // Match either `<meta name="description" content="...">` or the reverse
  // attribute order, with single or double quotes.
  const re = new RegExp(
    `<meta\\s+(?:[^>]*?\\s)?${attr}=["']${key}["'][^>]*?\\scontent=["']([^"']+)["']` +
    `|<meta\\s+(?:[^>]*?\\s)?content=["']([^"']+)["'][^>]*?\\s${attr}=["']${key}["']`,
    'i'
  );
  const m = html.match(re);
  if (!m) return null;
  return decodeEntities((m[1] || m[2]).trim());
}

function extractDescription(html) {
  return pickMeta(html, 'property', 'og:description')
      || pickMeta(html, 'name', 'description')
      || pickMeta(html, 'name', 'twitter:description');
}

function extractOgImage(html) {
  return pickMeta(html, 'property', 'og:image')
      || pickMeta(html, 'name', 'twitter:image');
}

function extractImageUuid(imgValue) {
  if (!imgValue) return null;
  const m = imgValue.match(/assets\/episodes\/([a-f0-9-]{36})/)
         || imgValue.match(/\/images\/([a-f0-9-]{36})\//)
         || imgValue.match(/\/cruiser-production[^/]*\/\d{4}\/\d{2}\/([a-f0-9-]{36})\//);
  return m ? m[1] : null;
}

async function fetchPageHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'fr,fr-FR;q=0.9,en;q=0.5',
    },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// --- File patching -------------------------------------------------------

function entriesToProcess(src) {
  // Yield { url, lineIndex, needsDescription, needsImageUpgrade } for
  // each entry line that needs at least one of the two enrichments.
  const lines = src.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/^\s*\{\s*title:/.test(line)) continue;
    const urlMatch = line.match(/url:\s*"([^"]+)"/);
    if (!urlMatch) continue;

    // Re-fetch if there's no description at all, OR if the existing one
    // still contains a named HTML entity (left over from an older run of
    // this script before the entity decoder was extended).
    const descMatch = line.match(/description:\s*"((?:[^"\\]|\\.)*)"/);
    const hasUndecodedEntity = descMatch && /&[a-zA-Z]+;/.test(descMatch[1]);
    const needsDescription = !descMatch || hasUndecodedEntity;

    const imgMatch = line.match(/img:\s*"([^"]+)"/);
    const currentUuid = imgMatch ? extractImageUuid(imgMatch[1]) : null;
    const needsImageUpgrade = currentUuid === GENERIC_SHOW_UUID;

    if (needsDescription || needsImageUpgrade) {
      out.push({ url: urlMatch[1], lineIndex: i, needsDescription, needsImageUpgrade });
    }
  }
  return { lines, todo: out };
}

function setDescriptionInLine(line, description) {
  // If the line already has a description: field (possibly with stale
  // HTML entities), replace it in-place. Otherwise insert a new field
  // immediately before the closing brace.
  if (/description:\s*"/.test(line)) {
    return line.replace(/(description:\s*)"(?:[^"\\]|\\.)*"/, `$1${JSON.stringify(description)}`);
  }
  const idx = line.lastIndexOf('}');
  if (idx === -1) return line;
  const before = line.slice(0, idx).trimEnd();
  const sep = before.endsWith(',') ? '' : ',';
  return `${before}${sep} description: ${JSON.stringify(description)} ${line.slice(idx)}`;
}

function replaceImageInLine(line, newImgUrl) {
  return line.replace(/(img:\s*)"[^"]*"/, `$1${JSON.stringify(newImgUrl)}`);
}

// --- Main ----------------------------------------------------------------

async function main() {
  const src = await readFile(DATA_FILE, 'utf8');
  const { lines, todo } = entriesToProcess(src);

  if (todo.length === 0) {
    console.log('All episodes have a description and a specific image — nothing to do.');
    return;
  }

  console.log(`Visiting ${todo.length} episode page(s) for description and/or image upgrade…`);

  let descAdded = 0, imgUpgraded = 0, skipped = 0, failed = 0;
  for (const { url, lineIndex, needsDescription, needsImageUpgrade } of todo) {
    try {
      const html = await fetchPageHtml(url);

      if (needsDescription) {
        const desc = extractDescription(html);
        if (desc && desc.length >= 10) {
          const compact = desc.length > 400 ? desc.slice(0, 397).trimEnd() + '…' : desc;
          lines[lineIndex] = setDescriptionInLine(lines[lineIndex], compact);
          descAdded++;
        } else {
          console.warn(`  ∅ desc ${url}`);
          skipped++;
        }
      }

      if (needsImageUpgrade) {
        const ogImg = extractOgImage(html);
        const newUuid = extractImageUuid(ogImg);
        if (ogImg && newUuid && newUuid !== GENERIC_SHOW_UUID) {
          lines[lineIndex] = replaceImageInLine(lines[lineIndex], ogImg);
          console.log(`  ↑ img upgraded for ${url} → ${newUuid}`);
          imgUpgraded++;
        } else {
          // No real image available yet — leave it as the generic art
          // for now; a later run will retry.
        }
      }

      console.log(`  ✓ ${url}`);
    } catch (e) {
      console.error(`  ✗ ${url}: ${e.message}`);
      failed++;
    }
    await sleep(REQUEST_DELAY_MS);
  }

  await writeFile(DATA_FILE, lines.join('\n'));
  console.log(`Done — descriptions added: ${descAdded}, images upgraded: ${imgUpgraded}, skipped: ${skipped}, failed: ${failed}`);
}

main().catch(e => { console.error(e); process.exit(1); });
