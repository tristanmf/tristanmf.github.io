// Turn the Whisper transcripts into the SQLite database the search endpoint
// queries. Node built-ins only (node:sqlite ships with Node 22+).
//
//   node scripts/build-search-index.mjs <segments.json> <out.sqlite> [--episodes complorama/episodes-data.js]
//
// Input, the shape Tristan's local pipeline already produces:
//   { "episodes": [...], "segments": [ { id, ep, t, t_fin, txt }, ... ] }
//
// Two decisions worth knowing before changing anything here.
//
// 1. WE GROUP SEGMENTS INTO PASSAGES. Whisper emits ~5-word segments; a
//    search for "théorie du complot" would straddle two of them and match
//    neither. Consecutive segments of one episode are therefore concatenated
//    into passages of about PASSAGE_WORDS words, which also gives a snippet
//    long enough to read. A passage keeps the start time of its first
//    segment, so the timecode still points at the right moment.
//
// 2. WE INDEX THE AUDIO ONLY. The audio is the long version; the YouTube
//    video is a shortened edit of it. Indexing both would return the same
//    passage twice and skew the ranking. The video transcript is used
//    elsewhere, to build the audio→video time map stored in `video_map`.

import { DatabaseSync } from 'node:sqlite';
import { readFileSync, existsSync, unlinkSync, statSync } from 'node:fs';

const PASSAGE_WORDS = 45;

const [, , inPath, outPath, ...rest] = process.argv;
const epArg = rest.indexOf('--episodes');
const episodesPath = epArg !== -1 ? rest[epArg + 1] : null;
const die = (m) => { console.error(`✗ ${m}`); process.exit(1); };
if (!inPath || !outPath) die('usage: build-search-index.mjs <segments.json> <out.sqlite> [--episodes episodes-data.js]');
if (!existsSync(inPath)) die(`introuvable : ${inPath}`);

const raw = JSON.parse(readFileSync(inPath, 'utf8'));
const segments = raw.segments || raw;
if (!Array.isArray(segments) || !segments.length) die('aucun segment dans le fichier');
console.log(`${segments.length.toLocaleString('fr-FR')} segments lus (${(statSync(inPath).size / 1048576).toFixed(1)} Mo)`);

// Episode metadata, when the wall's data file is available: title, url,
// youtube, date. Keyed by episode number.
const meta = new Map();
if (episodesPath && existsSync(episodesPath)) {
  const src = readFileSync(episodesPath, 'utf8');
  const m = src.match(/const RAW_EPISODES = (\[[\s\S]*?\n\]);/);
  if (m) {
    const list = (0, eval)(m[1]);
    // The wall numbers episodes most-recent-first from the total count.
    list.forEach((e, i) => meta.set(list.length - i, e));
    console.log(`${list.length} épisodes lus dans ${episodesPath}`);
  }
}

if (existsSync(outPath)) unlinkSync(outPath);
const db = new DatabaseSync(outPath);
db.exec(`
  PRAGMA journal_mode = OFF;
  PRAGMA synchronous = OFF;
  CREATE TABLE episodes (
    ep INTEGER PRIMARY KEY, title TEXT, url TEXT, youtube TEXT, date TEXT,
    n_passages INTEGER DEFAULT 0, duration REAL DEFAULT 0
  );
  CREATE TABLE passages (
    id INTEGER PRIMARY KEY, ep INTEGER NOT NULL,
    t REAL NOT NULL, t_end REAL NOT NULL, txt TEXT NOT NULL
  );
  CREATE INDEX idx_passages_ep ON passages(ep, t);
  -- external-content FTS5: the text is stored once, in the passages table
  CREATE VIRTUAL TABLE passages_fts USING fts5(
    txt, content='passages', content_rowid='id',
    tokenize="unicode61 remove_diacritics 2"
  );
  -- audio → video correspondence, piecewise because the video is cut:
  -- an audio moment in [a0, a1) is at (audio time + v_offset) in the video.
  -- A passage with no row here was cut from the video.
  CREATE TABLE video_map (
    ep INTEGER NOT NULL, a0 REAL NOT NULL, a1 REAL NOT NULL, v_offset REAL NOT NULL
  );
  CREATE INDEX idx_video_map ON video_map(ep, a0);
  CREATE TABLE build (key TEXT PRIMARY KEY, value TEXT);
`);

