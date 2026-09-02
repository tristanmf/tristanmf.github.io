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
