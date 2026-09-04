// Ouvre un ticket GitHub par nouvel épisode (ou nouvelle vidéo) à transcrire.
//
//   node scripts/open-transcription-issues.mjs [sync-report.json]
//
// C'est le maillon qui rend la chaîne autonome. Sans lui, la synchronisation
// voit passer un épisode, l'ajoute au mur, et personne n'apprend jamais qu'il
// reste à le transcrire : la recherche prend du retard en silence.
//
// Avec lui : la synchronisation ouvre un ticket, GitHub envoie le mail à
// Tristan, la session Mac lit le ticket, fait le travail et le referme.
// Aucun copier-coller pour personne.
//
// Le corps du ticket est écrit pour être SUFFISANT À LUI SEUL : la session
// qui le lit n'a pas cette conversation en mémoire. Tout ce qu'il faut y est
// — quoi télécharger, comment nommer, où déposer, quoi refermer.
//
// Idempotent : deux passes par jour, et le même épisode reste dans le flux RSS
// pendant des semaines. On ne rouvre jamais un ticket déjà ouvert pour le même
// épisode, et on ne rouvre pas un ticket déjà fermé — la clé est l'URL Radio
// France, inscrite en clair dans le corps.

import { readFile } from 'node:fs/promises';

const API = 'https://api.github.com';
const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const LABEL = 'transcription';

const die = (m) => { console.error(`✗ ${m}`); process.exit(1); };
if (!repo) die('GITHUB_REPOSITORY absent');
if (!token) die('GITHUB_TOKEN absent');

async function api(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'x-github-api-version': '2022-11-28',
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) throw new Error(`${init.method || 'GET'} ${path} → ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

/** Le marqueur qui rend un ticket reconnaissable sans dépendre de son titre. */
const marker = (key) => `<!-- complorama:${key} -->`;

/** Les clés déjà présentes, tickets ouverts ET fermés. */
async function knownKeys() {
  const keys = new Set();
  for (let page = 1; page <= 10; page++) {
    const issues = await api(`/repos/${repo}/issues?state=all&labels=${LABEL}&per_page=100&page=${page}`);
    if (!issues.length) break;
    for (const i of issues) {
      for (const m of String(i.body || '').matchAll(/<!-- complorama:([^ ]+) -->/g)) keys.add(m[1]);
    }
    if (issues.length < 100) break;
  }
  return keys;
}

/** Le label doit exister avant d'être posé sur un ticket. */
async function ensureLabel() {
  try {
    await api(`/repos/${repo}/labels/${LABEL}`);
  } catch {
    await api(`/repos/${repo}/labels`, {
      method: 'POST',
      body: JSON.stringify({
        name: LABEL,
        color: '5319e7',
        description: 'Un épisode ou une vidéo attend sa transcription',
      }),
    });
    console.log(`Label « ${LABEL} » créé.`);
  }
}

const corpsEpisode = (e) => `${marker(e.url)}
**${e.title}**

| | |
|---|---|
| Épisode | n°${e.n} |
| Diffusion | ${e.date} |
| Page Radio France | ${e.url} |
| Vidéo YouTube | ${e.youtube ? e.youtube : '— (aucune pour l’instant ; un second ticket sera ouvert si elle paraît)'} |

### À faire (session Claude sur le Mac de Tristan)

1. Télécharger l’audio de l’épisode depuis la page Radio France ci-dessus${e.youtube ? ', et la vidéo YouTube' : ''}.
2. Transcrire avec la chaîne Whisper habituelle, en passant l’\`initial_prompt\`
   qui contient les noms du champ (Meyssan, Soral, Chouard, Raoult, Casasnovas,
   Perronne, Faurisson, Rassinier, Reynouard, Daillet, Azalbert, QAnon,
   Bilderberg, adrénochrome…). Il évite que les noms propres soient écrits à
   l’oreille — c’est le problème qu’on a passé des heures à réparer après coup.
3. Ajouter les segments au fichier existant, **sans le réécrire entièrement** :
   \`complorama/data/segments-audio.json\` (et \`segments-video.json\` s’il y a
   une vidéo), déposés par SFTP avec l’accès \`ovhftp\` habituel.
   Format : \`{"episodes":[…],"segments":[{"id","ep","t","t_fin","txt"},…]}\`
   avec \`ep\` = ${e.n} et une \`date\` d’épisode à \`${e.date}\` — **c’est la date
   qui sert au rattachement**, pas le numéro.
4. Refermer ce ticket.

Ensuite, côté GitHub : relancer le workflow **Complorama · Indexer les
transcriptions** en cochant « Déployer ». Rien d’autre.

*Ticket ouvert automatiquement par la synchronisation Complorama.*`;

const corpsVideo = (v) => `${marker(v.youtube)}
**${v.title}**

Une vidéo YouTube vient d’être rattachée à un épisode déjà publié :
${v.youtube}

### À faire (session Claude sur le Mac de Tristan)

1. Télécharger la vidéo et la transcrire avec la chaîne Whisper habituelle.
2. Déposer les segments dans \`complorama/data/segments-video.json\` par SFTP.
   Même format que l’audio, **et surtout la même horloge** : c’est ce qui
   permettra plus tard de calculer la correspondance moment audio → moment
   vidéo.
3. Refermer ce ticket.

À noter : l’audio est la version longue, la vidéo un montage raccourci. Seul
l’audio est indexé — la vidéo ne sert qu’à calculer le minutage. Tant que ce
fichier n’existe pas, le mur affiche « voir la vidéo » sans minutage, ce qui
est correct : il ne prétend pas qu’un passage a été coupé au montage.

*Ticket ouvert automatiquement par la synchronisation Complorama.*`;

async function main() {
  const path = process.argv[2] || process.env.SYNC_REPORT || 'sync-report.json';
  let report;
  try {
    report = JSON.parse(await readFile(path, 'utf8'));
  } catch {
    console.log(`Aucun rapport à ${path} — rien à signaler.`);
    return;
  }

  const episodes = report.episodes || [];
  const videos = report.videos || [];
  if (!episodes.length && !videos.length) {
    console.log('Rien de nouveau — aucun ticket à ouvrir.');
    return;
  }

  await ensureLabel();
  const known = await knownKeys();
  let opened = 0;

  for (const e of episodes) {
    if (known.has(e.url)) { console.log(`Déjà signalé : ${e.title}`); continue; }
    const issue = await api(`/repos/${repo}/issues`, {
      method: 'POST',
      body: JSON.stringify({
        title: `Épisode ${String(e.n).padStart(3, '0')} à transcrire — ${e.title}`,
        body: corpsEpisode(e),
        labels: [LABEL],
      }),
    });
    console.log(`✓ ticket #${issue.number} — ${e.title}`);
    opened++;
  }

  for (const v of videos) {
    if (known.has(v.youtube)) { console.log(`Déjà signalé (vidéo) : ${v.title}`); continue; }
    const issue = await api(`/repos/${repo}/issues`, {
      method: 'POST',
      body: JSON.stringify({
        title: `Vidéo à transcrire — ${v.title}`,
        body: corpsVideo(v),
        labels: [LABEL],
      }),
    });
    console.log(`✓ ticket #${issue.number} — vidéo de « ${v.title} »`);
    opened++;
  }

  console.log(opened ? `${opened} ticket(s) ouvert(s).` : 'Tout était déjà signalé.');
}

main().catch((e) => { console.error(e.message); process.exit(1); });
