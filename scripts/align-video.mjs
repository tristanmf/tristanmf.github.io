// Où retrouver, dans la vidéo, un moment de l'audio ?
//
//   node scripts/align-video.mjs <segments-audio.json> <segments-video.json> <out.json>
//
// L'audio et la vidéo ne sont pas le même montage : l'audio est la version
// longue (~30 min), la vidéo un montage raccourci (~20 min). Les deux ont été
// transcrits séparément. On ne peut donc pas se contenter d'un décalage
// constant — il faut retrouver, morceau par morceau, ce qui a survécu au
// montage.
//
// MÉTHODE — on aligne par le texte, pas par le son.
//
// 1. On réduit chaque transcription à une suite de mots normalisés, chacun
//    portant son horodatage.
// 2. On construit les n-grammes de N mots. On ne garde que ceux qui sont
//    UNIQUES des deux côtés : un n-gramme répété ne dit pas où l'on est.
//    Ceux-là donnent des ancres sûres (temps audio ↔ temps vidéo).
// 3. Les ancres bruitées sont écartées par une plus longue sous-suite
//    croissante : le montage coupe, il ne réordonne pas. Une ancre qui ferait
//    reculer la vidéo est une coïncidence, pas une correspondance.
// 4. Les ancres consécutives de même décalage sont regroupées en plages
//    { a0, a1, v_offset } : dans [a0, a1), moment vidéo = moment audio + offset.
//
// Ce qui n'est couvert par aucune plage a été coupé au montage — et c'est
// désormais une CONSTATATION, pas une supposition. C'est toute la différence :
// tant que cette table était vide, le mur disait « voir la vidéo » sans
// minutage, et se gardait bien de prétendre qu'un passage avait été coupé.

import { readFileSync, writeFileSync } from 'node:fs';

const N = 6;             // longueur des n-grammes servant d'ancre
const TOL = 1.5;         // s — écart d'offset toléré à l'intérieur d'une plage
const MIN_ANCHORS = 3;   // en deçà, on ne publie pas la plage
const PAD = 0.75;        // s — marge ajoutée de part et d'autre d'une plage

const [, , audioPath, videoPath, outPath] = process.argv;
const die = (m) => { console.error(`✗ ${m}`); process.exit(1); };
if (!audioPath || !videoPath || !outPath) {
  die('usage: align-video.mjs <segments-audio.json> <segments-video.json> <out.json>');
}

const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();

/** Les mots d'un épisode, chacun avec son instant estimé. */
function words(segments) {
  const out = [];
  for (const s of segments) {
    const txt = norm(s.txt || '');
    if (!txt) continue;
    const t0 = Number(s.t) || 0;
    const t1 = Number(s.t_fin ?? s.t) || t0;
    const ws = txt.split(' ');
    // Whisper date le segment, pas le mot : on répartit uniformément à
    // l'intérieur. L'erreur est de l'ordre de la seconde, largement sous la
    // tolérance, et elle se compense sur un n-gramme de six mots.
    for (const [i, w] of ws.entries()) {
      out.push({ w, t: t0 + ((t1 - t0) * i) / Math.max(1, ws.length) });
    }
  }
  return out;
}

/** Les n-grammes qui n'apparaissent qu'une fois — les seuls exploitables. */
function uniqueGrams(ws) {
  const seen = new Map();
  for (let i = 0; i + N <= ws.length; i++) {
    const key = ws.slice(i, i + N).map((x) => x.w).join(' ');
    if (seen.has(key)) seen.set(key, null);       // vu deux fois : inutilisable
    else seen.set(key, ws[i].t);
  }
  const out = new Map();
  for (const [k, v] of seen) if (v !== null) out.set(k, v);
  return out;
}

/** Plus longue sous-suite strictement croissante en temps vidéo. */
function longestIncreasing(anchors) {
  if (!anchors.length) return [];
  const tails = [], prev = new Array(anchors.length).fill(-1);
  for (let i = 0; i < anchors.length; i++) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (anchors[tails[mid]].v < anchors[i].v) lo = mid + 1; else hi = mid;
    }
    prev[i] = lo > 0 ? tails[lo - 1] : -1;
    if (lo === tails.length) tails.push(i); else tails[lo] = i;
  }
  const out = [];
  for (let i = tails[tails.length - 1]; i !== -1; i = prev[i]) out.push(anchors[i]);
  return out.reverse();
}

