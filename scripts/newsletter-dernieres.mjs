// Écrit newsletter/dernieres.json : les trois dernières lettres de la newsletter
// Substack (newsletter.tristan.pro), pour le bloc « Abonnez-vous » de l'accueil.
// Images copiées dans newsletter/img/ : la page ne charge rien depuis Substack
// (règle du site : aucun domaine tiers). Lancé par le workflow « Newsletter ·
// dernières lettres ». Idempotent : rien ne change si aucune lettre n'est parue.
//   node scripts/newsletter-dernieres.mjs
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';

const FEED = 'https://newsletter.tristan.pro/feed';
const N = 3;

const res = await fetch(FEED, { headers: { 'user-agent': 'tristan.pro (newsletter-dernieres)' } });
if (!res.ok) throw new Error(`Flux Substack : HTTP ${res.status}`);
const xml = await res.text();

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', rsquo: '’', lsquo: '‘', laquo: '«', raquo: '»', ndash: '–', mdash: '—' };
const decode = (s) => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-z]+);/gi, (m, n) => ENT[n] ?? m)
  .trim();
const tag = (item, name) => { const m = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`)); return m ? decode(m[1]) : ''; };

// « Coming soon » : la lettre d'attente que Substack crée à l'ouverture.
const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1])
  .filter((it) => !/^coming soon$/i.test(tag(it, 'title')))
  .slice(0, N);

await mkdir('newsletter/img', { recursive: true });
const lettres = [];
for (const it of items) {
  const url = tag(it, 'link');
  const slug = url.split('/p/')[1]?.replace(/[^a-z0-9-]/gi, '') || String(lettres.length);
  const date = new Date(tag(it, 'pubDate')).toISOString().slice(0, 10);
  let img = null;
  const enc = it.match(/<enclosure url="([^"]+)"/);
  if (enc) {
    // Le CDN de Substack redimensionne à la demande : 600 px de large suffisent.
    const src = enc[1].replace(/&amp;/g, '&').replace(',f_auto,', ',w_600,c_limit,f_jpg,');
    const file = `newsletter/img/${slug}.jpg`;
    try {
      const r = await fetch(src);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await writeFile(file, Buffer.from(await r.arrayBuffer()));
      img = '/' + file;
    } catch (e) { console.warn(`  image de « ${slug} » non copiée : ${e.message}`); }
  }
  lettres.push({ titre: tag(it, 'title'), resume: tag(it, 'description'), date, url, img });
}

// On ne garde que les images des lettres affichées.
const gardees = new Set(lettres.map((l) => l.img && l.img.split('/').pop()));
for (const f of await readdir('newsletter/img')) if (!gardees.has(f)) await rm(`newsletter/img/${f}`);

await writeFile('newsletter/dernieres.json', JSON.stringify({ lettres }, null, 2) + '\n');
for (const l of lettres) console.log(`✓ ${l.date} « ${l.titre} »${l.img ? '' : ' (sans image)'}`);
