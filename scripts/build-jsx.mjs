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

// presse/index.html — même coquille que index.html (styles, polices, scripts,
// app.js), seuls le titre et les balises de partage changent. L'application lit
// l'adresse et affiche la revue de presse. Généré ici plutôt que maintenu à la
// main : une copie manuelle finirait par diverger de la page d'accueil.
const PRESS_META = {
  title: 'Revue de presse — Tristan Mendès France',
  description: 'Revue de presse de Tristan Mendès France : les articles qui le citent depuis 1997 — presse nationale, régionale, étrangère, agences et web — et ses interventions radio, télé et podcast.',
  social: '1 700+ articles depuis 1997 et plus de 300 passages radio, télé et podcast.',
  url: 'https://tristan.pro/presse/',
};
{
  const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  let html = await readFile(path.join(ROOT, 'index.html'), 'utf8');
  const set = (re, val) => {
    if (!re.test(html)) throw new Error(`presse/index.html : motif introuvable dans index.html — ${re}`);
    html = html.replace(re, val);
  };
  set(/<title>[^<]*<\/title>/, `<title>${PRESS_META.title}</title>`);
  set(/(<meta name="description" content=")[^"]*(")/, `$1${esc(PRESS_META.description)}$2`);
  set(/(<link rel="canonical" href=")[^"]*(")/, `$1${PRESS_META.url}$2`);
  set(/(<meta property="og:url" content=")[^"]*(")/, `$1${PRESS_META.url}$2`);
  set(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(PRESS_META.title)}$2`);
  set(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(PRESS_META.social)}$2`);
  set(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(PRESS_META.title)}$2`);
  set(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(PRESS_META.social)}$2`);
  html = html.replace(/^<!doctype html>/i, '<!doctype html>\n<!-- GENERATED FILE — do not edit. Built from index.html by scripts/build-jsx.mjs -->');
  await writeFile(path.join(ROOT, 'presse/index.html'), html);
  console.log('✓ index.html → presse/index.html (coquille de la revue de presse)');
}
