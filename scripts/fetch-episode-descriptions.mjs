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

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
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

    const needsDescription = !/description:\s*"/.test(line);

    const imgMatch = line.match(/img:\s*"([^"]+)"/);
    const currentUuid = imgMatch ? extractImageUuid(imgMatch[1]) : null;
    const needsImageUpgrade = currentUuid === GENERIC_SHOW_UUID;

    if (needsDescription || needsImageUpgrade) {
      out.push({ url: urlMatch[1], lineIndex: i, needsDescription, needsImageUpgrade });
    }
  }
  return { lines, todo: out };
}

function insertDescriptionInLine(line, description) {
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
          lines[lineIndex] = insertDescriptionInLine(lines[lineIndex], compact);
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
