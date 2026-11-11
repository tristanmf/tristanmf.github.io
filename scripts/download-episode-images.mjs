// Download every Radio France / franceinfo image referenced in episodes-data.js
// to complorama/assets/episodes/<clé>.webp, then rewrite episodes-data.js
// so that `img` points at the local path. Idempotent: skips files that are
// already downloaded and non-empty. Run from the repo root.
//
// Poids : une tuile du mur s'affiche à 250–400 px de côté. Toute image du
// dossier plus large que MAX_WIDTH (ou qui n'est pas réellement du WebP) est
// réécrite en WebP, largeur plafonnée. Cela demande le module `sharp`, que le
// workflow installe juste avant (`npm install --no-save sharp`). S'il manque,
// le miroir fonctionne comme avant (fichier gardé tel quel) et la passe
// suivante rattrape : rien ne casse.

import { readFile, writeFile, mkdir, stat, readdir } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, 'complorama/episodes-data.js');
const OUT_DIR = path.join(ROOT, 'complorama/assets/episodes');
const PUBLIC_PREFIX = 'assets/episodes/'; // relative to /complorama/index.html
const MAX_WIDTH = 800;     // largeur maximale d'une image du mur, en pixels
const WEBP_QUALITY = 80;   // proche des WebP 800x450 servis par Radio France

// Radio France serves episode artwork from two CDNs:
//   - legacy "pikapi" (e.g. /pikapi/images/<UUID>/800x450 or /1200x680)
//   - new "cruiser" S3 bucket (/s3/cruiser-production-eu*/YYYY/MM/<UUID>/...)
// Both URLs embed the same UUIDv4 keying scheme. We mirror either form to
// complorama/assets/episodes/<UUID>.webp — the file extension stays .webp
// for backwards-compat with episodes already pinned to that path even
// when the upstream is actually a JPG (browsers content-sniff fine).
// Pikapi sizes are NOT hardcoded; RF uses various dimensions (800x450,
// 1200x680, etc) depending on which page exposes the image.
// Chaque entrée : l'expression qui reconnaît l'adresse, et le préfixe du nom
// de fichier local (vide pour les UUID Radio France, noms historiques).
const REMOTE_RES = [
  { re: /https:\/\/www\.radiofrance\.fr\/pikapi\/images\/([a-f0-9-]{36})\/\d+x\d+/g, prefix: '' },
  // Sept. 2026 : nouveau seau « rf-cruiser-embed-production », même clé UUID.
  { re: /https:\/\/www\.radiofrance\.fr\/s3\/(?:rf-)?cruiser-(?:[a-z]+-)?production[^/]*\/\d{4}\/\d{2}\/([a-f0-9-]{36})\/[^"'\s)]+/g, prefix: '' },
  // Nov. 2026 : visuels servis par franceinfo.fr, sans UUID
  // (…/pictures/<signature>/<cadrage>/<taille>/filters:format(avif):quality(50)/AAAA/MM/JJ/<nom>.jpg).
  // La clé est le nom du fichier, préfixé pour ne jamais croiser un UUID.
  { re: /https:\/\/www\.franceinfo\.fr\/pictures\/[^"'\s]+\/([A-Za-z0-9_-]{8,})\.(?:jpe?g|png|webp|avif)/g, prefix: 'franceinfo-' },
];

// `sharp` est facultatif (voir en tête de fichier).
let sharp = null;
try { sharp = (await import('sharp')).default; }
catch { console.warn('Module sharp absent : images gardées telles quelles (pas de plafonnement).'); }

// Réécrit le fichier en WebP plafonné à MAX_WIDTH s'il est plus large ou s'il
// n'est pas du WebP. Ne touche à rien sinon : relancer ne change aucun octet.
async function capImage(file) {
  if (!sharp) return false;
  const input = await readFile(file);
  let meta;
  try { meta = await sharp(input).metadata(); }
  catch (err) { console.warn(`? ${path.basename(file)} : image illisible (${err.message})`); return false; }
  if (meta.format === 'webp' && meta.width <= MAX_WIDTH) return false;
  const output = await sharp(input)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
  await writeFile(file, output);
  console.log(`↓ ${path.basename(file)} : ${meta.format} ${meta.width}x${meta.height}, ${input.length} → ${output.length} octets`);
  return true;
}

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

  // Collect every (uuid → first remote URL we saw) pair across both CDN
  // formats. If the same UUID appears under both pikapi and cruiser, the
  // pikapi one wins (it's the canonical 800x450 WebP we used historically).
  const uuidToUrl = new Map();
  for (const { re, prefix } of REMOTE_RES) {
    for (const m of src.matchAll(re)) {
      const key = prefix + m[1];
      if (!uuidToUrl.has(key)) uuidToUrl.set(key, m[0]);
    }
  }
  console.log(`Found ${uuidToUrl.size} unique remote image(s)`);

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

  // Plafonner : tout le dossier est passé en revue (quelques millisecondes par
  // fichier), pas seulement les nouveautés, pour rattraper une passe où sharp
  // aurait manqué.
  let capped = 0;
  for (const name of (await readdir(OUT_DIR)).sort()) {
    if (!name.endsWith('.webp')) continue;
    if (await capImage(path.join(OUT_DIR, name))) capped++;
  }
  if (sharp) console.log(`Images plafonnées à ${MAX_WIDTH} px : ${capped}`);

  // Rewrite episodes-data.js to point at the local copies (only for UUIDs we
  // successfully have on disk). We replace the full remote URL we observed
  // for each UUID, regardless of which CDN it came from.
  let rewritten = src;
  let replaced = 0;
  for (const [uuid, remote] of uuidToUrl) {
    const dest = path.join(OUT_DIR, `${uuid}.webp`);
    if (!(await fileNonEmpty(dest))) continue;
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
