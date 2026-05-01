// Download every Radio France pikapi image referenced in episodes-data.js
// to complorama/assets/episodes/<UUID>.webp, then rewrite episodes-data.js
// so that `img` points at the local path. Idempotent: skips files that are
// already downloaded and non-empty. Run from the repo root.

import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, 'complorama/episodes-data.js');
const OUT_DIR = path.join(ROOT, 'complorama/assets/episodes');
const PUBLIC_PREFIX = 'assets/episodes/'; // relative to /complorama/index.html

const PIKAPI_RE = /https:\/\/www\.radiofrance\.fr\/pikapi\/images\/([a-f0-9-]+)\/800x450/g;

async function fileNonEmpty(p) {
  try { const s = await stat(p); return s.size > 0; } catch { return false; }
}

async function downloadOne(url, dest) {
  const res = await fetch(url, {
    headers: {
      // Radio France serves a 403 on default node UA; pretend to be a browser.
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'Accept': 'image/webp,image/avif,image/*,*/*;q=0.8',
      'Referer': 'https://www.radiofrance.fr/',
    },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  await pipeline(res.body, createWriteStream(dest));
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const src = await readFile(DATA_FILE, 'utf8');

  // Collect unique UUIDs and their canonical pikapi URLs
  const uuidToUrl = new Map();
  for (const m of src.matchAll(PIKAPI_RE)) uuidToUrl.set(m[1], m[0]);
  console.log(`Found ${uuidToUrl.size} unique pikapi UUIDs`);

  // Download missing ones
  let downloaded = 0, skipped = 0, failed = 0;
  for (const [uuid, url] of uuidToUrl) {
    const dest = path.join(OUT_DIR, `${uuid}.webp`);
    if (await fileNonEmpty(dest)) { skipped++; continue; }
    try {
      await downloadOne(url, dest);
      console.log(`✓ ${uuid}`);
      downloaded++;
    } catch (err) {
      console.error(`✗ ${uuid}: ${err.message}`);
      failed++;
    }
  }
  console.log(`Done — downloaded: ${downloaded}, already present: ${skipped}, failed: ${failed}`);

  // Rewrite episodes-data.js to point at the local copies (only for UUIDs we
  // successfully have on disk).
  let rewritten = src;
  let replaced = 0;
  for (const [uuid] of uuidToUrl) {
    const dest = path.join(OUT_DIR, `${uuid}.webp`);
    if (!(await fileNonEmpty(dest))) continue;
    const remote = `https://www.radiofrance.fr/pikapi/images/${uuid}/800x450`;
    const local = `${PUBLIC_PREFIX}${uuid}.webp`;
    if (rewritten.includes(remote)) {
      rewritten = rewritten.split(remote).join(local);
      replaced++;
    }
  }
  if (rewritten !== src) {
    await writeFile(DATA_FILE, rewritten);
    console.log(`Rewrote ${replaced} URLs in episodes-data.js`);
  } else {
    console.log('No URL rewrite needed.');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
