// Visit each Radio France episode page once and pull a short search-friendly
// description (og:description preferred, fallback to <meta name=description>).
// The text is stored on the corresponding entry in episodes-data.js so the
// site's filter can match against it. Idempotent: episodes that already
// have a non-empty description are skipped.
//
// Designed to run on the GitHub Actions runner — the local Claude Code
// sandbox cannot reach radiofrance.fr.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, 'complorama/episodes-data.js');

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const REQUEST_DELAY_MS = 250;   // be polite — ~30s for 108 episodes

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
  // og:description is usually the editor-written summary; meta description
  // is the same on most franceinfo article pages but can be the lede.
  return pickMeta(html, 'property', 'og:description')
      || pickMeta(html, 'name', 'description')
      || pickMeta(html, 'name', 'twitter:description');
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

function entriesNeedingDescription(src) {
  // Yield { url, lineIndex } for each entry line that does not already
  // have a description: field.
  const lines = src.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/^\s*\{\s*title:/.test(line)) continue;
    if (/description:\s*"/.test(line)) continue;
    const m = line.match(/url:\s*"([^"]+)"/);
    if (!m) continue;
    out.push({ url: m[1], lineIndex: i });
  }
  return { lines, todo: out };
}

function insertDescriptionInLine(line, description) {
  // Find the LAST closing brace on the line and insert the new field
  // immediately before it, preserving formatting + trailing comma.
  const idx = line.lastIndexOf('}');
  if (idx === -1) return line;
  const before = line.slice(0, idx).trimEnd();
  const sep = before.endsWith(',') ? '' : ',';
  return `${before}${sep} description: ${JSON.stringify(description)} ${line.slice(idx)}`;
}

// --- Main ----------------------------------------------------------------

async function main() {
  const src = await readFile(DATA_FILE, 'utf8');
  const { lines, todo } = entriesNeedingDescription(src);

  if (todo.length === 0) {
    console.log('All episodes already have a description — nothing to do.');
    return;
  }

  console.log(`Fetching descriptions for ${todo.length} episode(s)…`);

  let ok = 0, skipped = 0, failed = 0;
  for (const { url, lineIndex } of todo) {
    try {
      const html = await fetchPageHtml(url);
      const desc = extractDescription(html);
      if (!desc || desc.length < 10) {
        console.warn(`  ∅ ${url} — no usable description in HTML`);
        skipped++;
      } else {
        // Trim very long descriptions to keep the data file readable; the
        // first ~400 chars are enough for keyword search.
        const compact = desc.length > 400 ? desc.slice(0, 397).trimEnd() + '…' : desc;
        lines[lineIndex] = insertDescriptionInLine(lines[lineIndex], compact);
        console.log(`  ✓ ${url}`);
        ok++;
      }
    } catch (e) {
      console.error(`  ✗ ${url}: ${e.message}`);
      failed++;
    }
    await sleep(REQUEST_DELAY_MS);
  }

  await writeFile(DATA_FILE, lines.join('\n'));
  console.log(`Done — added: ${ok}, skipped (no desc): ${skipped}, failed: ${failed}`);
}

main().catch(e => { console.error(e); process.exit(1); });
