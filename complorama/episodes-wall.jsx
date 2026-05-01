// Mur des émissions Complorama — dark wall, edge-to-edge square tiles.
// Real images when available, generated visuals as placeholders.
// Number + title overlaid on each tile. Tiles link externally.
// Responsive grid with infinite-scroll progressive loading.

const PAGE_SIZE = 20;

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
      <header style={{
        position: 'relative',
        background: '#0a0a0c',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '2048 / 512',
          maxHeight: 260,
          overflow: 'hidden',
          background: '#0a0a0c',
        }}>
          <img
            src="assets/logo-banner.webp"
            alt="Complorama"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: 0.95,
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(10,10,12,0) 55%, rgba(10,10,12,1) 100%)',
            pointerEvents: 'none',
          }} />
        </div>

        <div className="hero-meta" style={{
          padding: '24px 48px 32px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 32,
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: '1 1 auto', minWidth: 280 }}>
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
              fontSize: 'clamp(48px, 7vw, 84px)',
              lineHeight: 0.92,
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
          .hero-meta { padding: 20px 24px 24px !important; }
          .search-bar { padding: 12px 24px !important; }
        }
        @media (max-width: 600px) {
          .ep-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}

window.EpisodesWall = EpisodesWall;
