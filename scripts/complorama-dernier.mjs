// Écrit complorama/dernier.json : le dernier épisode de Complorama, pour la
// tuile « Dernier épisode » de la page d'accueil de tristan.pro. L'accueil ne
// charge ainsi que ce petit fichier, pas tout le catalogue (episodes-data.js).
// Lancé par le workflow « Sync new episodes » après le miroir des images.
//   node scripts/complorama-dernier.mjs
import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';

const src = await readFile('complorama/episodes-data.js', 'utf8');
const ctx = { window: {} };
vm.runInNewContext(src, ctx);
const ep = (ctx.window.EPISODES || [])[0];
if (!ep) throw new Error('Aucun épisode dans complorama/episodes-data.js');
// Image : seulement le miroir local (aucun domaine tiers sur tristan.pro).
const img = ep.img && !/^https?:/.test(ep.img) ? '/complorama/' + ep.img.replace(/^\.?\//, '') : null;
const out = { n: ep.n, title: ep.title, date: ep.date || null, url: ep.url, youtube: ep.youtube || null, img };
await writeFile('complorama/dernier.json', JSON.stringify(out, null, 2) + '\n');
console.log(`✓ complorama/dernier.json — n°${out.n} « ${out.title} »${img ? '' : ' (image pas encore en miroir)'}`);
