// Mur des émissions Complorama — dark wall, edge-to-edge square tiles.
// Real images when available, generated visuals as placeholders.
// Number + title overlaid on each tile. Tiles link externally.
// Responsive grid with infinite-scroll progressive loading.

const PAGE_SIZE = 20;

const SUBSCRIBE_LINKS = [
  {
    name: 'Apple Podcasts',
    short: 'Apple',
    url: 'https://podcasts.apple.com/fr/podcast/complorama/id1550565028',
    color: '#A855F7',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12c0 4.7 3.1 8.7 7.4 10v-3.5c-.5-.2-1-.5-1.4-.9-.6-.6-1-1.4-1-2.3 0-1.7 1.4-3.1 3.5-3.1s3.5 1.4 3.5 3.1c0 .9-.4 1.7-1 2.3-.4.4-.9.7-1.4.9V22c4.3-1.3 7.4-5.3 7.4-10 0-5.8-4.7-10.5-10.5-10.5zm0 5.4c1.7 0 3.1 1.4 3.1 3.1S13.7 13.1 12 13.1s-3.1-1.4-3.1-3.1S10.3 6.9 12 6.9z"/>
      </svg>
    ),
  },
  {
    name: 'Spotify',
    short: 'Spotify',
    url: 'https://open.spotify.com/show/0wERGyH0D5UKL6ZZkG9SMW',
    color: '#1DB954',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.5 17.3c-.2.4-.7.5-1 .3-2.8-1.7-6.4-2.1-10.6-1.1-.4.1-.8-.2-.9-.5-.1-.4.2-.8.5-.9 4.6-1 8.5-.6 11.7 1.3.3.2.4.6.3.9zm1.5-3.2c-.3.4-.8.6-1.3.3-3.2-2-8.1-2.5-11.9-1.4-.5.2-1-.1-1.2-.6-.2-.5.1-1 .6-1.2 4.3-1.3 9.7-.7 13.4 1.5.4.3.6.9.4 1.4zm.1-3.4C15.3 8.4 8.7 8.2 4.9 9.4c-.6.2-1.2-.2-1.4-.7-.2-.6.2-1.2.7-1.4 4.3-1.3 11.6-1.1 16 1.5.5.3.7 1 .4 1.5-.3.5-1 .7-1.5.4z"/>
      </svg>
    ),
  },
  {
    name: 'Deezer',
    short: 'Deezer',
    url: 'https://www.deezer.com/fr/show/2272072',
    color: '#A238FF',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <rect x="0"  y="17" width="4" height="4" rx="0.6" />
        <rect x="5"  y="17" width="4" height="4" rx="0.6" />
        <rect x="10" y="17" width="4" height="4" rx="0.6" />
        <rect x="15" y="17" width="4" height="4" rx="0.6" />
        <rect x="20" y="17" width="4" height="4" rx="0.6" />
        <rect x="5"  y="12" width="4" height="4" rx="0.6" />
        <rect x="10" y="12" width="4" height="4" rx="0.6" />
        <rect x="15" y="12" width="4" height="4" rx="0.6" />
        <rect x="20" y="12" width="4" height="4" rx="0.6" />
        <rect x="10" y="7"  width="4" height="4" rx="0.6" />
        <rect x="15" y="7"  width="4" height="4" rx="0.6" />
        <rect x="20" y="7"  width="4" height="4" rx="0.6" />
        <rect x="20" y="2"  width="4" height="4" rx="0.6" />
      </svg>
    ),
  },
  {
    name: 'Amazon Music',
    short: 'Amazon',
    url: 'https://music.amazon.fr/podcasts/3df44b2f-e59b-4152-aa46-c5c8b44fdc64/complorama',
    color: '#25D1DA',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="2" />
        <path d="M3.5 18 C 8 22, 16 22, 20.5 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Podcast Addict',
    short: 'Podcast Addict',
    url: 'https://podcastaddict.com/podcast/complorama/3222339',
    color: '#F4791F',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2 a10 10 0 1 0 0 20 a10 10 0 0 0 0 -20 z M12 6 a6 6 0 1 1 -0.01 0 z" />
        <circle cx="12" cy="12" r="2.4" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    short: 'YouTube',
    url: 'https://www.youtube.com/playlist?list=PLg6GanYvTasWMem6U2VUxc9sQ6a7T7sIe',
    color: '#FF0000',
    icon: (
      <svg width="16" height="14" viewBox="0 0 24 17" fill="currentColor" aria-hidden="true">
        <path d="M23.5 2.7c-.3-1-1.1-1.8-2.1-2.1C19.5 0 12 0 12 0S4.5 0 2.6.6C1.6.9.8 1.7.5 2.7 0 4.6 0 8.5 0 8.5s0 3.9.5 5.8c.3 1 1.1 1.8 2.1 2.1 1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6c1-.3 1.8-1.1 2.1-2.1.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8z"/>
        <polygon points="9.5,12.1 15.8,8.5 9.5,4.9" fill="#0a0a0c"/>
      </svg>
    ),
  },
  {
    name: 'Flux RSS',
    short: 'RSS',
    url: 'https://radiofrance-podcast.net/podcast09/podcast_adc482ba-ae2e-47ec-adda-4838cd022cd4.xml',
    color: '#F26522',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="5" cy="19" r="2.6" />
        <path d="M3 11 a10 10 0 0 1 10 10 h-3 a7 7 0 0 0 -7 -7 z" />
        <path d="M3 4 a17 17 0 0 1 17 17 h-3 a14 14 0 0 0 -14 -14 z" />
      </svg>
    ),
  },
];

