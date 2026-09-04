// Pourquoi tel mot ne remonte-t-il rien ? — diagnostic sur l'index de recherche.
//
//   node scripts/search-diagnose.mjs <index.sqlite> <mot> [autre mot…]
//
// Une transcription automatique écrit les noms propres à l'oreille : « Meyssan »
// peut être devenu « Meissant », « Maysan », « mes ans ». Le mot cherché est
// alors absent de l'index alors que la personne a bel et bien été citée. Ce
// script le montre : pour chaque terme, il donne le nombre de passages, puis —
// s'il n'y en a aucun — les mots réellement présents dans l'index qui lui
// ressemblent le plus, avec leur fréquence.
//
// Le vocabulaire est lu par fts5vocab, une table virtuelle qui expose les
// termes indexés. Seuls des mots isolés proches de la requête sont affichés,
// jamais de phrase : ces journaux sont publics.

import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';

const [, , dbPath, ...rest] = process.argv;
const BRIEF = rest.includes('--brief');   // ne montrer que ce qui cloche
const NOMS = rest.includes('--noms');     // relever les noms propres suspects
const terms = rest.filter((t) => !t.startsWith('--'));
const die = (m) => { console.error(`✗ ${m}`); process.exit(1); };
if (!dbPath || (!terms.length && !NOMS)) die('usage: search-diagnose.mjs <index.sqlite> <mot>… [--brief] | <index.sqlite> --noms');
if (!existsSync(dbPath)) die(`introuvable : ${dbPath}`);

const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Distance d'édition, plafonnée : au-delà de `max` on abandonne. */
function distance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (cur[j] < best) best = cur[j];
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

const db = new DatabaseSync(dbPath);
// La table de vocabulaire est créée dans `temp` mais pointe explicitement sur
// le schéma `main` : l'index téléchargé n'est pas modifié.
db.exec("CREATE VIRTUAL TABLE IF NOT EXISTS temp.vocab USING fts5vocab('main', 'passages_fts', 'row')");
const vocab = db.prepare('SELECT term, doc FROM temp.vocab').all();
console.log(`index : ${db.prepare('SELECT count(*) c FROM passages').get().c.toLocaleString('fr-FR')} passages · ${vocab.length.toLocaleString('fr-FR')} mots distincts\n`);

const countStmt = db.prepare('SELECT count(*) c FROM passages_fts WHERE passages_fts MATCH ?');
const sampleStmt = db.prepare(`SELECT e.ep, e.title, e.date, p.t
                               FROM passages_fts JOIN passages p ON p.id = passages_fts.rowid
                               JOIN episodes e ON e.ep = p.ep
                               WHERE passages_fts MATCH ? ORDER BY bm25(passages_fts) LIMIT 3`);

// ---------------------------------------------------------------------------
// Relevé des noms propres rares — pour ne plus avoir à lire les transcriptions
// pour trouver ceux que Whisper a écorchés.
//
// Un nom propre écorché est presque toujours un mot capitalisé, rare, et qui
// n'existe pas comme mot courant. On liste donc les mots capitalisés du texte
// dont la forme minuscule est absente ou quasi absente du vocabulaire ordinaire.
// La liste contient forcément des noms parfaitement transcrits ; elle sert à
// être PARCOURUE, pas à être appliquée. Tristan reconnaît en une seconde ce
// qu'aucune distance d'édition ne peut deviner.
// ---------------------------------------------------------------------------
if (NOMS) {
  const docByTerm = new Map(vocab.map((v) => [v.term, v.doc]));
  const caps = new Map();
  for (const { txt } of db.prepare('SELECT txt FROM passages').iterate()) {
    for (const m of String(txt).matchAll(/(^|[^\p{L}'’-])(\p{Lu}[\p{L}'’-]{3,})/gu)) {
      const word = m[2];
      caps.set(word, (caps.get(word) || 0) + 1);
    }
  }
  const suspects = [...caps.entries()]
    .map(([word, n]) => ({ word, n, common: docByTerm.get(norm(word)) || 0 }))
    // Fréquent en minuscules = mot ordinaire capitalisé en début de phrase.
    .filter((c) => c.common <= 3 && c.n <= 6)
    .sort((a, b) => a.word.localeCompare(b.word, 'fr'));

  console.log(`${suspects.length} noms propres rares relevés dans les transcriptions.`);
  console.log('Parcourez-les : ceux qui sont écorchés sautent aux yeux. Envoyez-les');
  console.log('avec la bonne orthographe, ils rejoindront la table de corrections.\n');
  const cols = 3, rows = Math.ceil(suspects.length / cols);
  for (let r = 0; r < rows; r++) {
    const line = [];
    for (let c = 0; c < cols; c++) {
      const it = suspects[c * rows + r];
      if (it) line.push(`${it.word} (${it.n})`.padEnd(30));
    }
    console.log('  ' + line.join('').trimEnd());
  }
  db.close();
  console.log('');
  process.exit(0);
}

