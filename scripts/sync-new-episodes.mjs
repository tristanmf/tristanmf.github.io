// Fetch the Radio France RSS feed for Complorama, append any new episodes
// to complorama/episodes-data.js, and back-fill missing YouTube links by
// matching titles against the YouTube playlist RSS feed.
//
// Idempotent: episodes already present (matched by Radio France URL) are
// skipped. Designed to be run by a GitHub Actions cron — keeps to Node
// built-ins so no `npm install` step is needed.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, 'complorama/episodes-data.js');

const RSS_URL = 'https://radiofrance-podcast.net/podcast09/podcast_adc482ba-ae2e-47ec-adda-4838cd022cd4.xml';
const YT_PLAYLIST_RSS = 'https://www.youtube.com/feeds/videos.xml?playlist_id=PLg6GanYvTasWMem6U2VUxc9sQ6a7T7sIe';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/xml, text/xml, */*' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return await res.text();
}

// --- Tiny XML helpers ----------------------------------------------------
// We don't pull in a parser; RSS/Atom shape is regular enough for regex
// extraction provided we decode entities and strip CDATA.

function stripCdata(s) {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}
function clean(s) { return decodeEntities(stripCdata(s)).trim(); }

function extractTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? clean(m[1]) : null;
}
function extractAttr(block, tag, attr) {
  const m = block.match(new RegExp(`<${tag}[^>]*\\b${attr}=["']([^"']+)["']`, 'i'));
  return m ? clean(m[1]) : null;
}

// --- RSS parsing ---------------------------------------------------------

function parseRssItems(xml) {
  const items = [];
  for (const m of xml.matchAll(/<item[\s\S]*?<\/item>/g)) {
    const block = m[0];
    const title = extractTag(block, 'title');
    const link = extractTag(block, 'link');
    const pubDate = extractTag(block, 'pubDate');
    const image = extractAttr(block, 'itunes:image', 'href')
               || extractAttr(block, 'media:thumbnail', 'url')
               || extractAttr(block, 'media:content', 'url');
    if (title && link) items.push({ title, link, pubDate, image });
  }
  return items;
}

function parseYoutubePlaylist(xml) {
  const videos = [];
  for (const m of xml.matchAll(/<entry>[\s\S]*?<\/entry>/g)) {
    const block = m[0];
    const title = extractTag(block, 'title');
    const videoId = extractTag(block, 'yt:videoId');
    if (title && videoId) {
      videos.push({ title, url: `https://www.youtube.com/watch?v=${videoId}` });
    }
  }
  return videos;
}

// --- Title normalization for fuzzy matching -----------------------------

function normalizeTitle(s) {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')          // strip accents
    .replace(/^complorama\s*[:.\-—]?\s*/i, '')                 // strip "Complorama :" prefix
    .replace(/^podcast\s*[:.\-—]?\s*/i, '')                    // strip "PODCAST." prefix
    .replace(/[^a-z0-9 ]+/g, ' ')                              // strip punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

function findYoutubeMatch(episodeTitle, ytIndex) {
  const epNorm = normalizeTitle(episodeTitle);
  if (epNorm.length < 8) return null; // too short to match safely

  // Pass 1: exact normalized equality
  const exact = ytIndex.find(v => normalizeTitle(v.title) === epNorm);
  if (exact) return exact.url;

  // Pass 2: one is contained in the other (long enough overlap to avoid false positives)
  for (const v of ytIndex) {
    const ytNorm = normalizeTitle(v.title);
    if (ytNorm.length < 8) continue;
    if (ytNorm.includes(epNorm) || epNorm.includes(ytNorm)) {
      // Only accept if the shared substring is at least 70% of the shorter title
      const minLen = Math.min(epNorm.length, ytNorm.length);
      const maxLen = Math.max(epNorm.length, ytNorm.length);
      if (minLen / maxLen >= 0.7) return v.url;
    }
  }

  return null;
}

// --- File patching -------------------------------------------------------

function existingUrls(src) {
  const urls = new Set();
  for (const m of src.matchAll(/url:\s*"([^"]+)"/g)) urls.add(m[1]);
  return urls;
}

function existingNormalizedTitles(src) {
  // Primary dedup signal — Radio France serves the same episode under both
  // www.radiofrance.fr/franceinfo/podcasts/... and www.franceinfo.fr/replay-
  // radio/... URLs, so URL-based dedup alone is not enough.
  const set = new Set();
  for (const m of src.matchAll(/title:\s*"((?:[^"\\]|\\.)*)"/g)) {
    try {
      const decoded = JSON.parse(`"${m[1]}"`);
      set.add(normalizeTitle(decoded));
    } catch { /* skip malformed */ }
  }
  return set;
}

