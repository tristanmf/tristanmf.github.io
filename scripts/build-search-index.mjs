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
//    into passages of about PASSAGE_WORDS words — long enough to read as a
//    quotation with its context, which is what Tristan asked for after
//    seeing the first results. A passage keeps the start time of its first
//    segment: the timecode therefore points slightly BEFORE the words that
//    matched, which is the right way round for someone about to listen.
//
// 2. WE INDEX THE AUDIO ONLY. The audio is the long version; the YouTube
//    video is a shortened edit of it. Indexing both would return the same
//    passage twice and skew the ranking. The video transcript is used
//    elsewhere, to build the audio→video time map stored in `video_map`.

import { DatabaseSync } from 'node:sqlite';
import { readFileSync, existsSync, unlinkSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const PASSAGE_WORDS = 60;
// Résolu depuis l'emplacement du script, pas depuis le dossier courant : la
// table doit être trouvée que l'indexeur soit lancé de la racine du dépôt ou
// d'ailleurs.
const CORRECTIONS_PATH = fileURLToPath(new URL('../_backend/complorama/corrections.json', import.meta.url));

const [, , inPath, outPath, ...rest] = process.argv;
const epArg = rest.indexOf('--episodes');
const episodesPath = epArg !== -1 ? rest[epArg + 1] : null;
const spArg = rest.indexOf('--speakers');
const speakersPath = spArg !== -1 ? rest[spArg + 1] : null;
const vmArg = rest.indexOf('--video-map');
const videoMapPath = vmArg !== -1 ? rest[vmArg + 1] : null;
const die = (m) => { console.error(`✗ ${m}`); process.exit(1); };
if (!inPath || !outPath) die('usage: build-search-index.mjs <segments.json> <out.sqlite> [--episodes episodes-data.js]');
if (!existsSync(inPath)) die(`introuvable : ${inPath}`);

const raw = JSON.parse(readFileSync(inPath, 'utf8'));
const segments = raw.segments || raw;
if (!Array.isArray(segments) || !segments.length) die('aucun segment dans le fichier');
console.log(`${segments.length.toLocaleString('fr-FR')} segments lus (${(statSync(inPath).size / 1048576).toFixed(1)} Mo)`);

// Describe the file's shape without printing a word of the transcripts:
// these logs are public and the whole point of the private backend is that
// the text stays off the open web. Long strings are shown as their length.
const shape = (o) => JSON.stringify(Object.fromEntries(Object.entries(o || {}).map(([k, v]) =>
  [k, typeof v === 'string' ? (v.length > 24 ? `<texte, ${v.length} car.>` : v) : Array.isArray(v) ? `<${v.length} éléments>` : v])));
console.log(`  clés du fichier : ${Object.keys(raw).join(', ') || '(tableau nu)'}`);
console.log(`  un segment      : ${shape(segments[0])}`);
if (raw.episodes?.length) console.log(`  un épisode      : ${shape(raw.episodes[0])}`);
{
  const nums = [...new Set(segments.map((s) => Number(s.ep)).filter(Number.isFinite))].sort((a, b) => a - b);
  console.log(`  numéros d'épisode : ${nums.length} distincts, de ${nums[0]} à ${nums[nums.length - 1]}`);
  const holes = [];
  for (let i = nums[0]; i <= nums[nums.length - 1]; i++) if (!nums.includes(i)) holes.push(i);
  if (holes.length) console.log(`  manquants dans la série : ${holes.slice(0, 20).join(', ')}${holes.length > 20 ? '…' : ''}`);
}

// ---------------------------------------------------------------------------
// Matching a transcript to the episode it belongs to.
//
// Not by number. The transcripts are numbered by Tristan's local pipeline and
// the wall numbers episodes from the "100e Complorama" anchor; the two agree
// today but nothing enforces it, and if they ever drift every result would
// carry the wrong title while looking perfectly fine. The broadcast date is a
// far better key — it is unique across the whole catalogue — with the title as
// a fallback and the number only as a last resort.
// ---------------------------------------------------------------------------

const stripAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const normTitle = (s) => stripAccents(String(s || '').toLowerCase())
  .replace(/^\s*podcast\s*[.:]\s*/, '')          // « PODCAST. » en tête
  .replace(/^\s*complorama\s*[.:]\s*/, '')
  .replace(/[^a-z0-9]+/g, ' ').trim();
const findDate = (o) => {
  for (const v of Object.values(o || {})) {
    const m = typeof v === 'string' && v.match(/(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }
  return null;
};
const findTitle = (o) => {
  for (const k of ['title', 'titre', 'name', 'nom', 'episode_title', 'heading']) {
    if (o && typeof o[k] === 'string' && o[k].trim()) return o[k].trim();
  }
  return null;
};

// The wall's episodes, numbered exactly as episodes-data.js does it.
const wall = [];
if (episodesPath && existsSync(episodesPath)) {
  const src = readFileSync(episodesPath, 'utf8');
  const m = src.match(/const RAW_EPISODES = (\[[\s\S]*?\n\]);/);
  if (m) {
    const seen = new Set(), uniq = [];
    for (const e of (0, eval)(m[1])) { if (!seen.has(e.title)) { seen.add(e.title); uniq.push(e); } }
    const anchor = uniq.findIndex((e) => /\b100e\b/i.test(e.title));
    const top = anchor >= 0 ? anchor + 100 : uniq.length;
    uniq.forEach((e, i) => wall.push({ ...e, n: top - i }));
    console.log(`${wall.length} épisodes lus dans ${episodesPath} — n°${wall[wall.length - 1].n} à n°${wall[0].n}` +
      (anchor >= 0 ? ` (calés sur la « 100e », qui tombe bien sur le n°${top - anchor})` : ' (pas d\'ancre « 100e » trouvée)'));
  }
}
const byDate = new Map(wall.filter((e) => e.date).map((e) => [e.date, e]));
const byTitle = new Map(wall.map((e) => [normTitle(e.title), e]));
const byNumber = new Map(wall.map((e) => [e.n, e]));

// What the transcript file says about each of its episodes, if anything.
const described = new Map();
for (const [i, e] of (raw.episodes || []).entries()) {
  const key = [e.ep, e.id, e.n, e.numero, e.number, e.index].find((v) => v !== undefined) ?? i;
  described.set(String(key), { date: findDate(e), title: findTitle(e) });
}
if (described.size) console.log(`${described.size} épisodes décrits dans le fichier de transcriptions`);

const how = { date: 0, titre: 0, numero: 0, aucun: 0 };
const why = [];   // pourquoi un épisode n'a pas trouvé son jumeau

/**
 * Resolve one transcript episode key to a wall episode.
 *
 * The number is a LAST resort, used only when the transcript file says
 * nothing else about the episode. If it does give a date or a title and
 * neither matches, that is a failure, not an invitation to guess: falling
 * back to the number there would quietly attach the passages to a different
 * episode and every result would look perfectly normal while being wrong.
 * Caught exactly that way in testing.
 */
function resolve(epKey) {
  const d = described.get(String(epKey));
  const hasInfo = !!(d && (d.date || d.title));

  if (d?.date) {
    if (byDate.has(d.date)) { how.date++; return byDate.get(d.date); }
    why.push(`n°${epKey} : date ${d.date} absente du mur`);
  }
  if (d?.title) {
    const hit = byTitle.get(normTitle(d.title));
    if (hit) { how.titre++; return hit; }
    // Titles get reworded between the feed and a local file; allow strong
    // word overlap, but require it to be strong and unambiguous.
    const want = new Set(normTitle(d.title).split(' ').filter((w) => w.length > 3));
    if (want.size >= 2) {
      let best = null, bestScore = 0, runnerUp = 0;
      for (const e of wall) {
        const got = new Set(normTitle(e.title).split(' ').filter((w) => w.length > 3));
        const shared = [...want].filter((w) => got.has(w)).length;
        const score = shared / Math.min(want.size, got.size);   // couverture du plus court
        if (score > bestScore) { runnerUp = bestScore; bestScore = score; best = e; }
        else if (score > runnerUp) runnerUp = score;
      }
      if (bestScore >= 0.75 && bestScore - runnerUp >= 0.15) { how.titre++; return best; }
      why.push(`n°${epKey} : titre « ${String(d.title).slice(0, 45)} » sans correspondance nette (meilleur score ${bestScore.toFixed(2)})`);
    }
  }

  if (!hasInfo && byNumber.has(Number(epKey))) { how.numero++; return byNumber.get(Number(epKey)); }
  how.aucun++;
  return null;
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
    t REAL NOT NULL, t_end REAL NOT NULL, txt TEXT NOT NULL,
    -- Qui parle, croisé ici depuis les plages de speakers-audio.json.
    -- NULL quand on ne sait pas — et on ne devine jamais : environ un tiers
    -- des passages restent sans nom (animateur de franceinfo, invités,
    -- archives), et c'est voulu.
    qui TEXT
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

const insPassage = db.prepare('INSERT INTO passages (ep, t, t_end, txt, qui) VALUES (?, ?, ?, ?, ?)');
const insEpisode = db.prepare('INSERT OR REPLACE INTO episodes (ep, title, url, youtube, date, n_passages, duration) VALUES (?, ?, ?, ?, ?, ?, ?)');

// --- Qui parle -------------------------------------------------------------
//
// speakers-audio.json donne des PLAGES — { ep, t0, t1, qui } — et non une
// étiquette par passage. C'est délibéré : le découpage en passages est calculé
// ici (PASSAGE_WORDS) et refait à chaque indexation ; des attributions figées
// sur des identifiants de passage seraient périmées au premier changement.
// Les plages, elles, sont dans l'horloge des segments audio et ne bougent pas.
//
// Le croisement se fait donc ici, à chaque construction.
const MIN_OVERLAP = 2;      // secondes : en deçà, le locuteur ne « tient » pas le passage
const MIN_COVERAGE = 0.5;   // il faut que les locuteurs nommés portent la MOITIÉ du passage
const MAX_NAMES = 3;        // au-delà, la mention devient illisible
const toursByEp = new Map();
let toursTotal = 0, toursNamed = 0;
if (speakersPath && existsSync(speakersPath)) {
  const sp = JSON.parse(readFileSync(speakersPath, 'utf8'));
  for (const t of (sp.tours || sp)) {
    const ep = Number(t.ep);
    const t0 = Number(t.t0), t1 = Number(t.t1);
    if (!Number.isFinite(ep) || !Number.isFinite(t0) || !Number.isFinite(t1)) continue;
    toursTotal++;
    const qui = t.qui == null ? null : String(t.qui).trim() || null;
    if (qui) toursNamed++;
    if (!toursByEp.has(ep)) toursByEp.set(ep, []);
    toursByEp.get(ep).push({ t0, t1, qui });
  }
  for (const list of toursByEp.values()) list.sort((a, b) => a.t0 - b.t0);
  console.log(`qui parle : ${toursTotal.toLocaleString('fr-FR')} tours sur ${toursByEp.size} épisodes, dont ${toursNamed.toLocaleString('fr-FR')} nommés`);
} else if (speakersPath) {
  console.log(`qui parle : ${speakersPath} absent — les passages resteront sans nom (c'est sans gravité).`);
}

/**
 * Qui parle pendant [start, end] ? Renvoie « Tristan puis Rudy », ou null.
 * Jamais de remplissage par défaut : sans nom, on n'affiche rien.
 */
function whoSpeaks(tours, start, end) {
  if (!tours || !tours.length) return null;
  const hits = [];
  for (const t of tours) {
    if (t.t0 >= end) break;
    if (!t.qui || t.t1 <= start) continue;
    const overlap = Math.min(t.t1, end) - Math.max(t.t0, start);
    if (overlap > 0) hits.push({ qui: t.qui, overlap, t0: t.t0 });
  }
  if (!hits.length) return null;

  // Le passage cité doit VRAIMENT être de ceux qu'on nomme. Un extrait de
  // soixante mots recouvre presque toujours un bout de plage nommée ; s'en
  // contenter reviendrait à mettre un nom sous une citation qui, pour
  // l'essentiel, est de quelqu'un d'autre — exactement le remplissage par
  // défaut qu'on s'interdit. On exige donc que les locuteurs nommés portent
  // au moins la moitié du passage, faute de quoi on n'affiche rien.
  const span = Math.max(0.001, end - start);
  const covered = hits.reduce((s, h) => s + h.overlap, 0);
  if (covered / span < MIN_COVERAGE) return null;

  let kept = hits.filter((h) => h.overlap >= MIN_OVERLAP);
  if (!kept.length) kept = [hits.reduce((a, b) => (b.overlap > a.overlap ? b : a))];
  kept.sort((a, b) => a.t0 - b.t0);
  const names = [];
  for (const h of kept) if (names[names.length - 1] !== h.qui) names.push(h.qui);
  return names.slice(0, MAX_NAMES).join(' puis ');
}

// Une clé écrite sans accent doit attraper le texte accenté : « kemy » doit
// trouver « Kémy ». JavaScript ne compare pas les lettres accentuées à leur
// équivalent nu, donc chaque voyelle devient une classe de caractères. Sans
// cela une correction peut sembler posée et ne rien faire.
const ACCENTS = { a: 'aàâä', c: 'cç', e: 'eéèêë', i: 'iîï', o: 'oôö', u: 'uùûü', y: 'yÿ' };
const accentClass = (word) => [...word.toLowerCase()]
  .map((ch) => ACCENTS[ch] ? `[${ACCENTS[ch]}]` : ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('');

// Noms propres écrits à l'oreille par la transcription : on les rétablit ici,
// une fois pour toutes, plutôt que de demander au visiteur de deviner la
// graphie. Corrige la recherche ET la citation affichée.
const fixes = [];
if (existsSync(CORRECTIONS_PATH)) {
  const conf = JSON.parse(readFileSync(CORRECTIONS_PATH, 'utf8')).confirme || {};
  for (const [wrong, right] of Object.entries(conf)) {
    // Pas de \b : en JavaScript, une frontière de mot ne connaît que
    // [A-Za-z0-9_]. « Rochatoudé » finit par une lettre accentuée, donc \b
    // n'y voit aucune frontière et la correction ne s'appliquait jamais —
    // silencieusement. On délimite donc par « pas une lettre, pas un
    // chiffre », ce qui accepte les accents des deux côtés.
    fixes.push({
      re: new RegExp(`(?<![\\p{L}\\p{N}_])${accentClass(wrong)}(?![\\p{L}\\p{N}_])`, 'giu'),
      right, wrong, n: 0,
    });
  }
  if (fixes.length) console.log(`${fixes.length} correction(s) de nom propre chargée(s)`);
}
const applyFixes = (txt) => {
  for (const f of fixes) txt = txt.replace(f.re, () => { f.n++; return f.right; });
  return txt;
};

let totalPassages = 0, totalWords = 0, namedPassages = 0;
const unmatched = [], renumbered = [];
const resolved = new Map();   // numéro des transcriptions → épisode du mur
db.exec('BEGIN');
for (const [ep, segs] of [...byEp.entries()].sort((a, b) => a[0] - b[0])) {
  // Resolve first: everything below is stored under the wall's number, so the
  // site and the search always designate the same episode.
  const e = resolve(ep);
  if (!e) {
    // Skip rather than guess. An unattached episode indexed under an
    // arbitrary number would collide with a real one and show its title.
    unmatched.push(ep);
    continue;
  }
  resolved.set(ep, e);
  const num = e.n;
  if (num !== ep) renumbered.push(`${ep}→${num}`);

  segs.sort((a, b) => Number(a.t) - Number(b.t));
  // Les plages de locuteurs portent le numéro d'épisode de segments-audio.json,
  // c'est-à-dire `ep` — pas `num`, qui est la numérotation du mur.
  const tours = toursByEp.get(ep) || null;
  let buf = [], start = null, end = null, words = 0, n = 0;
  const flush = () => {
    if (!buf.length) return;
    const txt = applyFixes(buf.join(' ').replace(/\s+/g, ' ').trim());
    if (txt) {
      const qui = whoSpeaks(tours, start, end);
      if (qui) namedPassages++;
      insPassage.run(num, start, end, txt, qui);
      n++; totalPassages++;
    }
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
  insEpisode.run(num, e?.title ?? null, e?.url ?? null, e?.youtube ?? null, e?.date ?? null, n, end || 0);
}
db.exec('COMMIT');

// La correspondance audio → vidéo, calculée par align-video.mjs. Les plages
// portent le numéro d'épisode des transcriptions ; on les réécrit sous celui
// du mur, comme tout le reste, pour que site et recherche désignent le même
// épisode. Une plage dont l'épisode n'a pas de jumeau est ignorée.
if (videoMapPath && existsSync(videoMapPath)) {
  const vm = JSON.parse(readFileSync(videoMapPath, 'utf8'));
  const insMap = db.prepare('INSERT INTO video_map (ep, a0, a1, v_offset) VALUES (?, ?, ?, ?)');
  let rows = 0, eps = new Set();
  db.exec('BEGIN');
  for (const r of (vm.map || vm)) {
    // On réutilise les correspondances déjà établies pour l'audio plutôt que
    // de rappeler resolve() : d'une part cela fausserait le compte affiché
    // au-dessus, d'autre part un épisode filmé qui n'aurait pas d'audio
    // indexé n'a de toute façon aucun passage où poser un minutage.
    const e = resolved.get(Number(r.ep));
    if (!e) continue;
    insMap.run(e.n, Number(r.a0), Number(r.a1), Number(r.v_offset));
    eps.add(e.n); rows++;
  }
  db.exec('COMMIT');
  console.log(`audio → vidéo : ${rows} plages sur ${eps.size} épisodes filmés`);
} else if (videoMapPath) {
  console.log(`audio → vidéo : ${videoMapPath} absent — le mur dira « voir la vidéo » sans minutage.`);
}

if (toursTotal) {
  const pct = totalPassages ? Math.round((namedPassages / totalPassages) * 100) : 0;
  console.log(`qui parle : ${namedPassages.toLocaleString('fr-FR')} passages nommés sur ${totalPassages.toLocaleString('fr-FR')} (${pct} %) — le reste reste volontairement vide`);
}

console.log(`correspondance épisodes : ${how.date} par date · ${how.titre} par titre · ${how.numero} par numéro · ${how.aucun} sans correspondance`);
if (renumbered.length) console.log(`  renumérotés pour coller au mur : ${renumbered.slice(0, 15).join(', ')}${renumbered.length > 15 ? '…' : ''}`);
if (why.length) {
  console.log(`  épisodes non rattachés — non indexés, à réconcilier :`);
  for (const w of why.slice(0, 20)) console.log(`    ${w}`);
  if (why.length > 20) console.log(`    … et ${why.length - 20} autres`);
}

// The `ep` numbers in segments.json come from Tristan's local pipeline; the
// wall numbers episodes from the "100e Complorama" anchor. If the two ever
// drift apart every result would show the wrong title — silently. So say so
// loudly instead: a handful of gaps is normal (an episode not transcribed),
// a majority means the numbering does not line up and must be reconciled.
if (wall.length && unmatched.length) {
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
// Vocabulaire matérialisé : le moteur s'en sert quand une recherche ne donne
// rien, pour proposer les graphies voisines réellement présentes. fts5vocab
// est une table virtuelle, qu'on ne peut pas interroger depuis une connexion
// en lecture seule — d'où cette copie en dur.
db.exec("CREATE VIRTUAL TABLE temp.v USING fts5vocab('main', 'passages_fts', 'row')");
db.exec('CREATE TABLE vocab (term TEXT PRIMARY KEY, doc INTEGER NOT NULL, len INTEGER NOT NULL)');
db.exec('INSERT INTO vocab SELECT term, doc, length(term) FROM temp.v WHERE length(term) >= 4');
db.exec('CREATE INDEX idx_vocab_len ON vocab(len)');
const vocabCount = db.prepare('SELECT count(*) c FROM vocab').get().c;

if (fixes.length) {
  for (const f of fixes) console.log(`  « ${f.wrong} » → « ${f.right} » : ${f.n} remplacement(s)`);
}
console.log(`vocabulaire : ${vocabCount.toLocaleString('fr-FR')} mots d'au moins 4 lettres`);

db.exec('VACUUM');
db.close();

console.log(`${byEp.size} épisodes · ${totalPassages.toLocaleString('fr-FR')} passages · ${totalWords.toLocaleString('fr-FR')} mots`);
console.log(`→ ${outPath} (${(statSync(outPath).size / 1048576).toFixed(1)} Mo)`);
