// GENERATED FILE — do not edit. Source: complorama/episodes-wall.jsx
// Rebuild with: node scripts/build-jsx.mjs  (CI does this on push)
// Mur des émissions Complorama — dark wall, edge-to-edge square tiles.
// Real images when available, generated visuals as placeholders.
// Number + title overlaid on each tile. Tiles link externally.
// Responsive grid with infinite-scroll progressive loading.

const PAGE_SIZE = 20;

// Season metadata — bump both at each rentrée. Until SEASON_START the hero
// stats block reads "REPRISE LE <date>" instead of "EN COURS".
const SEASON = 7;
const SEASON_START = '2026-09-11';

// "2026-05-22" → "22 mai 2026". Noon anchor avoids off-by-one days across
// timezones; the Intl instance is built once for the whole wall.
const DATE_FMT = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00`);
  return isNaN(d) ? '' : DATE_FMT.format(d);
}

// Complorama seasons run September → August. Season 1 began in January 2021,
// so everything before September 2021 is S1; September 2021 opens S2, etc.
function seasonOf(iso) {
  if (!iso) return null;
  const y = +iso.slice(0, 4),
    m = +iso.slice(5, 7);
  return y - 2020 + (m >= 9 ? 1 : 0);
}
function seasonLabel(s) {
  const pad = String(s).padStart(2, '0');
  const years = s === 1 ? '2021' : `${2019 + s}–${2020 + s}`;
  return `Saison ${pad} · ${years}`;
}
const SUBSCRIBE_LINKS = [{
  name: 'Apple Podcasts',
  short: 'Apple',
  url: 'https://podcasts.apple.com/fr/podcast/complorama/id1550565028',
  color: '#A855F7',
  icon: /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 1.5C6.2 1.5 1.5 6.2 1.5 12c0 4.7 3.1 8.7 7.4 10v-3.5c-.5-.2-1-.5-1.4-.9-.6-.6-1-1.4-1-2.3 0-1.7 1.4-3.1 3.5-3.1s3.5 1.4 3.5 3.1c0 .9-.4 1.7-1 2.3-.4.4-.9.7-1.4.9V22c4.3-1.3 7.4-5.3 7.4-10 0-5.8-4.7-10.5-10.5-10.5zm0 5.4c1.7 0 3.1 1.4 3.1 3.1S13.7 13.1 12 13.1s-3.1-1.4-3.1-3.1S10.3 6.9 12 6.9z"
  }))
}, {
  name: 'Spotify',
  short: 'Spotify',
  url: 'https://open.spotify.com/show/0wERGyH0D5UKL6ZZkG9SMW',
  color: '#1DB954',
  icon: /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.5 17.3c-.2.4-.7.5-1 .3-2.8-1.7-6.4-2.1-10.6-1.1-.4.1-.8-.2-.9-.5-.1-.4.2-.8.5-.9 4.6-1 8.5-.6 11.7 1.3.3.2.4.6.3.9zm1.5-3.2c-.3.4-.8.6-1.3.3-3.2-2-8.1-2.5-11.9-1.4-.5.2-1-.1-1.2-.6-.2-.5.1-1 .6-1.2 4.3-1.3 9.7-.7 13.4 1.5.4.3.6.9.4 1.4zm.1-3.4C15.3 8.4 8.7 8.2 4.9 9.4c-.6.2-1.2-.2-1.4-.7-.2-.6.2-1.2.7-1.4 4.3-1.3 11.6-1.1 16 1.5.5.3.7 1 .4 1.5-.3.5-1 .7-1.5.4z"
  }))
}, {
  name: 'Deezer',
  short: 'Deezer',
  url: 'https://www.deezer.com/fr/show/2272072',
  color: '#A238FF',
  icon: /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "17",
    width: "4",
    height: "4",
    rx: "0.6"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "5",
    y: "17",
    width: "4",
    height: "4",
    rx: "0.6"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "10",
    y: "17",
    width: "4",
    height: "4",
    rx: "0.6"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "15",
    y: "17",
    width: "4",
    height: "4",
    rx: "0.6"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "20",
    y: "17",
    width: "4",
    height: "4",
    rx: "0.6"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "5",
    y: "12",
    width: "4",
    height: "4",
    rx: "0.6"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "10",
    y: "12",
    width: "4",
    height: "4",
    rx: "0.6"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "15",
    y: "12",
    width: "4",
    height: "4",
    rx: "0.6"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "20",
    y: "12",
    width: "4",
    height: "4",
    rx: "0.6"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "10",
    y: "7",
    width: "4",
    height: "4",
    rx: "0.6"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "15",
    y: "7",
    width: "4",
    height: "4",
    rx: "0.6"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "20",
    y: "7",
    width: "4",
    height: "4",
    rx: "0.6"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "20",
    y: "2",
    width: "4",
    height: "4",
    rx: "0.6"
  }))
}, {
  name: 'Amazon Music',
  short: 'Amazon',
  url: 'https://music.amazon.fr/podcasts/3df44b2f-e59b-4152-aa46-c5c8b44fdc64/complorama',
  color: '#25D1DA',
  icon: /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "11",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3.5 18 C 8 22, 16 22, 20.5 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }))
}, {
  name: 'Podcast Addict',
  short: 'Podcast Addict',
  url: 'https://podcastaddict.com/podcast/complorama/3222339',
  color: '#F4791F',
  icon: /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2 a10 10 0 1 0 0 20 a10 10 0 0 0 0 -20 z M12 6 a6 6 0 1 1 -0.01 0 z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "2.4"
  }))
}, {
  name: 'YouTube',
  short: 'YouTube',
  url: 'https://www.youtube.com/playlist?list=PLg6GanYvTasWMem6U2VUxc9sQ6a7T7sIe',
  color: '#FF0000',
  icon: /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "14",
    viewBox: "0 0 24 17",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M23.5 2.7c-.3-1-1.1-1.8-2.1-2.1C19.5 0 12 0 12 0S4.5 0 2.6.6C1.6.9.8 1.7.5 2.7 0 4.6 0 8.5 0 8.5s0 3.9.5 5.8c.3 1 1.1 1.8 2.1 2.1 1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6c1-.3 1.8-1.1 2.1-2.1.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8z"
  }), /*#__PURE__*/React.createElement("polygon", {
    points: "9.5,12.1 15.8,8.5 9.5,4.9",
    fill: "#0a0a0c"
  }))
}, {
  name: 'Flux RSS',
  short: 'RSS',
  url: 'https://radiofrance-podcast.net/podcast09/podcast_adc482ba-ae2e-47ec-adda-4838cd022cd4.xml',
  color: '#F26522',
  icon: /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "5",
    cy: "19",
    r: "2.6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 11 a10 10 0 0 1 10 10 h-3 a7 7 0 0 0 -7 -7 z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 4 a17 17 0 0 1 17 17 h-3 a14 14 0 0 0 -14 -14 z"
  }))
}];
function SubscribeButton({
  platform
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", {
    href: platform.url,
    target: "_blank",
    rel: "noopener noreferrer",
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    title: `S'abonner sur ${platform.name}`,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 14px',
      borderRadius: 999,
      background: platform.color,
      border: `1px solid ${platform.color}`,
      color: '#fff',
      textDecoration: 'none',
      fontFamily: '"DM Mono", monospace',
      fontSize: 11,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      fontWeight: 600,
      transition: 'transform 0.2s, box-shadow 0.2s, filter 0.2s',
      transform: hover ? 'translateY(-2px)' : 'translateY(0)',
      boxShadow: hover ? `0 8px 24px -6px ${platform.color}80` : '0 1px 0 rgba(0,0,0,0.2)',
      filter: hover ? 'brightness(1.12)' : 'brightness(1)',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      lineHeight: 0
    }
  }, platform.icon), /*#__PURE__*/React.createElement("span", {
    className: "subscribe-label"
  }, platform.short));
}
function SeasonChip({
  active,
  onClick,
  title,
  children
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    "aria-pressed": active,
    title: title,
    style: {
      fontFamily: '"DM Mono", monospace',
      fontSize: 10,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      padding: '6px 10px',
      borderRadius: 999,
      border: `1px solid ${active ? '#e63946' : 'rgba(255,255,255,0.16)'}`,
      background: active ? '#e63946' : 'transparent',
      color: active ? '#fff' : 'rgba(243,239,230,0.7)',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'background 0.15s, border-color 0.15s, color 0.15s',
      flexShrink: 0
    }
  }, children);
}
function SubscribeBar() {
  return /*#__PURE__*/React.createElement("div", {
    className: "subscribe-bar",
    style: {
      marginTop: 22,
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "subscribe-prefix",
    style: {
      fontFamily: '"DM Mono", monospace',
      fontSize: 10,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: 'rgba(243,239,230,0.55)',
      marginRight: 6
    }
  }, "S'abonner \u2197"), SUBSCRIBE_LINKS.map(p => /*#__PURE__*/React.createElement(SubscribeButton, {
    key: p.name,
    platform: p
  })));
}
function EpisodeTile({
  ep
}) {
  const [hover, setHover] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);
  const accent = '#e63946';
  const hasVideo = !!ep.youtube;

  // Click anywhere on the tile (outside action buttons) opens audio.
  const openAudio = () => {
    if (ep.url) window.open(ep.url, '_blank', 'noopener,noreferrer');
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "ep-tile",
    onClick: openAudio,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: 'relative',
      aspectRatio: '1 / 1',
      overflow: 'hidden',
      background: '#0a0a0a',
      cursor: 'pointer'
    }
  }, ep.img && !imgError ? /*#__PURE__*/React.createElement("img", {
    src: ep.img,
    alt: "",
    loading: "lazy",
    decoding: "async",
    onError: () => setImgError(true),
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.7s cubic-bezier(.2,.7,.3,1), filter 0.4s',
      transform: hover ? 'scale(1.06)' : 'scale(1)',
      filter: hover ? 'brightness(1) saturate(1.1)' : 'brightness(0.72) saturate(0.85)'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      transition: 'transform 0.7s cubic-bezier(.2,.7,.3,1), filter 0.4s',
      transform: hover ? 'scale(1.06)' : 'scale(1)',
      filter: hover ? 'brightness(1)' : 'brightness(0.85)'
    }
  }, /*#__PURE__*/React.createElement(window.EpisodeVisual, {
    n: ep.n
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 32%, rgba(0,0,0,0.18) 60%, rgba(0,0,0,0) 78%)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 14,
      left: 0,
      display: 'flex',
      alignItems: 'center',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: hover ? accent : 'rgba(0,0,0,0.55)',
      color: '#fff',
      fontFamily: '"DM Mono", ui-monospace, monospace',
      fontSize: 10,
      letterSpacing: '0.2em',
      padding: '5px 10px 5px 16px',
      transition: 'background 0.2s'
    }
  }, "N\xB0", String(ep.n).padStart(3, '0'))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 14,
      right: 14,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 6,
      pointerEvents: 'none'
    }
  }, hasVideo && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '"DM Mono", ui-monospace, monospace',
      fontSize: 9,
      letterSpacing: '0.22em',
      color: '#fff',
      background: 'rgba(0,0,0,0.62)',
      border: '1px solid rgba(255,255,255,0.22)',
      padding: '3px 7px',
      borderRadius: 3,
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      textShadow: '0 1px 2px rgba(0,0,0,0.6)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#e63946'
    }
  }, "\u25CF"), " VID\xC9O")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 16,
      pointerEvents: 'none'
    }
  }, ep.date && /*#__PURE__*/React.createElement("time", {
    className: "ep-date",
    dateTime: ep.date,
    style: {
      display: 'block',
      fontFamily: '"DM Mono", ui-monospace, monospace',
      fontSize: 10,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.72)',
      marginBottom: 7
    }
  }, formatDate(ep.date)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 2,
      background: accent,
      width: hover ? 48 : 18,
      marginBottom: 10,
      transition: 'width 0.3s cubic-bezier(.2,.7,.3,1)'
    }
  }), /*#__PURE__*/React.createElement("h2", {
    className: "ep-title",
    style: {
      margin: 0,
      fontFamily: '"Archivo", "Helvetica Neue", system-ui, sans-serif',
      fontWeight: 700,
      fontSize: 18,
      lineHeight: 1.2,
      letterSpacing: '-0.015em',
      color: '#fff',
      textShadow: '0 2px 14px rgba(0,0,0,0.55)',
      textWrap: 'balance'
    }
  }, ep.title), /*#__PURE__*/React.createElement("div", {
    className: "tile-actions",
    style: {
      marginTop: 12,
      display: 'flex',
      gap: 8,
      opacity: hover ? 1 : 0,
      transform: hover ? 'translateY(0)' : 'translateY(-3px)',
      transition: 'opacity 0.25s, transform 0.25s',
      pointerEvents: hover ? 'auto' : 'none'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: ep.url || '#',
    target: "_blank",
    rel: "noopener noreferrer",
    "aria-label": `Écouter N°${ep.n} — ${ep.title} sur Radio France`,
    onClick: e => e.stopPropagation(),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 11px',
      borderRadius: 999,
      background: accent,
      color: '#fff',
      textDecoration: 'none',
      fontFamily: '"DM Mono", monospace',
      fontSize: 10,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      fontWeight: 500
    },
    title: "\xC9couter le podcast audio"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "11",
    viewBox: "0 0 9 11",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "0,0 9,5.5 0,11",
    fill: "#fff"
  })), "\xC9couter"), hasVideo && /*#__PURE__*/React.createElement("a", {
    href: ep.youtube,
    target: "_blank",
    rel: "noopener noreferrer",
    "aria-label": `Voir la vidéo de N°${ep.n} — ${ep.title} sur YouTube`,
    onClick: e => e.stopPropagation(),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 11px',
      borderRadius: 999,
      background: 'rgba(255,255,255,0.92)',
      color: '#0a0a0c',
      textDecoration: 'none',
      fontFamily: '"DM Mono", monospace',
      fontSize: 10,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      fontWeight: 500
    },
    title: "Voir la version vid\xE9o sur YouTube"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "8",
    viewBox: "0 0 11 8",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "0",
    width: "11",
    height: "8",
    rx: "1.6",
    fill: "#0a0a0c"
  }), /*#__PURE__*/React.createElement("polygon", {
    points: "4,2 8,4 4,6",
    fill: "#fff"
  })), "Vid\xE9o"))));
}
function EpisodesWall() {
  const [query, setQuery] = React.useState('');
  const [season, setSeason] = React.useState(null); // null = all seasons
  const [shown, setShown] = React.useState(PAGE_SIZE);
  const sentinelRef = React.useRef(null);

  // Seasons present in the catalogue (derived from publication dates), newest
  // first. Empty until the sync bot has back-filled dates — the chip row
  // simply doesn't render in that case.
  const seasons = React.useMemo(() => {
    const set = new Set();
    for (const e of window.EPISODES) {
      const s = seasonOf(e.date);
      if (s) set.add(s);
    }
    return [...set].sort((a, b) => b - a);
  }, []);

  // Normalize accents and case so "Orban" matches "Orbán" and "elections"
  // matches "élections".
  const normalize = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  // Multi-word queries are ANDed: every token must be found somewhere in the
  // episode. Each token's best hit is ranked title (0) < description (1) <
  // body/date (2); the episode's tier is its weakest token, so results whose
  // title carries all the words come first, then summary hits, then episodes
  // that merely mention the terms in the article text. Within a tier the
  // original (chronological) order is kept — Array#sort is stable.
  const tokens = normalize(query).split(/\s+/).map(t => t.replace(/[,;:!?.]+$/, '')).filter(Boolean);
  const matchTier = e => {
    if (tokens.length === 0) return 0;
    const title = normalize(e.title);
    const desc = e.description ? normalize(e.description) : '';
    const deep = [e.body ? normalize(e.body) : '', e.date ? `${e.date} ${normalize(formatDate(e.date))}` : ''].join(' ');
    let tier = 0;
    for (const tok of tokens) {
      // "n°108" / "#108" / "no108" → "108"; an exact number hit is a title-grade match.
      const num = tok.replace(/^(?:n°|n(?=\d)|#|no\.?)/, '');
      if (/^\d+$/.test(num) && String(e.n) === num) continue;
      if (title.includes(tok)) continue;
      if (desc.includes(tok)) {
        tier = Math.max(tier, 1);
        continue;
      }
      if (deep.includes(tok) || /^\d+$/.test(num) && String(e.n).includes(num)) {
        tier = Math.max(tier, 2);
        continue;
      }
      return -1; // token found nowhere → episode is out
    }
    return tier;
  };
  const scored = [];
  for (const e of window.EPISODES) {
    if (season != null && seasonOf(e.date) !== season) continue;
    const tier = matchTier(e);
    if (tier < 0) continue;
    scored.push({
      e,
      tier
    });
  }
  if (tokens.length > 0) scored.sort((a, b) => a.tier - b.tier);
  const filtered = scored.map(s => s.e);
  const visible = filtered.slice(0, shown);
  const hasMore = visible.length < filtered.length;
  const clearFilters = () => {
    setQuery('');
    setSeason(null);
  };
  const seasonStartDate = new Date(`${SEASON_START}T00:00:00`);
  const seasonStarted = new Date() >= seasonStartDate;
  const seasonStartLabel = seasonStartDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  }).replace('.', '').toUpperCase(); // e.g. "11 SEPT"

  React.useEffect(() => {
    setShown(PAGE_SIZE);
  }, [query, season]);

  // Infinite scroll: load more when sentinel enters viewport
  React.useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setShown(s => s + PAGE_SIZE);
      }
    }, {
      rootMargin: '600px'
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, visible.length]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#0a0a0c',
      color: '#f3efe6',
      minHeight: '100%',
      fontFamily: '"Archivo", "Helvetica Neue", system-ui, sans-serif'
    }
  }, /*#__PURE__*/React.createElement("header", {
    className: "hero",
    style: {
      position: 'relative',
      background: '#0a0a0c',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("a", {
    className: "hero-avatar",
    href: "https://www.radiofrance.fr/franceinfo/podcasts/complorama",
    target: "_blank",
    rel: "noopener noreferrer",
    "aria-label": "Complorama sur Radio France",
    title: "Complorama sur Radio France",
    style: {
      position: 'absolute',
      top: 28,
      right: 32,
      width: 132,
      height: 132,
      borderRadius: '50%',
      overflow: 'hidden',
      zIndex: 5,
      opacity: 0.32,
      transition: 'opacity 0.3s, transform 0.3s',
      border: '1px solid rgba(255,255,255,0.18)'
    },
    onMouseEnter: e => {
      e.currentTarget.style.opacity = '0.78';
      e.currentTarget.style.transform = 'scale(1.03)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.opacity = '0.32';
      e.currentTarget.style.transform = 'scale(1)';
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/tmf-avatar.jpg",
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "hero-banner",
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      background: '#0a0a0c'
    }
  }, /*#__PURE__*/React.createElement("img", {
    className: "hero-illustration",
    src: "assets/logo-banner.webp",
    alt: "Complorama",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: '85% center',
      opacity: 0.92
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "hero-shade-h",
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to right, rgba(10,10,12,1) 0%, rgba(10,10,12,1) 40%, rgba(10,10,12,0.88) 58%, rgba(10,10,12,0.4) 76%, rgba(10,10,12,0) 92%)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to bottom, rgba(10,10,12,0) 70%, rgba(10,10,12,0.85) 100%)',
      pointerEvents: 'none'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "hero-meta",
    style: {
      position: 'relative',
      padding: '56px 48px 36px',
      minHeight: 360,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 32,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 auto',
      minWidth: 280,
      maxWidth: 720
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '"DM Mono", monospace',
      fontSize: 11,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: 'rgba(243,239,230,0.55)',
      marginBottom: 10
    }
  }, "podcast \xB7 franceinfo"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: '"Archivo", "Helvetica Neue", sans-serif',
      fontWeight: 800,
      fontSize: 'clamp(44px, 6vw, 72px)',
      lineHeight: 0.95,
      letterSpacing: '-0.035em',
      color: '#fff'
    }
  }, "Complorama", /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#e63946'
    }
  }, ".")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      fontSize: 15,
      lineHeight: 1.5,
      color: 'rgba(243,239,230,0.7)',
      maxWidth: 640,
      fontWeight: 400
    }
  }, /*#__PURE__*/React.createElement("div", null, "Par", ' ', /*#__PURE__*/React.createElement("a", {
    href: "https://tristan.pro",
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      fontStyle: 'normal',
      color: '#f3efe6',
      textDecoration: 'none',
      borderBottom: '1px solid rgba(230,57,70,0.6)'
    }
  }, "Tristan Mend\xE8s France"), ",", ' ', /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'normal',
      color: '#f3efe6'
    }
  }, "Rudy Reichstadt"), ' ', "et", ' ', /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'normal',
      color: '#f3efe6'
    }
  }, "No\xE9 Da Silva"), "."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, "D\xE9cryptage de l'activit\xE9 de la complosph\xE8re, en lien avec l'actualit\xE9."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      fontFamily: '"Fraunces", "Georgia", serif',
      fontStyle: 'italic',
      fontSize: 13,
      color: 'rgba(243,239,230,0.55)',
      lineHeight: 1.45
    }
  }, "Mur des \xE9pisodes \u2014 un index visuel renvoyant vers Radio France.")), /*#__PURE__*/React.createElement(SubscribeBar, null)), /*#__PURE__*/React.createElement("div", {
    className: "hero-stats",
    style: {
      fontFamily: '"DM Mono", monospace',
      fontSize: 12,
      color: 'rgba(243,239,230,0.5)',
      textAlign: 'right',
      letterSpacing: '0.06em',
      lineHeight: 1.7,
      flex: '0 0 auto',
      whiteSpace: 'nowrap',
      minWidth: 140
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-stats-live",
    style: {
      color: '#e63946',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: seasonStarted ? 'pulse-dot' : undefined,
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: '#e63946',
      boxShadow: '0 0 10px #e63946',
      display: 'inline-block'
    }
  }), seasonStarted ? 'EN COURS' : `REPRISE LE ${seasonStartLabel}`), /*#__PURE__*/React.createElement("div", null, window.EPISODES[0] ? window.EPISODES[0].n : window.EPISODES.length, " \xC9PISODES"), /*#__PURE__*/React.createElement("div", null, "SAISON ", String(SEASON).padStart(2, '0'))))), /*#__PURE__*/React.createElement("div", {
    className: "search-bar",
    role: "search",
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 10,
      background: 'rgba(10,10,12,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '14px 48px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 260px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: 'rgba(255,255,255,0.05)',
      padding: '10px 18px',
      borderRadius: 999,
      border: '1px solid rgba(255,255,255,0.06)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    style: {
      opacity: 0.5,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "6",
    cy: "6",
    r: "4.5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.4"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "9.5",
    y1: "9.5",
    x2: "13",
    y2: "13",
    stroke: "currentColor",
    strokeWidth: "1.4",
    strokeLinecap: "round"
  })), /*#__PURE__*/React.createElement("input", {
    type: "text",
    "aria-label": "Rechercher un \xE9pisode par titre, th\xE8me ou num\xE9ro",
    autoComplete: "off",
    value: query,
    onChange: e => setQuery(e.target.value),
    placeholder: "Chercher un \xE9pisode, un th\xE8me, un num\xE9ro\u2026",
    style: {
      flex: 1,
      background: 'transparent',
      border: 'none',
      outline: 'none',
      color: '#f3efe6',
      fontFamily: 'inherit',
      fontSize: 15,
      fontWeight: 500,
      minWidth: 0
    }
  }), query && /*#__PURE__*/React.createElement("button", {
    onClick: () => setQuery(''),
    "aria-label": "Effacer la recherche",
    style: {
      background: 'transparent',
      border: 'none',
      color: 'rgba(243,239,230,0.6)',
      cursor: 'pointer',
      fontSize: 13,
      fontFamily: '"DM Mono", monospace',
      padding: 0,
      flexShrink: 0
    }
  }, "\u2715")), seasons.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "season-chips",
    role: "group",
    "aria-label": "Filtrer par saison",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      overflowX: 'auto',
      flex: '0 1 auto',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(SeasonChip, {
    active: season == null,
    onClick: () => setSeason(null),
    title: "Toutes les saisons"
  }, "Toutes"), seasons.map(s => /*#__PURE__*/React.createElement(SeasonChip, {
    key: s,
    active: season === s,
    onClick: () => setSeason(season === s ? null : s),
    title: seasonLabel(s)
  }, "S", String(s).padStart(2, '0')))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '"DM Mono", monospace',
      fontSize: 11,
      letterSpacing: '0.15em',
      color: 'rgba(243,239,230,0.5)',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      marginLeft: 'auto'
    }
  }, String(filtered.length).padStart(3, '0'), " / ", String(window.EPISODES.length).padStart(3, '0'))), filtered.length > 0 ? /*#__PURE__*/React.createElement("div", {
    className: "ep-grid"
  }, visible.map(ep => /*#__PURE__*/React.createElement(EpisodeTile, {
    key: ep.n,
    ep: ep
  }))) : /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      padding: '88px 48px 96px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontStyle: 'italic',
      fontSize: 22,
      color: 'rgba(243,239,230,0.7)',
      marginBottom: 18
    }
  }, query && season != null ? /*#__PURE__*/React.createElement(React.Fragment, null, "Aucun \xE9pisode de la ", seasonLabel(season).toLowerCase(), " ne correspond \xE0 \xAB ", query, " \xBB.") : query ? /*#__PURE__*/React.createElement(React.Fragment, null, "Aucun \xE9pisode ne correspond \xE0 \xAB ", query, " \xBB.") : /*#__PURE__*/React.createElement(React.Fragment, null, "Aucun \xE9pisode dat\xE9 pour la ", seasonLabel(season).toLowerCase(), ".")), /*#__PURE__*/React.createElement("button", {
    onClick: clearFilters,
    style: {
      padding: '10px 20px',
      borderRadius: 999,
      background: 'transparent',
      border: '1px solid rgba(255,255,255,0.22)',
      color: '#f3efe6',
      cursor: 'pointer',
      fontFamily: '"DM Mono", monospace',
      fontSize: 11,
      letterSpacing: '0.2em',
      textTransform: 'uppercase'
    }
  }, "Effacer les filtres")), hasMore && /*#__PURE__*/React.createElement("div", {
    ref: sentinelRef,
    style: {
      padding: '32px 0',
      textAlign: 'center',
      fontFamily: '"DM Mono", monospace',
      fontSize: 11,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color: 'rgba(243,239,230,0.5)'
    }
  }, "chargement\u2026"), !hasMore && filtered.length > 0 && /*#__PURE__*/React.createElement("footer", {
    style: {
      padding: '56px 48px 64px',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontStyle: 'italic',
      fontSize: 22,
      color: 'rgba(243,239,230,0.7)',
      marginBottom: 18
    }
  }, "Vous \xEAtes arriv\xE9\xB7e au bout du catalogue."), /*#__PURE__*/React.createElement("a", {
    href: "https://www.radiofrance.fr/franceinfo/podcasts/complorama",
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      display: 'inline-block',
      padding: '12px 24px',
      borderRadius: 999,
      background: '#e63946',
      color: '#fff',
      textDecoration: 'none',
      fontFamily: '"DM Mono", monospace',
      fontSize: 11,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      fontWeight: 500
    }
  }, "Tous les \xE9pisodes sur Radio France \u2197"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      fontFamily: '"DM Mono", monospace',
      fontSize: 10,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color: 'rgba(243,239,230,0.42)'
    }
  }, "complorama \xB7 le mur des \xE9pisodes"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      fontFamily: '"DM Mono", monospace',
      fontSize: 10,
      letterSpacing: '0.15em',
      color: 'rgba(243,239,230,0.4)'
    }
  }, "vib\xE9cod\xE9 par", ' ', /*#__PURE__*/React.createElement("a", {
    href: "https://tristan.pro",
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      color: 'rgba(243,239,230,0.6)',
      textDecoration: 'none',
      borderBottom: '1px solid rgba(243,239,230,0.25)'
    }
  }, "Tristan Mend\xE8s France"))), /*#__PURE__*/React.createElement("style", null, `
        .ep-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0;
        }

        /* Keyboard: Tab lands on the (visually hidden) Écouter / Vidéo links
           inside a tile; :focus-within then reveals the whole action row,
           mirroring the mouse hover state. */
        .ep-tile:focus-within .tile-actions {
          opacity: 1 !important;
          transform: none !important;
          pointer-events: auto !important;
        }
        .tile-actions a:focus-visible {
          outline: 2px solid #fff;
          outline-offset: 2px;
        }

        /* Touch devices have no hover — keep the action buttons visible so the
           Vidéo link is actually reachable. */
        @media (hover: none) {
          .tile-actions {
            opacity: 1 !important;
            transform: none !important;
            pointer-events: auto !important;
          }
        }

        /* Live indicator: soft breathing glow once the season is on air. */
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 6px #e63946; }
          50%      { box-shadow: 0 0 14px #e63946; }
        }
        .pulse-dot { animation: pulse-dot 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .pulse-dot { animation: none; }
        }

        @media (max-width: 1280px) {
          .ep-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 900px) {
          .ep-grid { grid-template-columns: repeat(3, 1fr); }
          .hero-meta { padding: 36px 24px 24px !important; min-height: 280px !important; }
          .hero-stats { text-align: left !important; }
          .hero-stats-live { justify-content: flex-start !important; }
          .search-bar { padding: 12px 24px !important; }
          .hero-illustration { object-position: 110% center !important; opacity: 0.55 !important; }
          .hero-shade-h { background: linear-gradient(to right, rgba(10,10,12,1) 0%, rgba(10,10,12,0.95) 60%, rgba(10,10,12,0.6) 88%, rgba(10,10,12,0.3) 100%) !important; }
          .hero-avatar { width: 84px !important; height: 84px !important; top: 20px !important; right: 20px !important; }
          /* 3-col tablets: ~250px tiles with always-visible actions (no hover). */
          .ep-title { font-size: 16px !important; -webkit-line-clamp: 5; }
        }
        /* Season chips: hide the scrollbar of the horizontal strip. */
        .season-chips { scrollbar-width: none; }
        .season-chips::-webkit-scrollbar { display: none; }
        .season-chips button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

        /* Tile title: hard cap on line count so the bottom block can never
           outgrow the tile (date + title + action row are bottom-anchored
           and would otherwise climb over the N° badge). Only the handful of
           100+-character titles ever hit the cap. */
        .ep-title {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 6;
          overflow: hidden;
        }

        @media (max-width: 600px) {
          .ep-grid { grid-template-columns: repeat(2, 1fr); }
          /* Chips drop to their own full-width line under the input + counter. */
          .season-chips { flex: 1 0 100% !important; order: 3; padding-bottom: 2px; }
          .subscribe-bar { gap: 6px !important; margin-top: 16px !important; }
          .subscribe-bar .subscribe-prefix { display: none; }
          .subscribe-bar a { padding: 6px 10px !important; font-size: 10px !important; gap: 6px !important; letter-spacing: 0.08em !important; }
          .hero-avatar { width: 64px !important; height: 64px !important; top: 16px !important; right: 16px !important; }

          /* 2-col phones (~187px tiles). Portrait 4:5 tiles buy ~25% more
             height while staying edge-to-edge and uniform; the type and the
             action row tighten up to match. */
          .ep-tile { aspect-ratio: 4 / 5 !important; }
          .ep-title { font-size: 15px !important; line-height: 1.18 !important; }
          .ep-date { font-size: 9px !important; margin-bottom: 5px !important; }
          .tile-actions { margin-top: 9px !important; }
          .tile-actions a { padding: 5px 9px !important; font-size: 9px !important; letter-spacing: 0.14em !important; }
        }
      `));
}
window.EpisodesWall = EpisodesWall;
