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

// `active`  = this season is the click-filter (solid red).
// `current` = this season is the one currently on screen (scroll-spy):
//             brighter text; the sliding red bar underneath is drawn by the
//             parent so it can travel between chips.
function SeasonChip({
  active,
  current,
  onClick,
  title,
  buttonRef,
  children
}) {
  return /*#__PURE__*/React.createElement("button", {
    ref: buttonRef,
    type: "button",
    onClick: onClick,
    "aria-pressed": active,
    "aria-current": current && !active ? 'location' : undefined,
    title: title,
    style: {
      fontFamily: '"DM Mono", monospace',
      fontSize: 10,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      padding: '6px 10px',
      borderRadius: 999,
      border: `1px solid ${active ? '#e63946' : current ? 'rgba(255,255,255,0.34)' : 'rgba(255,255,255,0.16)'}`,
      background: active ? '#e63946' : 'transparent',
      color: active || current ? '#fff' : 'rgba(243,239,230,0.7)',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'background 0.15s, border-color 0.25s, color 0.25s',
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
  }, "S'abonner ↗"), SUBSCRIBE_LINKS.map(p => /*#__PURE__*/React.createElement(SubscribeButton, {
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
    "data-season": seasonOf(ep.date) || undefined,
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
  }, "N°", String(ep.n).padStart(3, '0'))), /*#__PURE__*/React.createElement("div", {
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
  }, "●"), " VIDÉO")), /*#__PURE__*/React.createElement("div", {
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
    title: "Écouter le podcast audio"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "11",
    viewBox: "0 0 9 11",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "0,0 9,5.5 0,11",
    fill: "#fff"
  })), "Écouter"), hasVideo && /*#__PURE__*/React.createElement("a", {
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
    title: "Voir la version vidéo sur YouTube"
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
  })), "Vidéo"))));
}

// ---------------------------------------------------------------------------
// Recherche dans les transcriptions
//
// Le mur filtre les tuiles localement, instantanément, sur le titre, le chapô
// et le corps de l'article — environ 25 800 mots. Les transcriptions des
// épisodes en ajoutent 484 000, dix-neuf fois plus, mais elles sont trop
// volumineuses pour être téléchargées par le visiteur et n'ont pas vocation à
// être publiées intégralement : elles vivent sur l'hébergement de Tristan,
// hors racine web, et seul un court extrait autour des mots trouvés est
// renvoyé.
//
// Cet appel est le seul contact avec un autre domaine de toute la page, il
// n'a lieu qu'après une frappe du visiteur, jamais au chargement, et son
// échec est sans conséquence : le mur continue de fonctionner sans lui.
// ---------------------------------------------------------------------------

const SEARCH_API = 'https://recherche.complorama.fr/search.php';
const SEARCH_MIN_CHARS = 3;
const SEARCH_DEBOUNCE_MS = 350;

/**
 * Rend un extrait dont les mots trouvés sont encadrés par <mark>…</mark>.
 * La chaîne est découpée puis reconstruite en éléments React : on n'injecte
 * jamais de HTML, donc une transcription contenant un chevron ne peut pas
 * devenir du balisage.
 */
function Highlighted({
  text
}) {
  const parts = String(text || '').split(/<\/?mark>/);
  return parts.map((part, i) => i % 2 === 1 ? /*#__PURE__*/React.createElement("mark", {
    key: i,
    style: {
      background: 'rgba(224,58,58,0.28)',
      color: '#fff',
      borderRadius: 2,
      padding: '0 2px'
    }
  }, part) : /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, part));
}