function SubscribeButton({ platform }) {
  const [hover, setHover] = React.useState(false);
  return (
    <a
      href={platform.url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={`S'abonner sur ${platform.name}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        borderRadius: 999,
        background: hover ? platform.color : 'rgba(255,255,255,0.06)',
        border: `1px solid ${hover ? platform.color : 'rgba(255,255,255,0.14)'}`,
        color: hover ? '#fff' : platform.color,
        textDecoration: 'none',
        fontFamily: '"DM Mono", monospace',
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        fontWeight: 500,
        transition: 'background 0.2s, color 0.2s, border-color 0.2s, transform 0.2s',
        transform: hover ? 'translateY(-1px)' : 'translateY(0)',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ display: 'inline-flex', lineHeight: 0 }}>{platform.icon}</span>
      <span className="subscribe-label">{platform.short}</span>
    </a>
  );
}

function SubscribeBar() {
  return (
    <div
      className="subscribe-bar"
      style={{
        marginTop: 22,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span style={{
        fontFamily: '"DM Mono", monospace',
        fontSize: 10,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: 'rgba(243,239,230,0.45)',
        marginRight: 6,
      }}>
        S'abonner ↗
      </span>
      {SUBSCRIBE_LINKS.map(p => <SubscribeButton key={p.name} platform={p} />)}
    </div>
  );
}

function EpisodeTile({ ep }) {
  const [hover, setHover] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);
  const accent = '#e63946';
  const hasVideo = !!ep.youtube;

  // Click anywhere on the tile (outside action buttons) opens audio.
  const openAudio = () => {
    if (ep.url) window.open(ep.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={openAudio}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        aspectRatio: '1 / 1',
        overflow: 'hidden',
        background: '#0a0a0a',
        cursor: 'pointer',
      }}
    >
      {/* Visual layer */}
      {ep.img && !imgError ? (
        <img
          src={ep.img}
          alt=""
          onError={() => setImgError(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.7s cubic-bezier(.2,.7,.3,1), filter 0.4s',
            transform: hover ? 'scale(1.06)' : 'scale(1)',
            filter: hover ? 'brightness(1) saturate(1.1)' : 'brightness(0.72) saturate(0.85)',
          }}
        />
      ) : (
        <div style={{
          position: 'absolute',
          inset: 0,
          transition: 'transform 0.7s cubic-bezier(.2,.7,.3,1), filter 0.4s',
          transform: hover ? 'scale(1.06)' : 'scale(1)',
          filter: hover ? 'brightness(1)' : 'brightness(0.85)',
        }}>
          <window.EpisodeVisual n={ep.n} />
        </div>
      )}

      {/* Bottom gradient shade */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 32%, rgba(0,0,0,0.18) 60%, rgba(0,0,0,0) 78%)',
        pointerEvents: 'none',
      }} />

      {/* Top-left: episode number */}
      <div style={{
        position: 'absolute',
        top: 14,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{
          background: hover ? accent : 'rgba(0,0,0,0.55)',
          color: '#fff',
          fontFamily: '"DM Mono", ui-monospace, monospace',
          fontSize: 10,
          letterSpacing: '0.2em',
          padding: '5px 10px 5px 16px',
          transition: 'background 0.2s',
        }}>
          N°{String(ep.n).padStart(3, '0')}
        </div>
      </div>

      {/* Top-right: VIDEO badge and/or date */}
      <div style={{
        position: 'absolute',
        top: 14,
        right: 14,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 6,
        pointerEvents: 'none',
      }}>
        {hasVideo && (
          <div style={{
            fontFamily: '"DM Mono", ui-monospace, monospace',
            fontSize: 9,
            letterSpacing: '0.22em',
            color: '#fff',
            background: 'rgba(255,255,255,0.14)',
            border: '1px solid rgba(255,255,255,0.25)',
            padding: '3px 7px',
            borderRadius: 3,
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}>
            ● VIDÉO
          </div>
        )}
        {ep.date && (
          <div style={{
            fontFamily: '"Fraunces", "Georgia", serif',
            fontStyle: 'italic',
            fontSize: 12,
            color: 'rgba(255,255,255,0.85)',
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
          }}>
            {ep.date}
          </div>
        )}
      </div>

      {/* Bottom: red accent line + title + action buttons */}
      <div style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 16,
        pointerEvents: 'none',
      }}>
        <div style={{
          height: 2,
          background: accent,
          width: hover ? 48 : 18,
          marginBottom: 10,
          transition: 'width 0.3s cubic-bezier(.2,.7,.3,1)',
        }} />
        <h3 style={{
          margin: 0,
          fontFamily: '"Archivo", "Helvetica Neue", system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 18,
          lineHeight: 1.2,
          letterSpacing: '-0.015em',
          color: '#fff',
          textShadow: '0 2px 14px rgba(0,0,0,0.55)',
          textWrap: 'balance',
        }}>
          {ep.title}
        </h3>

        {/* Action buttons — appear on hover */}
        <div style={{
          marginTop: 12,
          display: 'flex',
          gap: 8,
          opacity: hover ? 1 : 0,
          transform: hover ? 'translateY(0)' : 'translateY(-3px)',
          transition: 'opacity 0.25s, transform 0.25s',
          pointerEvents: hover ? 'auto' : 'none',
        }}>
          <a
            href={ep.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
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
              fontWeight: 500,
            }}
            title="Écouter le podcast audio"
          >
            <svg width="9" height="11" viewBox="0 0 9 11" aria-hidden="true">
              <polygon points="0,0 9,5.5 0,11" fill="#fff" />
            </svg>
            Écouter
          </a>
          {hasVideo && (
            <a
              href={ep.youtube}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
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
                fontWeight: 500,
              }}
              title="Voir la version vidéo sur YouTube"
            >
              <svg width="11" height="8" viewBox="0 0 11 8" aria-hidden="true">
                <rect x="0" y="0" width="11" height="8" rx="1.6" fill="#0a0a0c" />
                <polygon points="4,2 8,4 4,6" fill="#fff" />
              </svg>
              Vidéo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function EpisodesWall() {
  const [query, setQuery] = React.useState('');
  const [shown, setShown] = React.useState(PAGE_SIZE);
  const sentinelRef = React.useRef(null);

  const filtered = window.EPISODES.filter(e =>
    !query || e.title.toLowerCase().includes(query.toLowerCase()) || String(e.n).includes(query)
  );
  const visible = filtered.slice(0, shown);
  const hasMore = visible.length < filtered.length;

  React.useEffect(() => { setShown(PAGE_SIZE); }, [query]);

  // Infinite scroll: load more when sentinel enters viewport
  React.useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setShown(s => s + PAGE_SIZE);
      }
    }, { rootMargin: '600px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, visible.length]);

  return (
    <div style={{
      background: '#0a0a0c',
      color: '#f3efe6',
      minHeight: '100%',
      fontFamily: '"Archivo", "Helvetica Neue", system-ui, sans-serif',
    }}>
      {/* Hero header with logo banner */}
      <header className="hero" style={{
        position: 'relative',
        background: '#0a0a0c',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}>
        <div className="hero-banner" style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          background: '#0a0a0c',
        }}>
          <img
            className="hero-illustration"
            src="assets/logo-banner.webp"
            alt="Complorama"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: '85% center',
              opacity: 0.92,
            }}
          />
          <div className="hero-shade-h" style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(10,10,12,1) 0%, rgba(10,10,12,1) 40%, rgba(10,10,12,0.88) 58%, rgba(10,10,12,0.4) 76%, rgba(10,10,12,0) 92%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(10,10,12,0) 70%, rgba(10,10,12,0.85) 100%)',
            pointerEvents: 'none',
          }} />
        </div>

        <div className="hero-meta" style={{
          position: 'relative',
          padding: '56px 48px 36px',
          minHeight: 360,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 32,
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: '1 1 auto', minWidth: 280, maxWidth: 720 }}>
            <div style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(243,239,230,0.55)',
              marginBottom: 10,
            }}>
              franceinfo · podcast
            </div>
            <h1 style={{
              margin: 0,
              fontFamily: '"Archivo", "Helvetica Neue", sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(44px, 6vw, 72px)',
              lineHeight: 0.95,
              letterSpacing: '-0.035em',
              color: '#fff',
            }}>
              Complorama<span style={{ color: '#e63946' }}>.</span>
            </h1>
            <div style={{
              marginTop: 14,
              fontSize: 15,
              lineHeight: 1.5,
              color: 'rgba(243,239,230,0.7)',
              maxWidth: 640,
              fontWeight: 400,
            }}>
              Par{' '}
              <em style={{ fontStyle: 'normal', color: '#f3efe6' }}>Rudy Reichstadt</em>,{' '}
              <em style={{ fontStyle: 'normal', color: '#f3efe6' }}>Tristan Mendès France</em>{' '}
              et{' '}
              <em style={{ fontStyle: 'normal', color: '#f3efe6' }}>Noé Da Silva</em>.{' '}
              Décryptage de l'activité de la complosphère, en lien avec l'actualité.
            </div>
            <SubscribeBar />
          </div>

          <div style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: 12,
            color: 'rgba(243,239,230,0.5)',
            textAlign: 'right',
            letterSpacing: '0.06em',
            lineHeight: 1.7,
            flex: '0 0 auto',
            whiteSpace: 'nowrap',
            minWidth: 140,
          }}>
            <div style={{
              color: '#e63946',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              justifyContent: 'flex-end',
            }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#e63946',
                boxShadow: '0 0 10px #e63946',
                display: 'inline-block',
              }} />
              EN COURS
            </div>
            <div>{window.EPISODES[0] ? window.EPISODES[0].n : window.EPISODES.length} ÉPISODES</div>
            <div>SAISON 06</div>
          </div>
        </div>
      </header>

      {/* Sticky search bar */}
      <div className="search-bar" style={{
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
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'rgba(255,255,255,0.05)',
          padding: '10px 18px',
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" style={{ opacity: 0.5, flexShrink: 0 }}>
            <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Chercher un épisode, un thème, un numéro…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f3efe6',
              fontFamily: 'inherit',
              fontSize: 15,
              fontWeight: 500,
              minWidth: 0,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(243,239,230,0.6)',
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: '"DM Mono", monospace',
                padding: 0,
                flexShrink: 0,
              }}
            >✕</button>
          )}
        </div>
        <div style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: 11,
          letterSpacing: '0.15em',
          color: 'rgba(243,239,230,0.5)',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          {String(filtered.length).padStart(3, '0')} / {String(window.EPISODES.length).padStart(3, '0')}
        </div>
      </div>

      {/* Episode wall — responsive, edge-to-edge, no gap */}
      <div className="ep-grid">
        {visible.map(ep => <EpisodeTile key={ep.n} ep={ep} />)}
      </div>

      {/* Sentinel for infinite scroll */}
      {hasMore && (
        <div ref={sentinelRef} style={{
          padding: '32px 0',
          textAlign: 'center',
          fontFamily: '"DM Mono", monospace',
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(243,239,230,0.4)',
        }}>
          chargement…
        </div>
      )}

      {/* End of catalogue footer */}
      {!hasMore && (
        <footer style={{
          padding: '56px 48px 64px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontStyle: 'italic',
            fontSize: 22,
            color: 'rgba(243,239,230,0.7)',
            marginBottom: 18,
          }}>
            Vous êtes arrivé·e au bout du catalogue.
          </div>
          <a
            href="https://www.radiofrance.fr/franceinfo/podcasts/complorama"
            target="_blank"
            rel="noopener noreferrer"
            style={{
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
              fontWeight: 500,
            }}
          >
            Tous les épisodes sur Radio France ↗
          </a>
          <div style={{
            marginTop: 32,
            fontFamily: '"DM Mono", monospace',
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(243,239,230,0.3)',
          }}>
            complorama · le mur des épisodes
          </div>
          <div style={{
            marginTop: 16,
            fontFamily: '"DM Mono", monospace',
            fontSize: 10,
            letterSpacing: '0.15em',
            color: 'rgba(243,239,230,0.25)',
          }}>
            vibécodé par{' '}
            <a
              href="https://tristan.pro"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(243,239,230,0.4)', textDecoration: 'none' }}
            >Tristan Mendès France</a>
          </div>
        </footer>
      )}

      {/* Responsive grid */}
      <style>{`
        .ep-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0;
        }
        @media (max-width: 1280px) {
          .ep-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 900px) {
          .ep-grid { grid-template-columns: repeat(3, 1fr); }
          .hero-meta { padding: 36px 24px 24px !important; min-height: 280px !important; }
          .search-bar { padding: 12px 24px !important; }
          .hero-illustration { object-position: 110% center !important; opacity: 0.55 !important; }
          .hero-shade-h { background: linear-gradient(to right, rgba(10,10,12,1) 0%, rgba(10,10,12,0.95) 60%, rgba(10,10,12,0.6) 88%, rgba(10,10,12,0.3) 100%) !important; }
        }
        @media (max-width: 600px) {
          .ep-grid { grid-template-columns: repeat(2, 1fr); }
          .subscribe-bar .subscribe-label { display: none; }
        }
      `}</style>
    </div>
  );
}

window.EpisodesWall = EpisodesWall;