// Group consecutive segments of one episode into readable passages.
const byEp = new Map();
for (const s of segments) {
  const ep = Number(s.ep);
  if (!Number.isFinite(ep)) continue;
  if (!byEp.has(ep)) byEp.set(ep, []);
  byEp.get(ep).push(s);
}

const insPassage = db.prepare('INSERT INTO passages (ep, t, t_end, txt) VALUES (?, ?, ?, ?)');
const insEpisode = db.prepare('INSERT OR REPLACE INTO episodes (ep, title, url, youtube, date, n_passages, duration) VALUES (?, ?, ?, ?, ?, ?, ?)');

let totalPassages = 0, totalWords = 0;
const unmatched = [];
db.exec('BEGIN');
for (const [ep, segs] of [...byEp.entries()].sort((a, b) => a[0] - b[0])) {
  segs.sort((a, b) => Number(a.t) - Number(b.t));
  let buf = [], start = null, end = null, words = 0, n = 0;
  const flush = () => {
    if (!buf.length) return;
    const txt = buf.join(' ').replace(/\s+/g, ' ').trim();
    if (txt) { insPassage.run(ep, start, end, txt); n++; totalPassages++; }
    buf = []; start = null; words = 0;
  };
  for (const s of segs) {
    const txt = String(s.txt || '').trim();
    if (!txt) continue;
    if (start === null) start = Number(s.t) || 0;
    end = Number(s.t_fin ?? s.t) || end || 0;
    buf.push(txt);
    const w = txt.split(/\s+/).length;
    words += w; totalWords += w;
    if (words >= PASSAGE_WORDS) flush();
  }
  flush();
  const e = meta.get(ep) || {};
  if (!e.title) unmatched.push(ep);
  insEpisode.run(ep, e.title ?? null, e.url ?? null, e.youtube ?? null, e.date ?? null, n, end || 0);
}
db.exec('COMMIT');

// The `ep` numbers in segments.json come from Tristan's local pipeline; the
// wall numbers episodes from the "100e Complorama" anchor. If the two ever
// drift apart every result would show the wrong title — silently. So say so
// loudly instead: a handful of gaps is normal (an episode not transcribed),
// a majority means the numbering does not line up and must be reconciled.
if (meta.size && unmatched.length) {
  const share = unmatched.length / byEp.size;
  const msg = `${unmatched.length} épisode(s) sur ${byEp.size} sans métadonnée : ${unmatched.slice(0, 12).join(', ')}${unmatched.length > 12 ? '…' : ''}`;
  if (share > 0.2) {
    console.error(`\n✗ ${msg}`);
    console.error('  → la numérotation de segments.json ne correspond pas à celle du mur ; ne pas déployer cet index.');
    db.close();
    unlinkSync(outPath);   // ne pas laisser derrière soi une base à moitié faite
    process.exit(3);
  }
  console.warn(`\n⚠ ${msg}`);
}

// Populate the index from the content table in one pass.
db.exec("INSERT INTO passages_fts(passages_fts) VALUES('rebuild')");
db.exec("INSERT INTO passages_fts(passages_fts) VALUES('optimize')");
for (const [k, v] of [['built_at', new Date().toISOString()], ['passages', String(totalPassages)], ['words', String(totalWords)], ['passage_words', String(PASSAGE_WORDS)]]) {
  db.prepare('INSERT OR REPLACE INTO build (key, value) VALUES (?, ?)').run(k, v);
}
db.exec('VACUUM');
db.close();

console.log(`${byEp.size} épisodes · ${totalPassages.toLocaleString('fr-FR')} passages · ${totalWords.toLocaleString('fr-FR')} mots`);
console.log(`→ ${outPath} (${(statSync(outPath).size / 1048576).toFixed(1)} Mo)`);