function existingImageUuids(src) {
  // Track every UUID we've already mirrored or referenced, in any form:
  // - mirrored local path:  assets/episodes/<UUID>.webp
  // - legacy pikapi remote: pikapi.radiofrance.fr/images/<UUID>/...
  // - new s3 cruiser remote: radiofrance.fr/s3/cruiser-production-eu3/.../<UUID>/...
  const set = new Set();
  for (const m of src.matchAll(/assets\/episodes\/([a-f0-9-]{36})\.webp/g)) set.add(m[1]);
  for (const m of src.matchAll(/\/images\/([a-f0-9-]{36})\//g)) set.add(m[1]);
  for (const m of src.matchAll(/\/cruiser-production[^/]*\/\d{4}\/\d{2}\/([a-f0-9-]{36})\//g)) set.add(m[1]);
  return set;
}

// Known UUID of the generic Complorama show artwork that Radio France
// substitutes when an episode has no specific illustration. Re-using it
// would create visually duplicate tiles.
const GENERIC_SHOW_UUID = '39bbb292-d2d5-4b77-9f89-1b320bd4a4a5';

function extractImageUuid(url) {
  const m = url.match(/\/images\/([a-f0-9-]{36})\//)
         || url.match(/\/cruiser-production[^/]*\/\d{4}\/\d{2}\/([a-f0-9-]{36})\//);
  return m ? m[1] : null;
}

// Promo / non-episode items the RSS occasionally carries (e.g. the sticky
// "Retrouvez tous les épisodes sur l'appli Radio France" tile).
function isPromoItem(item) {
  if (!item.link) return true;
  if (!/\/complorama\//i.test(item.link)) return true;
  if (/application-mobile-radio-france/i.test(item.link)) return true;
  return false;
}

function formatEntry(ep) {
  // Match the existing one-line-per-episode style of episodes-data.js.
  const parts = [
    `title: ${JSON.stringify(ep.title)}`,
    `url: ${JSON.stringify(ep.url)}`,
    `img: ${JSON.stringify(ep.img)}`,
    `youtube: ${ep.youtube ? JSON.stringify(ep.youtube) : 'null'}`,
  ];
  return `  { ${parts.join(', ')} },`;
}

function insertNewEpisodes(src, newEps) {
  if (newEps.length === 0) return src;
  // Insert right after the `const RAW_EPISODES = [` line so new items appear
  // at the top of the wall (most-recent-first ordering).
  const anchor = /(const\s+RAW_EPISODES\s*=\s*\[\s*\n)/;
  if (!anchor.test(src)) throw new Error('Could not locate RAW_EPISODES array in episodes-data.js');
  const block = newEps.map(formatEntry).join('\n') + '\n';
  return src.replace(anchor, `$1${block}`);
}

function backfillYoutube(src, ytIndex) {
  // Find every entry where youtube is null and try to populate it.
  // Entry shape (one per line):
  //   { title: "...", url: "...", img: "...", youtube: null },
  let count = 0;
  const updated = src.replace(
    /(\{\s*title:\s*"((?:[^"\\]|\\.)*)"[^}]*?youtube:\s*)null(\s*\})/g,
    (full, prefix, title, suffix) => {
      const decoded = JSON.parse(`"${title}"`);
      const match = findYoutubeMatch(decoded, ytIndex);
      if (!match) return full;
      count++;
      return `${prefix}${JSON.stringify(match)}${suffix}`;
    }
  );
  return { src: updated, backfilled: count };
}

// --- Main ----------------------------------------------------------------

async function main() {
  console.log(`Fetching Radio France RSS: ${RSS_URL}`);
  const rssXml = await fetchText(RSS_URL);
  const rssItems = parseRssItems(rssXml);
  console.log(`Parsed ${rssItems.length} items from RSS`);

  console.log(`Fetching YouTube playlist RSS: ${YT_PLAYLIST_RSS}`);
  let ytIndex = [];
  try {
    const ytXml = await fetchText(YT_PLAYLIST_RSS);
    ytIndex = parseYoutubePlaylist(ytXml);
    console.log(`Parsed ${ytIndex.length} videos from YouTube playlist`);
  } catch (e) {
    console.warn(`Could not fetch YouTube playlist (continuing without): ${e.message}`);
  }

  const src = await readFile(DATA_FILE, 'utf8');
  const knownUrls = existingUrls(src);
  const knownImgUuids = existingImageUuids(src);
  const knownTitles = existingNormalizedTitles(src);

  const newEps = [];
  for (const item of rssItems) {
    if (isPromoItem(item)) {
      console.log(`Skipping (promo / non-episode): ${item.title}`);
      continue;
    }
    if (knownUrls.has(item.link)) continue;
    if (knownTitles.has(normalizeTitle(item.title))) {
      console.log(`Skipping (title already known, likely RSS-vs-canonical URL alias): ${item.title}`);
      continue;
    }
    if (!item.image) {
      console.warn(`Skipping (no image in RSS): ${item.title}`);
      continue;
    }
    const uuid = extractImageUuid(item.image);
    if (uuid && knownImgUuids.has(uuid)) {
      console.log(`Skipping (image UUID already known): ${item.title}`);
      continue;
    }
    if (uuid === GENERIC_SHOW_UUID) {
      console.log(`Skipping (generic show artwork — no episode-specific image yet): ${item.title}`);
      continue;
    }
    const youtube = findYoutubeMatch(item.title, ytIndex);
    newEps.push({
      title: item.title,
      url: item.link,
      img: item.image,
      youtube: youtube || null,
    });
    console.log(`+ ${item.title}${youtube ? ' [+ YouTube match]' : ''}`);
  }

  let next = insertNewEpisodes(src, newEps);
  const { src: afterBackfill, backfilled } = backfillYoutube(next, ytIndex);
  next = afterBackfill;

  if (next === src) {
    console.log('No changes — episodes-data.js is already up to date.');
    return;
  }

  await writeFile(DATA_FILE, next);
  console.log(`Wrote episodes-data.js: +${newEps.length} new episodes, +${backfilled} YouTube back-fills.`);
}

main().catch(e => { console.error(e); process.exit(1); });
