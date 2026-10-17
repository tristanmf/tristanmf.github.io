// Precompile the JSX sources to plain JS so the browser no longer has to
// download @babel/standalone (~3 MB) and transpile on every visit.
//
//   app.jsx                        →  app.js                 (tristan.pro)
//   complorama/episode-visual.jsx  →  complorama/episode-visual.js
//   complorama/episodes-wall.jsx   →  complorama/episodes-wall.js
//
// The sources use React as a UMD global (no imports/exports), so the output
// is a classic script — each index.html loads it with a plain <script src>.
//
// Run locally:   npm install --no-save @babel/core @babel/preset-react
//                node scripts/build-jsx.mjs
// CI runs this automatically on every push that touches a .jsx
// (see .github/workflows/build-frontend.yml). Never edit the .js by hand.

import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const babel = require('@babel/core');

const ROOT = process.cwd();
const SOURCES = [
  'app.jsx',
  'complorama/episode-visual.jsx',
  'complorama/episodes-wall.jsx',
];

function banner(src) {
  return [
    `// GENERATED FILE — do not edit. Source: ${src}`,
    '// Rebuild with: node scripts/build-jsx.mjs  (CI does this on push)',
    '',
  ].join('\n');
}

async function build(rel) {
  const absIn = path.join(ROOT, rel);
  const absOut = absIn.replace(/\.jsx$/, '.js');
  const code = await readFile(absIn, 'utf8');
  const out = babel.transformSync(code, {
    filename: absIn,
    presets: [['@babel/preset-react', { runtime: 'classic' }]],
    // Keep the output readable and byte-stable across runs so the CI
    // commit only fires when the source actually changed.
    compact: false,
    retainLines: false,
    comments: true,
    babelrc: false,
    configFile: false,
  });
  await writeFile(absOut, banner(rel) + out.code + '\n');
  console.log(`✓ ${rel} → ${path.relative(ROOT, absOut)} (${out.code.length.toLocaleString()} chars)`);
}

for (const rel of SOURCES) await build(rel);

// presse/index.html, ia/…/index.html — même coquille que index.html (styles, polices, scripts,
// app.js), seuls le titre et les balises de partage changent. L'application lit
// l'adresse et affiche la bonne vue. Généré ici plutôt que maintenu à la
// main : une copie manuelle finirait par diverger de la page d'accueil.
const PAGES = [
  {
    out: 'presse/index.html',
    label: 'coquille de la revue de presse',
    title: 'Revue de presse — Tristan Mendès France',
    description: 'Revue de presse de Tristan Mendès France : les articles qui le citent depuis 1997 — presse nationale, régionale, étrangère, agences et web — et ses interventions radio, télé et podcast.',
    social: '1 700+ articles depuis 1997 et plus de 300 passages radio, télé et podcast.',
    url: 'https://tristan.pro/presse/',
    image: 'https://tristan.pro/apercus/presse.jpg',
    imageAlt: 'Revue de presse de Tristan Mendès France : 1 700+ articles depuis 1997',
  },
  {
    out: 'productions/index.html',
    label: 'page Productions',
    title: 'Productions — Tristan Mendès France',
    description: 'Les dernières enquêtes et réalisations numériques de Tristan Mendès France : IA et désinformation, visualisations, cartes interactives, et le laboratoire TMF Lab.',
    social: 'Enquêtes, essais et expérimentations numériques de Tristan Mendès France.',
    url: 'https://tristan.pro/productions/',
    image: 'https://tristan.pro/apercus/productions.jpg',
    imageAlt: 'Productions de Tristan Mendès France : enquêtes, essais et expérimentations',
  },
  {
    out: 'ia/pravda-perplexity/index.html',
    label: 'article Pravda / Perplexity',
    title: 'Présidentielle : quand Perplexity puise dans la propagande russe pour présenter les candidats — Tristan Mendès France',
    description: "En pleine campagne, interrogé sur la position des candidats à propos de l'Ukraine, de l'OTAN ou de Zelensky, Perplexity s'appuie sur le réseau de propagande russe Pravda, sans le moindre avertissement. Sur 420 réponses testées, 182 le citent parmi leurs sources (43 %).",
    social: 'Interrogé sur les candidats, Perplexity cite le réseau de propagande russe Pravda dans 182 réponses sur 420 (43 %), comme une source parmi d\'autres.',
    url: 'https://tristan.pro/ia/pravda-perplexity/',
    ogType: 'article',
    image: 'https://tristan.pro/ia/pravda-perplexity/apercu.jpg',
    imageAlt: 'Présidentielle : quand Perplexity puise dans la propagande russe pour présenter les candidats. 43 % des 420 réponses citent le réseau Pravda.',
  },
];
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
// assets/site-inline.css : le <style> de index.html (liquid-glass, aurora…), pour
// les en-têtes et pieds montés dans d'autres pages (voir EMBED dans app.jsx).
{
  const idx = await readFile(path.join(ROOT, 'index.html'), 'utf8');
  const m = idx.match(/<style>([\s\S]*?)<\/style>/);
  if (!m) throw new Error('index.html : bloc <style> introuvable');
  await writeFile(path.join(ROOT, 'assets/site-inline.css'), '/* GENERATED FILE — do not edit. Extrait de index.html par scripts/build-jsx.mjs */\n' + m[1].trim() + '\n');
  console.log('✓ index.html <style> → assets/site-inline.css');
}
const shell = await readFile(path.join(ROOT, 'index.html'), 'utf8');
for (const P of PAGES) {
  let html = shell;
  const set = (re, val) => {
    if (!re.test(html)) throw new Error(`${P.out} : motif introuvable dans index.html — ${re}`);
    html = html.replace(re, val);
  };
  set(/<title>[^<]*<\/title>/, `<title>${esc(P.title)}</title>`);
  set(/(<meta name="description" content=")[^"]*(")/, `$1${esc(P.description)}$2`);
  set(/(<link rel="canonical" href=")[^"]*(")/, `$1${P.url}$2`);
  set(/(<meta property="og:url" content=")[^"]*(")/, `$1${P.url}$2`);
  set(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(P.title)}$2`);
  set(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(P.social)}$2`);
  set(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(P.title)}$2`);
  set(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(P.social)}$2`);
  // Aperçu de partage propre à la page (images fabriquées par scripts/apercus/rendre.py).
  if (P.image) {
    set(/(<meta property="og:image" content=")[^"]*(")/, `$1${P.image}$2`);
    set(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${P.image}$2`);
    set(/(<meta property="og:image:alt" content=")[^"]*(")/, `$1${esc(P.imageAlt || P.title)}$2`);
    set(/(<meta name="twitter:image:alt" content=")[^"]*(")/, `$1${esc(P.imageAlt || P.title)}$2`);
  }
  if (P.ogType) set(/(<meta property="og:type" content=")[^"]*(")/, `$1${P.ogType}$2`);
  html = html.replace(/^<!doctype html>/i, '<!doctype html>\n<!-- GENERATED FILE — do not edit. Built from index.html by scripts/build-jsx.mjs -->');
  await writeFile(path.join(ROOT, P.out), html);
  console.log(`✓ index.html → ${P.out} (${P.label})`);
}