/** Interroge le moteur, en différé et en annulant les requêtes dépassées. */
function useTranscriptSearch(query, season) {
  const [state, setState] = React.useState({
    status: 'idle',
    total: 0,
    results: [],
    query: '',
    suggestion: null
  });
  const term = query.trim();
  React.useEffect(() => {
    if (term.length < SEARCH_MIN_CHARS) {
      setState({
        status: 'idle',
        total: 0,
        results: [],
        query: '',
        suggestion: null
      });
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setState(s => ({
        ...s,
        status: 'loading'
      }));
      try {
        const url = `${SEARCH_API}?q=${encodeURIComponent(term)}${season != null ? `&saison=${season}` : ''}`;
        const res = await fetch(url, {
          signal: controller.signal
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setState({
          status: 'ok',
          total: data.total || 0,
          results: data.resultats || [],
          query: term,
          suggestion: data.suggestion || null
        });
      } catch (e) {
        if (e.name === 'AbortError') return;
        // Le moteur est un complément : s'il ne répond pas, on le dit
        // discrètement et le mur reste utilisable.
        setState({
          status: 'error',
          total: 0,
          results: [],
          query: term,
          suggestion: null
        });
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term, season]);
  return state;
}
function TranscriptHit({
  hit
}) {
  const video = hit.video;
  return /*#__PURE__*/React.createElement("li", {
    className: "tr-hit-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tr-hit-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tr-hit-num"
  }, "N°", String(hit.episode).padStart(3, '0')), hit.date && /*#__PURE__*/React.createElement("time", {
    dateTime: hit.date
  }, formatDate(hit.date))), hit.titre && /*#__PURE__*/React.createElement("h3", {
    className: "tr-hit-title"
  }, hit.titre), /*#__PURE__*/React.createElement("p", {
    className: "tr-hit-quote"
  }, "« ", /*#__PURE__*/React.createElement(Highlighted, {
    text: hit.extrait
  }), " »"), /*#__PURE__*/React.createElement("div", {
    className: "tr-hit-actions"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tr-hit-time",
    title: "Minutage dans la version audio"
  }, "⏱ ", hit.minutage), hit.url && /*#__PURE__*/React.createElement("a", {
    href: hit.url,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "tr-hit-btn"
  }, "Écouter l’épisode"), video && video.minutage && /*#__PURE__*/React.createElement("a", {
    href: video.url,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "tr-hit-btn tr-hit-btn-video"
  }, "▶ Voir dans la vidéo · ", video.minutage), video && video.coupe_au_montage && /*#__PURE__*/React.createElement("span", {
    className: "tr-hit-note",
    title: "La vidéo est un montage raccourci de l’audio"
  }, "passage absent de la vidéo"), video && video.minutage_indisponible && /*#__PURE__*/React.createElement("a", {
    href: video.url,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "tr-hit-btn"
  }, "Voir la vidéo")));
}

// L'état vient du parent : le mur en a besoin lui aussi, pour dire combien
// de passages l'attendent plus bas quand aucune tuile ne correspond.
function TranscriptResults({
  state
}) {
  const {
    status,
    total,
    results,
    suggestion
  } = state;
  if (status === 'idle') return null;
  return /*#__PURE__*/React.createElement("section", {
    className: "tr-section",
    id: "antenne",
    "aria-live": "polite"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tr-head"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "tr-title"
  }, "Dans ce qui a été dit à l’antenne"), /*#__PURE__*/React.createElement("span", {
    className: "tr-count"
  }, status === 'loading' && 'recherche…', status === 'error' && 'moteur indisponible', status === 'ok' && (total === 0 ? 'aucun passage' : `${total.toLocaleString('fr-FR')} passage${total > 1 ? 's' : ''}`))), status === 'error' && /*#__PURE__*/React.createElement("p", {
    className: "tr-empty"
  }, "La recherche dans les transcriptions ne répond pas pour le moment. Le mur, lui, fonctionne normalement."), status === 'ok' && total === 0 && /*#__PURE__*/React.createElement("p", {
    className: "tr-empty"
  }, "Ces mots n’ont pas été prononcés dans les épisodes transcrits."), suggestion && suggestion.remplace && /*#__PURE__*/React.createElement("p", {
    className: "tr-suggestion"
  }, suggestion.remplace.map((r, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && ' · ', "Aucun passage pour ", /*#__PURE__*/React.createElement("em", null, r.cherche), " — voici ", /*#__PURE__*/React.createElement("strong", null, r.trouve))), /*#__PURE__*/React.createElement("span", {
    className: "tr-suggestion-why"
  }, ' ', "orthographe probable dans la transcription automatique, qui écrit les noms propres à l’oreille.")), results.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("ul", {
    className: "tr-list"
  }, results.map((hit, i) => /*#__PURE__*/React.createElement(TranscriptHit, {
    key: `${hit.episode}-${hit.seconde}-${i}`,
    hit: hit
  }))), total > results.length && /*#__PURE__*/React.createElement("p", {
    className: "tr-more"
  }, results.length, " passages les plus pertinents sur ", total.toLocaleString('fr-FR'), " — affinez la recherche pour resserrer.")));
}
function EpisodesWall() {
  const [query, setQuery] = React.useState('');
  const [season, setSeason] = React.useState(null); // null = all seasons
  const [shown, setShown] = React.useState(PAGE_SIZE);
  const sentinelRef = React.useRef(null);

  // Scroll-spy plumbing: which season is on screen, and where the sliding
  // bar under the chips should sit.
  const gridRef = React.useRef(null); // the tile grid
  const barRef = React.useRef(null); // the sticky search bar
  const chipsRef = React.useRef(null); // the (horizontally scrollable) chip strip
  const chipEls = React.useRef({}); // season → <button>
  const [currentSeason, setCurrentSeason] = React.useState(null);
  const [cursor, setCursor] = React.useState({
    x: 0,
    w: 0,
    visible: false
  });

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

  // Recherche dans les transcriptions : l'état vit ici parce que deux
  // endroits en dépendent — la section de résultats, et le message affiché
  // quand aucune tuile ne correspond mais que des passages existent.
  const transcripts = useTranscriptSearch(query, season);
  const hasSpokenHits = transcripts.status === 'ok' && transcripts.total > 0;
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

  // Scroll-spy: the current season is that of the topmost tile still visible
  // beneath the sticky bar. Measured on scroll/resize, rAF-throttled, and
  // re-measured whenever the set of rendered tiles changes.
  React.useEffect(() => {
    if (seasons.length === 0) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const grid = gridRef.current,
        bar = barRef.current;
      if (!grid || !bar) {
        setCurrentSeason(s => s == null ? s : null);
        return;
      }
      const top = bar.getBoundingClientRect().bottom + 4;
      let found = null;
      for (const el of grid.children) {
        if (el.getBoundingClientRect().bottom > top) {
          found = el.dataset && el.dataset.season ? Number(el.dataset.season) : null;
          break;
        }
      }
      setCurrentSeason(prev => prev === found ? prev : found);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [seasons.length, visible.length, query, season]);

  // Slide the bar under the current chip, and keep that chip in view when the
  // strip is scrollable (phones). Re-run on resize and once web fonts have
  // loaded, since both change chip widths.
  const placeCursor = React.useCallback(() => {
    const el = currentSeason != null ? chipEls.current[currentSeason] : null;
    const box = chipsRef.current;
    if (!el || !box) {
      setCursor(c => c.visible ? {
        ...c,
        visible: false
      } : c);
      return;
    }
    setCursor({
      x: el.offsetLeft,
      w: el.offsetWidth,
      visible: true
    });
    if (box.scrollWidth > box.clientWidth + 1) {
      const left = Math.max(0, el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2);
      if (Math.abs(box.scrollLeft - left) > 4 && typeof box.scrollTo === 'function') {
        box.scrollTo({
          left,
          behavior: 'smooth'
        });
      }
    }
  }, [currentSeason]);
  React.useEffect(() => {
    placeCursor();
    window.addEventListener('resize', placeCursor);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeCursor);
    return () => window.removeEventListener('resize', placeCursor);
  }, [placeCursor]);
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
  }, "podcast · franceinfo"), /*#__PURE__*/React.createElement("h1", {
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
  }, "Tristan Mendès France"), ",", ' ', /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'normal',
      color: '#f3efe6'
    }
  }, "Rudy Reichstadt"), ' ', "et", ' ', /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'normal',
      color: '#f3efe6'
    }
  }, "Noé Da Silva"), "."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, "Décryptage de l'activité de la complosphère, en lien avec l'actualité."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      fontFamily: '"Fraunces", "Georgia", serif',
      fontStyle: 'italic',
      fontSize: 13,
      color: 'rgba(243,239,230,0.55)',
      lineHeight: 1.45
    }
  }, "Mur des épisodes — un index visuel renvoyant vers Radio France.")), /*#__PURE__*/React.createElement(SubscribeBar, null)), /*#__PURE__*/React.createElement("div", {
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
  }), seasonStarted ? 'EN COURS' : `REPRISE LE ${seasonStartLabel}`), /*#__PURE__*/React.createElement("div", null, window.EPISODES[0] ? window.EPISODES[0].n : window.EPISODES.length, " ÉPISODES"), /*#__PURE__*/React.createElement("div", null, "SAISON ", String(SEASON).padStart(2, '0'))))), /*#__PURE__*/React.createElement("div", {
    className: "search-bar",
    role: "search",
    ref: barRef,
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
    "aria-label": "Rechercher un épisode par titre, thème ou numéro",
    autoComplete: "off",
    value: query,
    onChange: e => setQuery(e.target.value),
    placeholder: "Chercher un épisode, un thème, un numéro…",
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
  }, "✕")), seasons.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "season-chips",
    role: "group",
    "aria-label": "Filtrer par saison",
    ref: chipsRef,
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      overflowX: 'auto',
      flex: '0 1 auto',
      minWidth: 0,
      paddingBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    className: "season-cursor",
    style: {
      transform: `translateX(${cursor.x}px)`,
      width: cursor.w,
      opacity: cursor.visible ? 1 : 0
    }
  }), /*#__PURE__*/React.createElement(SeasonChip, {
    active: season == null,
    onClick: () => setSeason(null),
    title: "Toutes les saisons"
  }, "Toutes"), seasons.map(s => /*#__PURE__*/React.createElement(SeasonChip, {
    key: s,
    active: season === s,
    current: currentSeason === s,
    onClick: () => setSeason(season === s ? null : s),
    title: seasonLabel(s),
    buttonRef: el => {
      chipEls.current[s] = el;
    }
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
    className: "ep-grid",
    ref: gridRef
  }, visible.map(ep => /*#__PURE__*/React.createElement(EpisodeTile, {
    key: ep.n,
    ep: ep
  }))) :
  /*#__PURE__*/
  // Aucune tuile ne correspond. Ce n'est PAS la même chose que « rien
  // trouvé » : les mots ont pu être prononcés sans figurer dans un titre
  // ni un résumé. Quand c'est le cas, ce bloc se resserre et annonce le
  // nombre de passages, au lieu d'un grand vide qui laisse croire que la
  // recherche est terminée alors que la réponse est juste en dessous.
  React.createElement("div", {
    role: "status",
    className: hasSpokenHits ? 'wall-empty wall-empty-tight' : 'wall-empty'
  }, /*#__PURE__*/React.createElement("div", {
    className: "wall-empty-title"
  }, query && season != null ? /*#__PURE__*/React.createElement(React.Fragment, null, "Aucun épisode de la ", seasonLabel(season).toLowerCase(), " ne correspond à « ", query, " ».") : query ? /*#__PURE__*/React.createElement(React.Fragment, null, "Aucun titre ni résumé ne correspond à « ", query, " ».") : /*#__PURE__*/React.createElement(React.Fragment, null, "Aucun épisode daté pour la ", seasonLabel(season).toLowerCase(), ".")), hasSpokenHits ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "wall-empty-lead"
  }, "Mais ces mots ont été prononcés à l’antenne :", ' ', /*#__PURE__*/React.createElement("strong", null, transcripts.total.toLocaleString('fr-FR'), " passage", transcripts.total > 1 ? 's' : ''), "."), /*#__PURE__*/React.createElement("a", {
    href: "#antenne",
    className: "wall-empty-cta"
  }, "Voir les passages ↓")) : transcripts.status === 'loading' ? /*#__PURE__*/React.createElement("div", {
    className: "wall-empty-lead"
  }, "Recherche dans ce qui a été dit à l’antenne…") : /*#__PURE__*/React.createElement("button", {
    onClick: clearFilters,
    className: "wall-empty-cta"
  }, "Effacer les filtres")), /*#__PURE__*/React.createElement(TranscriptResults, {
    state: transcripts
  }), hasMore && /*#__PURE__*/React.createElement("div", {
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
  }, "chargement…"), !hasMore && filtered.length > 0 && /*#__PURE__*/React.createElement("footer", {
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
  }, "Vous êtes arrivé·e au bout du catalogue."), /*#__PURE__*/React.createElement("a", {
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
  }, "Tous les épisodes sur Radio France ↗"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      fontFamily: '"DM Mono", monospace',
      fontSize: 10,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color: 'rgba(243,239,230,0.42)'
    }
  }, "complorama · le mur des épisodes"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      fontFamily: '"DM Mono", monospace',
      fontSize: 10,
      letterSpacing: '0.15em',
      color: 'rgba(243,239,230,0.4)'
    }
  }, "vibécodé par", ' ', /*#__PURE__*/React.createElement("a", {
    href: "https://tristan.pro",
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      color: 'rgba(243,239,230,0.6)',
      textDecoration: 'none',
      borderBottom: '1px solid rgba(243,239,230,0.25)'
    }
  }, "Tristan Mendès France"))), /*#__PURE__*/React.createElement("style", null, `
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

        /* Scroll-spy bar under the current season's chip. It lives inside the
           strip (so it scrolls with it on phones) in the 6px bottom padding. */
        .season-cursor {
          position: absolute;
          left: 0;
          bottom: 0;
          height: 2px;
          border-radius: 2px;
          background: #e63946;
          box-shadow: 0 0 8px rgba(230,57,70,0.55);
          pointer-events: none;
          transition: transform 380ms cubic-bezier(.2,.7,.3,1), width 380ms cubic-bezier(.2,.7,.3,1), opacity 200ms;
        }
        @media (prefers-reduced-motion: reduce) {
          .season-cursor { transition: opacity 200ms; }
        }

        /* Bloc affiché quand aucune tuile ne correspond. Il se resserre
           quand des passages attendent plus bas : un grand vide laisserait
           croire que la recherche est terminée. */
        .wall-empty { padding: 88px 48px 96px; text-align: center; }
        .wall-empty-tight { padding: 44px 48px 32px; }
        .wall-empty-title {
          font-family: "Fraunces", Georgia, serif;
          font-style: italic; font-size: 22px;
          color: rgba(243,239,230,0.7);
          margin-bottom: 14px;
        }
        .wall-empty-lead {
          font-family: "DM Mono", monospace;
          font-size: 12.5px; letter-spacing: 0.04em;
          color: rgba(243,239,230,0.65);
          margin-bottom: 20px;
        }
        .wall-empty-lead strong { color: #f3efe6; }
        .wall-empty-cta {
          display: inline-block;
          padding: 10px 20px;
          border-radius: 999px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.22);
          color: #f3efe6;
          cursor: pointer;
          text-decoration: none;
          font-family: "DM Mono", monospace;
          font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
          transition: background 160ms, border-color 160ms;
        }
        .wall-empty-cta:hover, .wall-empty-cta:focus-visible {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.45);
        }
        @media (max-width: 600px) {
          .wall-empty { padding: 56px 20px 64px; }
          .wall-empty-tight { padding: 32px 20px 24px; }
          .wall-empty-title { font-size: 19px; }
        }

        /* Ce qui a été dit à l'antenne — résultats de la recherche dans les
           transcriptions. Volontairement en liste et non en tuiles : ce sont
           des citations à lire, pas des vignettes à parcourir, et il ne faut
           pas concurrencer visuellement le mur au-dessus. */
        .tr-section {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 40px 48px 8px;
        }
        .tr-head {
          display: flex;
          align-items: baseline;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }
        .tr-title {
          font-family: "Fraunces", Georgia, serif;
          font-size: 21px;
          font-weight: 600;
          color: #f3efe6;
          margin: 0;
        }
        .tr-count, .tr-more, .tr-hit-note {
          font-family: "DM Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(243,239,230,0.5);
        }
        .tr-empty {
          font-family: "Fraunces", Georgia, serif;
          font-style: italic;
          font-size: 17px;
          color: rgba(243,239,230,0.65);
          margin: 0 0 8px;
        }
        .tr-suggestion {
          font-family: "DM Mono", monospace;
          font-size: 12.5px; line-height: 1.65;
          color: rgba(243,239,230,0.8);
          background: rgba(230,57,70,0.10);
          border-left: 2px solid #e63946;
          padding: 11px 14px;
          border-radius: 0 6px 6px 0;
          margin: 0 0 18px;
        }
        .tr-suggestion em { font-style: normal; text-decoration: line-through; opacity: 0.65; }
        .tr-suggestion strong { color: #fff; }
        .tr-suggestion-why { color: rgba(243,239,230,0.5); }
        .tr-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
        .tr-hit-card {
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 10px;
          padding: 16px 18px;
          background: rgba(255,255,255,0.025);
        }
        .tr-hit-meta {
          display: flex; align-items: center; gap: 12px;
          font-family: "DM Mono", monospace;
          font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(243,239,230,0.5);
          margin-bottom: 6px;
        }
        .tr-hit-num { color: #e63946; }
        .tr-hit-title {
          font-family: "Fraunces", Georgia, serif;
          font-size: 16px; font-weight: 600; color: #f3efe6;
          margin: 0 0 8px; line-height: 1.3;
        }
        .tr-hit-quote {
          font-family: "Fraunces", Georgia, serif;
          font-size: 16.5px; line-height: 1.6;
          color: rgba(243,239,230,0.9);
          margin: 0 0 12px;
        }
        .tr-hit-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .tr-hit-time {
          font-family: "DM Mono", monospace;
          font-size: 12px; color: rgba(243,239,230,0.75);
          white-space: nowrap;
        }
        .tr-hit-btn {
          display: inline-block;
          padding: 6px 13px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 999px;
          font-family: "DM Mono", monospace;
          font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
          color: #f3efe6; text-decoration: none;
          transition: background 160ms, border-color 160ms;
        }
        .tr-hit-btn:hover, .tr-hit-btn:focus-visible {
          background: rgba(255,255,255,0.10);
          border-color: rgba(255,255,255,0.4);
        }
        /* Le lien vidéo ouvre YouTube dans un onglet : aucun lecteur n'est
           intégré à la page, donc Google n'est jamais chargé sans un clic. */
        .tr-hit-btn-video {
          border-color: rgba(255,0,0,0.55);
          background: rgba(255,0,0,0.14);
        }
        .tr-hit-btn-video:hover, .tr-hit-btn-video:focus-visible {
          background: rgba(255,0,0,0.26);
          border-color: rgba(255,0,0,0.8);
        }
        .tr-more { margin: 16px 0 0; }
        @media (max-width: 600px) {
          .tr-section { padding: 32px 18px 8px; }
          .tr-hit-quote { font-size: 15.5px; }
          .tr-hit-actions { gap: 8px; }
        }

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
          .season-chips { flex: 1 0 100% !important; order: 3; }
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
