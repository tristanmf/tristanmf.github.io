#!/usr/bin/env node
// Copie une fois pour toutes les favicons des médias cités dans la revue de
// presse, afin que la page ne contacte aucun domaine tiers à l'affichage.
//
//   presse/sources.json  (nom du média → domaine)
//        ↓
//   presse/favicons/<domaine>.png
//
// Les icônes sont récupérées via le service de Google, qui sait résoudre la
// favicon d'un domaine quel que soit l'endroit où le site la déclare. C'est
// un appel de build : aucun visiteur de tristan.pro ne touche Google.
//
// Idempotent : un fichier déjà présent est conservé. `--force` le remplace.
// Un domaine qui échoue est simplement signalé — la page retombe alors sur
// la pastille à initiales, donc rien ne casse.

import { mkdir, writeFile, stat, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT  = process.cwd();
const OUT   = 'presse/favicons';
const SRC   = 'presse/sources.json';
const SIZE  = 64;            // affichée en 20 px — 64 couvre les écrans Retina
const FORCE = process.argv.includes('--force');
const UA    = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const exists = async p => { try { return (await stat(p)).size > 0; } catch { return false; } };
const sleep  = ms => new Promise(r => setTimeout(r, ms));

// Une icône plus petite que ce seuil est le pictogramme « globe » générique que
// Google renvoie quand il ne trouve rien : autant ne pas l'enregistrer.
const MIN_BYTES = 120;

// Trois sources essayées dans l'ordre. Google résout le mieux les sites qui
// déclarent leur icône dans le HTML ; DuckDuckGo et le /favicon.ico du site
// rattrapent ceux qu'il ne connaît pas. Le fichier garde l'extension .png par
// convention de nommage même quand l'octet reçu est un ICO : les navigateurs
// reconnaissent le format au contenu, pas au nom.
const SOURCES = [
  d => `https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=${SIZE}`,
  d => `https://icons.duckduckgo.com/ip3/${encodeURIComponent(d)}.ico`,
  d => `https://${d}/favicon.ico`,
];

async function grab(domain) {
  const errs = [];
  for (const make of SOURCES) {
    try {
      const res = await fetch(make(domain), { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < MIN_BYTES) throw new Error(`icône générique (${buf.length} o)`);
      return buf;
    } catch (e) { errs.push(e.message); }
  }
  throw new Error(errs.join(' / '));
}

const domains = [...new Set(Object.values(JSON.parse(await readFile(path.join(ROOT, SRC), 'utf8'))))].sort();
await mkdir(path.join(ROOT, OUT), { recursive: true });

let written = 0, kept = 0;
const failed = [];

for (const d of domains) {
  const rel = `${OUT}/${d}.png`;
  if (!FORCE && await exists(path.join(ROOT, rel))) { kept++; continue; }
  try {
    const bytes = await grab(d);
    await writeFile(path.join(ROOT, rel), bytes);
    console.log(`  ✓ ${rel} (${(bytes.length / 1024).toFixed(1)} Ko)`);
    written++;
  } catch (e) {
    console.log(`  ✗ ${d} — ${e.message}`);
    failed.push(d);
  }
  await sleep(120);                      // on ne martèle pas le service
}

console.log(`\n${domains.length} domaines · ${written} récupérés · ${kept} déjà présents · ${failed.length} en échec`);
if (failed.length) console.log(`En échec (pastille à initiales) : ${failed.join(', ')}`);
