// Look at what a remote page or feed actually contains — read-only, no commit.
//
//   node scripts/page-inspect.mjs <url> [regex]
//
// The Claude web sandbox cannot reach radiofrance.fr, youtube.com or any
// outside host; the GitHub runner can. This prints the things worth knowing
// before wiring anything to a third-party page:
//
//   • status, content type, size, redirect chain
//   • HTML: <title>, og:/twitter: meta, <iframe> sources, media URLs
//     (.mp3/.m3u8/.aac/.mp4), and every JSON-LD block — including
//     potentialAction/SeekToAction, which is where a site declares the URL
//     format that jumps to a timestamp
//   • RSS/XML: item count, date range, <enclosure> media URLs, and any
//     Podcasting 2.0 <podcast:transcript> tag
//   • the case-insensitive [regex], with surrounding context
//
// Fetched with a browser User-Agent: several hosts (including OVH's
// anti-robot rule) answer 403 to curl-looking clients.

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const [, , url, pattern] = process.argv;
if (!url || !/^https?:\/\//.test(url)) { console.error('✗ usage: page-inspect.mjs <url> [regex]'); process.exit(1); }

const h = (t) => console.log(`\n${'═'.repeat(70)}\n${t}\n${'═'.repeat(70)}`);
const clip = (s, n = 200) => { const t = String(s).replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n) + '…' : t; };

let res, body;
try {
  res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'fr-FR,fr;q=0.9' }, redirect: 'follow' });
  body = await res.text();
} catch (e) {
  // A freshly created subdomain has no certificate for a few minutes, and a
  // raw Node fetch failure dumps the whole certificate chain. Say what
  // happened in one line instead.
  const cause = String(e?.cause?.code || e?.cause?.message || e?.message || e);
  console.log(`\n✗ impossible de charger ${url}\n  ${cause}`);
  if (/CERT|ALT_NAME|SELF_SIGNED|UNABLE_TO_VERIFY/i.test(cause)) console.log('  → certificat absent ou ne couvrant pas ce nom : normal juste après la création d\'un sous-domaine, réessayer dans quelques minutes.');
  if (/ENOTFOUND|EAI_AGAIN/i.test(cause)) console.log('  → nom inconnu du DNS : propagation en cours, ou enregistrement manquant.');
  if (/ECONNREFUSED|ETIMEDOUT/i.test(cause)) console.log('  → rien n\'écoute sur ce port.');
  process.exit(0);
}
const type = res.headers.get('content-type') || '';

h(`1 · Réponse`);
console.log(`  ${res.status} ${res.statusText}   ${type}   ${(body.length / 1024).toFixed(1)} Ko`);
if (res.url !== url) console.log(`  redirigé vers : ${res.url}`);
if (!res.ok) { console.log('\n  ' + clip(body, 400)); process.exit(0); }

const isFeed = /xml|rss/.test(type) || /^\s*<\?xml/.test(body);

if (isFeed) {
  h('2 · Flux');
  const items = body.match(/<item\b[\s\S]*?<\/item>/g) || [];
  console.log(`  ${items.length} <item>`);
  const dates = [...body.matchAll(/<pubDate>([^<]+)<\/pubDate>/g)].map((m) => m[1]);
  if (dates.length) console.log(`  du plus récent : ${dates[0]}\n  au plus ancien : ${dates[dates.length - 1]}`);

  const enclosures = [...body.matchAll(/<enclosure[^>]*url="([^"]+)"[^>]*>/g)].map((m) => m[1]);
  console.log(`\n  ${enclosures.length} <enclosure> (fichier audio téléchargeable)`);
  for (const e of enclosures.slice(0, 3)) console.log(`    ${e}`);
  if (enclosures.length > 3) console.log(`    … et ${enclosures.length - 3} autres`);

  const transcripts = [...body.matchAll(/<podcast:transcript[^>]*>/g)].map((m) => m[0]);
  console.log(`\n  <podcast:transcript> (transcription officielle) : ${transcripts.length || 'aucune'}`);
  for (const t of transcripts.slice(0, 3)) console.log(`    ${clip(t, 240)}`);

  const chapters = [...body.matchAll(/<podcast:chapters[^>]*>/g)].map((m) => m[0]);
  if (chapters.length) { console.log(`\n  <podcast:chapters> : ${chapters.length}`); for (const c of chapters.slice(0, 2)) console.log(`    ${clip(c, 240)}`); }

  if (items[0]) {
    console.log('\n  premier item, balises présentes :');
    console.log('    ' + [...new Set([...items[0].matchAll(/<([a-zA-Z][\w:.-]*)/g)].map((m) => m[1]))].join(', '));
  }
} else {
  h('2 · Page');
  const title = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  console.log(`  <title> : ${title ? clip(title[1]) : '—'}`);

  const metas = [...body.matchAll(/<meta[^>]+(?:property|name)="((?:og|twitter|music|video):[^"]+)"[^>]*content="([^"]*)"/g)];
  if (metas.length) { console.log('\n  méta sociales :'); for (const [, k, v] of metas.slice(0, 18)) console.log(`    ${k.padEnd(24)} ${clip(v, 120)}`); }

  const frames = [...body.matchAll(/<iframe[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  if (frames.length) { console.log(`\n  <iframe> (${frames.length}) :`); for (const f of [...new Set(frames)].slice(0, 8)) console.log(`    ${clip(f, 160)}`); }

  const media = [...new Set((body.match(/https?:\/\/[^"'\s\\]+\.(?:mp3|m3u8|aac|mp4)(?:\?[^"'\s\\]*)?/g) || []))];
  console.log(`\n  URL de média trouvées (${media.length}) :`);
  for (const m of media.slice(0, 6)) console.log(`    ${clip(m, 200)}`);

  const lds = [...body.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  console.log(`\n  blocs JSON-LD : ${lds.length}`);
  for (const [, raw] of lds) {
    let data; try { data = JSON.parse(raw.trim()); } catch { console.log('    (JSON illisible)'); continue; }
    for (const node of (Array.isArray(data) ? data : [data])) {
      const keep = {};
      for (const k of ['@type', 'name', 'duration', 'uploadDate', 'datePublished', 'contentUrl', 'embedUrl', 'url', 'potentialAction', 'associatedMedia', 'hasPart']) if (node[k] !== undefined) keep[k] = node[k];
      console.log('    ' + clip(JSON.stringify(keep), 600));
    }
  }

  // A site that supports "jump to a timestamp" usually says so here.
  h('3 · Indices de saut à un minutage');
  for (const probe of ['SeekToAction', 'startOffset', 'startTime', 'seekTo', 'timecode', 'timestamp', '#t=', '?t=', '&t=']) {
    const n = (body.match(new RegExp(probe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
    if (n) console.log(`  « ${probe} » : ${n} occurrence(s)`);
  }
  if (!/SeekToAction|startOffset/i.test(body)) console.log('  aucun marqueur schema.org de saut au minutage dans le HTML servi');
}

if (pattern) {
  h(`4 · Motif « ${pattern} »`);
  const re = new RegExp(pattern, 'gi');
  let m, n = 0;
  while ((m = re.exec(body)) && n < 12) { console.log(`  …${clip(body.slice(Math.max(0, m.index - 90), m.index + 150), 260)}…`); n++; if (m.index === re.lastIndex) re.lastIndex++; }
  if (!n) console.log('  aucune occurrence');
}
console.log('');