/** Les plages { a0, a1, v_offset } d'un épisode. */
function alignEpisode(audioSegs, videoSegs) {
  const A = words(audioSegs), V = words(videoSegs);
  if (A.length < N * 4 || V.length < N * 4) return { rows: [], anchors: 0 };

  const gv = uniqueGrams(V);
  const ga = uniqueGrams(A);
  const anchors = [];
  for (const [key, a] of ga) {
    const v = gv.get(key);
    if (v !== undefined) anchors.push({ a, v });
  }
  anchors.sort((x, y) => x.a - y.a);
  const kept = longestIncreasing(anchors);

  // Regroupement : tant que le décalage reste le même à TOL près, on est dans
  // le même morceau de montage.
  const rows = [];
  let run = [];
  const flush = () => {
    if (run.length < MIN_ANCHORS) { run = []; return; }
    const offsets = run.map((r) => r.v - r.a).sort((x, y) => x - y);
    const median = offsets[offsets.length >> 1];
    rows.push({
      a0: Math.max(0, run[0].a - PAD),
      a1: run[run.length - 1].a + PAD,
      v_offset: Math.round(median * 100) / 100,
    });
    run = [];
  };
  for (const anchor of kept) {
    const off = anchor.v - anchor.a;
    if (!run.length) { run.push(anchor); continue; }
    const cur = run.map((r) => r.v - r.a).sort((x, y) => x - y)[run.length >> 1];
    if (Math.abs(off - cur) <= TOL) run.push(anchor);
    else { flush(); run.push(anchor); }
  }
  flush();

  // Deux plages voisines de même décalage n'en font qu'une.
  const merged = [];
  for (const r of rows) {
    const last = merged[merged.length - 1];
    if (last && Math.abs(last.v_offset - r.v_offset) <= TOL && r.a0 - last.a1 <= 2 * PAD + 1) {
      last.a1 = r.a1;
    } else merged.push(r);
  }
  return { rows: merged, anchors: kept.length };
}

// --- Main ------------------------------------------------------------------

const groupByEp = (raw) => {
  const segments = raw.segments || raw;
  const m = new Map();
  for (const s of segments) {
    const ep = Number(s.ep);
    if (!Number.isFinite(ep)) continue;
    if (!m.has(ep)) m.set(ep, []);
    m.get(ep).push(s);
  }
  for (const list of m.values()) list.sort((a, b) => Number(a.t) - Number(b.t));
  return m;
};

const audio = groupByEp(JSON.parse(readFileSync(audioPath, 'utf8')));
const video = groupByEp(JSON.parse(readFileSync(videoPath, 'utf8')));
console.log(`audio : ${audio.size} épisodes · vidéo : ${video.size} épisodes`);

const out = [];
const faibles = [];
for (const ep of [...video.keys()].sort((a, b) => a - b)) {
  if (!audio.has(ep)) { faibles.push(`${ep} : pas d'audio`); continue; }
  const { rows, anchors } = alignEpisode(audio.get(ep), video.get(ep));
  const audioEnd = audio.get(ep).reduce((m, s) => Math.max(m, Number(s.t_fin ?? s.t) || 0), 0);
  const covered = rows.reduce((s, r) => s + (r.a1 - r.a0), 0);
  const pct = audioEnd ? Math.round((covered / audioEnd) * 100) : 0;
  // Un épisode mal aligné est un épisode qu'on ne publie pas : mieux vaut
  // « voir la vidéo » sans minutage qu'un minutage faux.
  if (rows.length < 2 || pct < 25) {
    faibles.push(`${ep} : ${anchors} ancres, ${pct} % couvert — écarté`);
    continue;
  }
  for (const r of rows) out.push({ ep, ...r });
  console.log(`  ép. ${String(ep).padStart(3, '0')} · ${String(rows.length).padStart(3)} plages · ${String(anchors).padStart(4)} ancres · ${String(pct).padStart(3)} % de l'audio retrouvé dans la vidéo`);
}

if (faibles.length) {
  console.log(`\népisodes écartés (${faibles.length}) — le mur dira « voir la vidéo » sans minutage :`);
  for (const f of faibles) console.log(`  ${f}`);
}

writeFileSync(outPath, JSON.stringify({ map: out }, null, 2));
console.log(`\n${out.length} plages écrites dans ${outPath}`);
