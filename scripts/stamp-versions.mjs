// Ajoute ?v=<empreinte> aux adresses de /app.js et /assets/tailwind.css dans
// index.html et les coquilles générées. Sans cela, Safari sur iPhone gardait
// l'ancien app.js après une mise à jour (constaté le 24/10/2026) : chaque
// version compilée a désormais sa propre adresse. L'empreinte ne change que si
// le fichier change : pas de commit inutile. Lancé par « Build front-end »,
// après la compilation de app.js et de Tailwind.
//   node scripts/stamp-versions.mjs
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const HTML = ['index.html', 'presse/index.html', 'productions/index.html', 'ia/pravda-perplexity/index.html', 'ia/google-sante/index.html'];
const ASSETS = ['app.js', 'assets/tailwind.css'];

const empreinte = async (f) => createHash('sha256').update(await readFile(f)).digest('hex').slice(0, 10);
const v = Object.fromEntries(await Promise.all(ASSETS.map(async (f) => [f, await empreinte(f)])));

for (const f of HTML) {
  let html = await readFile(f, 'utf8');
  for (const a of ASSETS) {
    const re = new RegExp(`((?:src|href)="/${a.replace(/[.]/g, '\\.')})(\\?v=[0-9a-f]*)?"`, 'g');
    if (!re.test(html)) throw new Error(`${f} : /${a} introuvable`);
    html = html.replace(re, `$1?v=${v[a]}"`);
  }
  await writeFile(f, html);
}
console.log(`✓ versions : ${ASSETS.map((a) => `${a}?v=${v[a]}`).join(', ')}`);