const found = [], missing = [];

for (const raw of terms) {
  const term = norm(raw);

  let exact = 0, prefix = 0;
  try { exact = countStmt.get(`"${term}"`).c; } catch { /* terme non exploitable */ }
  try { prefix = countStmt.get(`"${term}"*`).c; } catch { /* idem */ }
  if (prefix > 0) found.push(`${raw} (${prefix})`); else missing.push(raw);

  // En mode bref on saute les termes trouvés ET sans voisin suspect : il n'y
  // a rien à y corriger. On calcule donc les voisins avant de décider.
  const skip = BRIEF && prefix > 0;


  // Les graphies voisines, qu'on ait trouvé le mot ou non.
  //
  // Chercher les variantes seulement quand le nom est introuvable était une
  // erreur : « Faurisson » est bien dans l'index, et pourtant la
  // transcription écrit AUSSI « Forisson » ailleurs. Une orthographe
  // correcte quelque part ne garantit pas qu'elle l'est partout.
  const max = term.length <= 5 ? 1 : term.length <= 8 ? 2 : 3;
  const near = [];
  for (const { term: t, doc } of vocab) {
    if (t === term) continue;
    if (Math.abs(t.length - term.length) > max) continue;
    const d = distance(term, t, max);
    if (d <= max) near.push({ t, doc, d });
  }
  near.sort((a, b) => a.d - b.d || b.doc - a.doc);

  if (skip && !near.length) continue;
  console.log(`${'─'.repeat(66)}\n« ${raw} »`);
  console.log(`  exact   : ${exact} passage(s)`);
  console.log(`  préfixe : ${prefix} passage(s)   (${term}…)`);

  if (prefix > 0) {
    for (const r of sampleStmt.all(`"${term}"*`)) {
      console.log(`    n°${String(r.ep).padStart(3, '0')} · ${r.date} · ${String(r.title).slice(0, 46)} · à ${Math.floor(r.t / 60)}:${String(Math.round(r.t % 60)).padStart(2, '0')}`);
    }
    if (near.length) {
      console.log(`  ⚠ graphies voisines aussi présentes — possibles variantes du même nom :`);
      for (const n of near.slice(0, 8)) console.log(`    ${n.t.padEnd(24)} ${String(n.doc).padStart(5)} passage(s)   (distance ${n.d})`);
    }
    continue;
  }

  // Et quels mots le contiennent, ou sont contenus dedans ?
  const parts = vocab
    .filter(({ term: t }) => t.length >= 4 && (t.includes(term.slice(0, Math.max(4, term.length - 2))) || term.includes(t)))
    .sort((a, b) => b.doc - a.doc).slice(0, 10);

  if (near.length) {
    console.log(`  mots proches présents dans l'index :`);
    for (const n of near.slice(0, 12)) console.log(`    ${n.t.padEnd(24)} ${String(n.doc).padStart(5)} passage(s)   (distance ${n.d})`);
  }
  if (parts.length) {
    console.log(`  mots apparentés :`);
    for (const p of parts) console.log(`    ${p.term.padEnd(24)} ${String(p.doc).padStart(5)} passage(s)`);
  }
  if (!near.length && !parts.length) console.log('  aucun mot ressemblant — le terme est vraisemblablement absent des émissions transcrites.');
}

console.log(`${'═'.repeat(66)}`);
console.log(`présents (${found.length}) : ${found.join(' · ') || '—'}`);
console.log(`\nABSENTS (${missing.length}) : ${missing.join(' · ') || '—'}`);
console.log('→ pour chacun, la graphie réellement employée est listée ci-dessus.');
db.close();
console.log('');
