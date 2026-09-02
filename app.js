// GENERATED FILE — do not edit. Source: app.jsx
// Rebuild with: node scripts/build-jsx.mjs  (CI does this on push)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useEffect,
  useRef,
  useState,
  useMemo
} = React;
const {
  motion,
  AnimatePresence
} = window.Motion || window.FramerMotion || window.framerMotion || window["framer-motion"] || {};
// framer-motion UMD exposes itself as global `Motion` sometimes; fallback
const M = window.Motion || window["framer-motion"];
const mot = M && M.motion || motion;

// ---------- Scroll-driven effects (parallax, progress, hero fade) ----------
// Respecte prefers-reduced-motion : tous les effets de scroll sont désactivés.
const PREFERS_REDUCED_MOTION = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function docTop(el) {
  let t = 0;
  while (el) {
    t += el.offsetTop;
    el = el.offsetParent;
  }
  return t;
}

// Barre de progression de lecture (fine ligne en haut de page)
function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || PREFERS_REDUCED_MOTION) return;
    let raf = null;
    const update = () => {
      raf = null;
      const h = document.documentElement;
      const max = h.scrollHeight - window.innerHeight || 1;
      const p = Math.min(1, Math.max(0, (window.scrollY || 0) / max));
      el.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    window.addEventListener('resize', onScroll, {
      passive: true
    });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed top-0 left-0 right-0 z-[60] h-[2px] pointer-events-none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      height: '100%',
      transform: 'scaleX(0)',
      transformOrigin: '0 50%',
      background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, rgba(255,255,255,0.9))',
      opacity: 0.85,
      willChange: 'transform'
    }
  }));
}

// Couche d'arrière-plan parallax (vidéos de fond) : l'inner est légèrement
// agrandi (scale) puis translaté plus lentement que le scroll, avec clamp
// pour ne jamais révéler de bord.
function ParallaxLayer({
  speed = 0.12,
  scale = 1.2,
  className = "absolute inset-0 z-0 overflow-hidden",
  mobileFactor = 0.6,
  children
}) {
  const outer = useRef(null);
  const inner = useRef(null);
  useEffect(() => {
    const o = outer.current,
      n = inner.current;
    if (!o || !n) return;
    n.style.transform = 'scale(' + scale + ')';
    if (PREFERS_REDUCED_MOTION) return;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const factor = isMobile ? speed * mobileFactor : speed;
    if (!factor) return;
    let raf = null,
      top = 0,
      h = 1;
    const measure = () => {
      top = docTop(o);
      h = o.offsetHeight || 1;
    };
    const update = () => {
      raf = null;
      const vh = window.innerHeight || 1;
      const sy = window.scrollY || 0;
      const progress = (top + h / 2 - (sy + vh / 2)) / vh;
      const maxShift = h * (scale - 1) / 2;
      let y = -progress * factor * vh;
      if (y > maxShift) y = maxShift;
      if (y < -maxShift) y = -maxShift;
      n.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0) scale(' + scale + ')';
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    update();
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    window.addEventListener('resize', onResize, {
      passive: true
    });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed, scale, mobileFactor]);
  return /*#__PURE__*/React.createElement("div", {
    ref: outer,
    className: className
  }, /*#__PURE__*/React.createElement("div", {
    ref: inner,
    className: "absolute inset-0",
    style: {
      willChange: 'transform'
    }
  }, children));
}

// Parallax de contenu (cartes) : dérive verticale subtile à vitesse
// différentielle. Désactivé sur mobile par défaut (mobileFactor = 0).
function Parallax({
  speed = 0.06,
  className = "",
  mobileFactor = 0,
  children
}) {
  const outer = useRef(null);
  const inner = useRef(null);
  useEffect(() => {
    const o = outer.current,
      n = inner.current;
    if (!o || !n || PREFERS_REDUCED_MOTION) return;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const factor = isMobile ? speed * mobileFactor : speed;
    if (!factor) return;
    let raf = null,
      top = 0,
      h = 1;
    const measure = () => {
      top = docTop(o);
      h = o.offsetHeight || 1;
    };
    const update = () => {
      raf = null;
      const vh = window.innerHeight || 1;
      const sy = window.scrollY || 0;
      const progress = (top + h / 2 - (sy + vh / 2)) / vh;
      n.style.transform = 'translate3d(0,' + (-progress * factor * vh).toFixed(1) + 'px,0)';
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    update();
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    window.addEventListener('resize', onResize, {
      passive: true
    });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed, mobileFactor]);
  return /*#__PURE__*/React.createElement("div", {
    ref: outer,
    className: className
  }, /*#__PURE__*/React.createElement("div", {
    ref: inner,
    style: {
      willChange: 'transform',
      height: '100%'
    }
  }, children));
}

// Fondu + recul du contenu du hero au défilement
function HeroFade({
  className,
  children
}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || PREFERS_REDUCED_MOTION) return;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const lift = isMobile ? 0.06 : 0.12;
    let raf = null;
    const update = () => {
      raf = null;
      const vh = window.innerHeight || 1;
      const sy = window.scrollY || 0;
      const p = Math.min(1, Math.max(0, sy / (vh * 0.85)));
      el.style.opacity = String(1 - p * 0.95);
      el.style.transform = 'translate3d(0,' + (-sy * lift).toFixed(1) + 'px,0)';
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    window.addEventListener('resize', onScroll, {
      passive: true
    });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: className,
    style: {
      willChange: 'transform,opacity'
    }
  }, children);
}

// ---------- Icons (inline SVG, matching lucide stroke style) ----------
const Icon = ({
  children,
  size = 16,
  className = "",
  strokeWidth = 1.75
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: strokeWidth,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: className
}, children);
const ArrowUpRight = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("line", {
  x1: "7",
  y1: "17",
  x2: "17",
  y2: "7"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "7 7 17 7 17 17"
}));
const ArrowUp = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "19",
  x2: "12",
  y2: "5"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "5 12 12 5 19 12"
}));
const Play = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("polygon", {
  points: "6 4 20 12 6 20 6 4",
  fill: "currentColor",
  stroke: "currentColor"
}));
const Zap = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("polygon", {
  points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2"
}));
const Palette = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
  cx: "13.5",
  cy: "6.5",
  r: ".5",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "17.5",
  cy: "10.5",
  r: ".5",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "8.5",
  cy: "7.5",
  r: ".5",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "6.5",
  cy: "12.5",
  r: ".5",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.8 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.8.7-1.5 1.5-1.5H16c3.3 0 6-2.7 6-6 0-5-4.5-9-10-9z"
}));
const BarChart3 = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M3 3v18h18"
}), /*#__PURE__*/React.createElement("path", {
  d: "M8 17V9"
}), /*#__PURE__*/React.createElement("path", {
  d: "M13 17V5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M18 17v-3"
}));
const Shield = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
}));
const Menu = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("line", {
  x1: "4",
  y1: "8",
  x2: "20",
  y2: "8"
}), /*#__PURE__*/React.createElement("line", {
  x1: "4",
  y1: "16",
  x2: "20",
  y2: "16"
}));
const X = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("line", {
  x1: "18",
  y1: "6",
  x2: "6",
  y2: "18"
}), /*#__PURE__*/React.createElement("line", {
  x1: "6",
  y1: "6",
  x2: "18",
  y2: "18"
}));

// ---------- HLS video hook ----------
function useHls(src) {
  const ref = useRef(null);
  useEffect(() => {
    const video = ref.current;
    if (!video || !src) return;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    let hls;
    const isHls = /\.m3u8(\?|$)/i.test(src);
    if (!isHls) {
      video.src = src;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }
    const tryPlay = () => {
      video.play().catch(() => {});
    };
    video.addEventListener('loadedmetadata', tryPlay);
    video.addEventListener('loadeddata', tryPlay);
    video.addEventListener('canplay', tryPlay);
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) tryPlay();
      });
    }, {
      threshold: 0.1
    });
    io.observe(video);
    return () => {
      video.removeEventListener('loadedmetadata', tryPlay);
      video.removeEventListener('loadeddata', tryPlay);
      video.removeEventListener('canplay', tryPlay);
      io.disconnect();
      if (hls) hls.destroy();
    };
  }, [src]);
  return ref;
}

// ---------- Obfuscated mail link (anti-spam) ----------
// Les deux moitiés de l'adresse sont stockées en codes de caractères décalés,
// jamais en base64 (que certains moissonneurs décodent au passage) ni en clair.
// Elles ne sont réassemblées en mémoire qu'au clic du visiteur.
const MAIL_OFFSET = 7;
const MAIL_A = [106, 118, 117, 123, 104, 106, 123];
const MAIL_B = [123, 121, 112, 122, 123, 104, 117, 53, 119, 121, 118];
function decodeMail() {
  try {
    const part = arr => arr.map(c => String.fromCharCode(c - MAIL_OFFSET)).join('');
    return part(MAIL_A) + String.fromCharCode(64) + part(MAIL_B);
  } catch (e) {
    return "";
  }
}
function MailLink({
  subject,
  children,
  className,
  style
}) {
  const handleClick = e => {
    e.preventDefault();
    const addr = decodeMail();
    const q = subject ? "?subject=" + encodeURIComponent(subject) : "";
    window.location.href = "mai" + "lto:" + addr + q;
  };
  return /*#__PURE__*/React.createElement("a", {
    href: "#contact",
    onClick: handleClick,
    className: className,
    style: style,
    rel: "nofollow"
  }, children);
}

// ---------- BlurText ----------
function BlurText({
  text,
  className = "",
  delay = 100,
  direction = "bottom",
  as = "h1",
  splitBy = "word"
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true);
        io.disconnect();
      }
    }, {
      threshold: 0.2
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const tokens = splitBy === 'word' ? text.split(' ') : text.split('');
  const Tag = as;
  const fromY = direction === 'bottom' ? 50 : -50;
  return /*#__PURE__*/React.createElement(Tag, {
    ref: ref,
    className: className
  }, tokens.map((t, i) => {
    const isLast = i === tokens.length - 1;
    const isWordSplit = splitBy === 'word';
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, /*#__PURE__*/React.createElement(mot.span, {
      style: {
        display: 'inline-block',
        willChange: 'transform,filter,opacity'
      },
      initial: {
        filter: 'blur(10px)',
        opacity: 0,
        y: fromY
      },
      animate: visible ? {
        filter: 'blur(0px)',
        opacity: 1,
        y: 0
      } : {},
      transition: {
        duration: 0.7,
        delay: i * delay / 1000,
        ease: [0.2, 0.7, 0.2, 1]
      }
    }, t === ' ' ? '\u00A0' : t), isWordSplit && !isLast ? /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-block',
        width: '0.2em'
      },
      "aria-hidden": "true"
    }) : null);
  }));
}

// ---------- Fade-in wrapper ----------
function FadeIn({
  children,
  delay = 0,
  y = 20,
  className = ""
}) {
  const kids = React.Children.map(children, (c, i) => React.isValidElement(c) ? React.cloneElement(c, {
    key: c.key || `fi-${i}`
  }) : c);
  return /*#__PURE__*/React.createElement(mot.div, {
    initial: {
      filter: 'blur(10px)',
      opacity: 0,
      y
    },
    whileInView: {
      filter: 'blur(0px)',
      opacity: 1,
      y: 0
    },
    viewport: {
      once: true,
      amount: 0.3
    },
    transition: {
      duration: 0.6,
      delay,
      ease: [0.2, 0.7, 0.2, 1]
    },
    className: className
  }, kids);
}

// ---------- Navbar ----------
function Navbar() {
  const links = [{
    l: "Accueil",
    h: "#top"
  }, {
    l: "À propos",
    h: "#apropos"
  }, {
    l: "Médias",
    h: "#projets"
  }, {
    l: "Productions",
    h: "#productions"
  }, {
    l: "Conférences",
    h: "#conferences"
  }];
  const [active, setActive] = React.useState("#top");
  const [menuOpen, setMenuOpen] = React.useState(false);
  React.useEffect(() => {
    const ids = ["top", "projets", "productions", "conferences", "apropos", "contact"];
    const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;
    const io = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActive("#" + visible[0].target.id);
    }, {
      rootMargin: "-40% 0px -50% 0px",
      threshold: [0, 0.1, 0.25, 0.5]
    });
    sections.forEach(s => io.observe(s));
    return () => io.disconnect();
  }, []);
  return /*#__PURE__*/React.createElement("nav", {
    className: "fixed top-4 left-0 right-0 z-50 px-4 md:px-8 lg:px-16 py-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#top",
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-10 w-10 rounded-full liquid-glass-strong flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(ArrowUp, {
    size: 18,
    strokeWidth: 2.2,
    className: "text-white"
  })), /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline font-heading italic text-xl text-white tracking-tight whitespace-nowrap"
  }, "tristan.pro")), /*#__PURE__*/React.createElement("div", {
    className: "hidden md:flex items-center rounded-full px-1.5 py-1 border border-white/10",
    style: {
      background: 'rgba(8,10,18,0.55)',
      backdropFilter: 'blur(18px) saturate(140%)',
      WebkitBackdropFilter: 'blur(18px) saturate(140%)',
      boxShadow: '0 8px 24px -12px rgba(0,0,0,0.5)'
    }
  }, links.map(({
    l,
    h
  }) => {
    const isActive = active === h;
    return /*#__PURE__*/React.createElement("a", {
      key: l,
      href: h,
      className: "relative px-3 py-2 text-sm font-medium font-body transition-colors whitespace-nowrap " + (isActive ? "text-white" : "text-white/70 hover:text-white")
    }, l, isActive && /*#__PURE__*/React.createElement(mot.span, {
      layoutId: "nav-active-pill",
      className: "absolute inset-0 rounded-full bg-white/12 border border-white/15 -z-10",
      transition: {
        type: "spring",
        stiffness: 380,
        damping: 32
      }
    }));
  }), /*#__PURE__*/React.createElement(MailLink, {
    className: "ml-1 bg-white text-black rounded-full px-3.5 py-1.5 text-sm font-medium font-body flex items-center gap-1 hover:bg-white/90 transition-colors whitespace-nowrap"
  }, "Me contacter ", /*#__PURE__*/React.createElement(ArrowUpRight, {
    size: 14,
    strokeWidth: 2
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setMenuOpen(o => !o),
    "aria-label": menuOpen ? "Fermer le menu" : "Ouvrir le menu",
    className: "md:hidden h-10 w-10 rounded-full liquid-glass flex items-center justify-center text-white"
  }, menuOpen ? /*#__PURE__*/React.createElement(X, {
    size: 18
  }) : /*#__PURE__*/React.createElement(Menu, {
    size: 18
  }))), menuOpen && /*#__PURE__*/React.createElement("div", {
    className: "md:hidden mt-3 ml-auto w-64 max-w-[calc(100vw-2rem)] rounded-3xl p-2 border border-white/10",
    style: {
      background: 'rgba(12,14,24,0.55)',
      backdropFilter: 'blur(32px) saturate(160%)',
      WebkitBackdropFilter: 'blur(32px) saturate(160%)',
      boxShadow: '0 20px 60px -20px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.08)'
    }
  }, links.map(({
    l,
    h
  }) => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: h,
    onClick: () => setMenuOpen(false),
    className: "block px-4 py-2.5 rounded-2xl text-white/90 hover:bg-white/10 font-body text-base whitespace-nowrap"
  }, l)), /*#__PURE__*/React.createElement(MailLink, {
    className: "block mt-1 px-4 py-2.5 rounded-2xl bg-white text-black font-medium font-body text-base text-center"
  }, "Me contacter")));
}

// ---------- Hero ----------
function Hero() {
  const videoRef = useHls("./hero.mp4");
  return /*#__PURE__*/React.createElement("section", {
    id: "top",
    className: "relative overflow-hidden flex flex-col min-h-[100svh]"
  }, /*#__PURE__*/React.createElement(ParallaxLayer, {
    speed: 0.14,
    scale: 1.22,
    mobileFactor: 0.55,
    className: "absolute inset-0 z-0 overflow-hidden"
  }, /*#__PURE__*/React.createElement("video", {
    ref: videoRef,
    className: "absolute inset-0 w-full h-full object-cover object-[70%_center] md:object-center edge-fade-bottom",
    autoPlay: true,
    loop: true,
    muted: true,
    playsInline: true,
    preload: "auto"
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 bg-black/20 edge-fade-bottom"
  })), /*#__PURE__*/React.createElement("div", {
    className: "absolute left-0 right-0 top-0 z-[1] pointer-events-none",
    style: {
      height: 180,
      background: 'linear-gradient(to top, transparent, rgba(0,0,0,0.6))'
    }
  }), /*#__PURE__*/React.createElement(HeroFade, {
    className: "relative z-10 flex-1 flex flex-col items-center px-6 pt-24 md:pt-[130px] pb-10 md:pb-16"
  }, /*#__PURE__*/React.createElement(mot.div, {
    initial: {
      filter: 'blur(10px)',
      opacity: 0,
      scale: 0.8
    },
    animate: {
      filter: 'blur(0px)',
      opacity: 1,
      scale: 1
    },
    transition: {
      duration: 0.8,
      delay: 0.1,
      ease: [0.2, 0.7, 0.2, 1]
    },
    className: "relative mb-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "liquid-glass-strong rounded-full p-1"
  }, /*#__PURE__*/React.createElement("img", {
    src: "./profile.jpg",
    alt: "Tristan Mend\xE8s France",
    className: "w-24 h-24 md:w-28 md:h-28 rounded-full object-cover",
    referrerPolicy: "no-referrer",
    onError: e => {
      const img = e.currentTarget;
      const parent = img.parentElement;
      if (!parent || parent.querySelector('[data-avatar-fb]')) return;
      img.style.display = 'none';
      const fb = document.createElement('div');
      fb.setAttribute('data-avatar-fb', '');
      fb.className = 'w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center font-heading italic text-white/95 text-3xl md:text-4xl tracking-tight';
      fb.style.background = 'radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 55%, rgba(0,0,0,0.4))';
      fb.textContent = 'tmf';
      parent.appendChild(fb);
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 ring-2 ring-black/80",
    "aria-hidden": true
  })), /*#__PURE__*/React.createElement(FadeIn, {
    delay: 0.25
  }, /*#__PURE__*/React.createElement("div", {
    className: "liquid-glass rounded-full px-1 py-1 flex items-center gap-2 pr-4 whitespace-nowrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bg-white text-black rounded-full px-3 py-1 text-xs font-semibold font-body"
  }, "2026"), /*#__PURE__*/React.createElement("span", {
    className: "text-sm text-white/90 font-body"
  }, "Disponible pour confs & interviews"))), /*#__PURE__*/React.createElement("div", {
    className: "mt-6 text-center w-full px-4"
  }, /*#__PURE__*/React.createElement(BlurText, {
    text: "Tristan Mend\xE8s France",
    as: "h1",
    delay: 100,
    className: "font-heading italic text-white leading-[0.9] whitespace-nowrap text-[clamp(2.25rem,8.5vw,5.5rem)]",
    splitBy: "word"
  })), /*#__PURE__*/React.createElement(mot.div, {
    initial: {
      filter: 'blur(10px)',
      opacity: 0,
      y: 12
    },
    animate: {
      filter: 'blur(0px)',
      opacity: 1,
      y: 0
    },
    transition: {
      duration: 0.7,
      delay: 0.65,
      ease: [0.2, 0.7, 0.2, 1]
    },
    className: "mt-6 text-sm md:text-base text-white/75 font-body uppercase tracking-[0.18em] text-center max-w-5xl md:whitespace-nowrap leading-relaxed"
  }, "Journalisme ", /*#__PURE__*/React.createElement("span", {
    className: "mx-2 text-white/35"
  }, "\xB7"), " cultures num\xE9riques ", /*#__PURE__*/React.createElement("span", {
    className: "mx-2 text-white/35"
  }, "\xB7"), " complotisme & radicalit\xE9s en ligne"), /*#__PURE__*/React.createElement(mot.p, {
    initial: {
      filter: 'blur(10px)',
      opacity: 0,
      y: 20
    },
    animate: {
      filter: 'blur(0px)',
      opacity: 1,
      y: 0
    },
    transition: {
      duration: 0.6,
      delay: 0.9,
      ease: [0.2, 0.7, 0.2, 1]
    },
    className: "mt-6 text-lg md:text-xl text-white/85 font-body font-light leading-relaxed text-center max-w-2xl"
  }, "Je travaille sur la fa\xE7on dont le num\xE9rique transforme la soci\xE9t\xE9, la d\xE9mocratie et les formes contemporaines de radicalit\xE9."), /*#__PURE__*/React.createElement(mot.div, {
    initial: {
      filter: 'blur(10px)',
      opacity: 0,
      y: 20
    },
    animate: {
      filter: 'blur(0px)',
      opacity: 1,
      y: 0
    },
    transition: {
      duration: 0.6,
      delay: 1.1,
      ease: [0.2, 0.7, 0.2, 1]
    },
    className: "mt-8 flex items-center gap-5"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#projets",
    className: "liquid-glass-strong rounded-full px-6 py-3 text-base font-medium text-white font-body whitespace-nowrap hover:bg-white/10 transition-colors"
  }, "Voir les projets"), /*#__PURE__*/React.createElement(MailLink, {
    className: "liquid-glass rounded-full px-6 py-3 text-base font-medium text-white/90 flex items-center gap-2 font-body hover:text-white whitespace-nowrap transition-colors"
  }, /*#__PURE__*/React.createElement(Play, {
    size: 14
  }), " Me contacter")), /*#__PURE__*/React.createElement(mot.div, {
    initial: {
      opacity: 0,
      y: 10
    },
    animate: {
      opacity: 1,
      y: 0
    },
    transition: {
      duration: 0.6,
      delay: 1.35,
      ease: [0.2, 0.7, 0.2, 1]
    },
    className: "mt-7 flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("a", {
    href: "http://www.linkedin.com/in/tristanmf",
    target: "_blank",
    rel: "noopener noreferrer",
    "aria-label": "LinkedIn",
    className: "liquid-glass h-12 w-12 rounded-full flex items-center justify-center text-white/75 hover:text-white hover:bg-white/15 transition-colors"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "19",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
  }))), /*#__PURE__*/React.createElement("a", {
    href: "https://www.facebook.com/tristan.mendes.france",
    target: "_blank",
    rel: "noopener noreferrer",
    "aria-label": "Facebook",
    className: "liquid-glass h-12 w-12 rounded-full flex items-center justify-center text-white/75 hover:text-white hover:bg-white/15 transition-colors"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "19",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
  }))), /*#__PURE__*/React.createElement("a", {
    href: "https://www.instagram.com/tristanmf/",
    target: "_blank",
    rel: "noopener noreferrer",
    "aria-label": "Instagram",
    className: "liquid-glass h-12 w-12 rounded-full flex items-center justify-center text-white/75 hover:text-white hover:bg-white/15 transition-colors"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "19",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "20",
    rx: "5",
    ry: "5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "17.5",
    y1: "6.5",
    x2: "17.51",
    y2: "6.5"
  }))), /*#__PURE__*/React.createElement("a", {
    href: "https://x.com/tristanmf",
    target: "_blank",
    rel: "noopener noreferrer",
    "aria-label": "X / Twitter",
    className: "liquid-glass h-12 w-12 rounded-full flex items-center justify-center text-white/75 hover:text-white hover:bg-white/15 transition-colors"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "17",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
  }))), /*#__PURE__*/React.createElement("a", {
    href: "https://bsky.app/profile/tmf.bsky.social",
    target: "_blank",
    rel: "noopener noreferrer",
    "aria-label": "Bluesky",
    className: "liquid-glass h-12 w-12 rounded-full flex items-center justify-center text-white/75 hover:text-white hover:bg-white/15 transition-colors"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "19",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 0 0 0 3.2c0 .324.018 2.846.166 3.653.644 3.515 4.363 4.606 6.758 3.553-2.585.808-3.484 2.505-1.782 4.629 2.508 2.508 5.768-.426 6.858-1.77.108-.134.217-.268.318-.396l.123.149c1.09 1.344 4.35 4.278 6.858 1.77 1.702-2.124.803-3.82-1.782-4.629 2.395 1.053 6.114-.038 6.758-3.553.148-.807.166-3.329.166-3.653 0-3.2-2.566-2.256-5.202-.395C16.046 4.747 13.087 8.686 12 10.8z"
  }))), /*#__PURE__*/React.createElement("a", {
    href: "https://www.threads.com/@tristanmf",
    target: "_blank",
    rel: "noopener noreferrer",
    "aria-label": "Threads",
    className: "liquid-glass h-12 w-12 rounded-full flex items-center justify-center text-white/75 hover:text-white hover:bg-white/15 transition-colors"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "19",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65z"
  })))), /*#__PURE__*/React.createElement(mot.a, {
    href: "#apropos",
    initial: {
      opacity: 0,
      y: -10
    },
    animate: {
      opacity: 1,
      y: 0
    },
    transition: {
      duration: 0.6,
      delay: 1.6,
      ease: [0.2, 0.7, 0.2, 1]
    },
    className: "mt-8 md:mt-auto pt-2 md:pt-12 flex flex-col items-center gap-2 group",
    "aria-label": "D\xE9filer vers \xC0 propos"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] uppercase tracking-[0.18em] text-white/50 font-body group-hover:text-white/80 transition-colors"
  }, "D\xE9filer"), /*#__PURE__*/React.createElement(mot.div, {
    animate: {
      y: [0, 6, 0]
    },
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: 'easeInOut'
    },
    className: "liquid-glass-strong rounded-full h-10 w-10 flex items-center justify-center text-white"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M19 12l-7 7-7-7"
  }))))));
}

// ---------- Start Section ----------
function StartSection() {
  return /*#__PURE__*/React.createElement("section", {
    id: "apropos",
    className: "relative overflow-hidden min-h-[360px] md:min-h-[480px]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative z-10 flex flex-col items-center justify-center text-center px-6 py-16 md:py-28 min-h-[360px] md:min-h-[480px]"
  }, /*#__PURE__*/React.createElement(FadeIn, null, /*#__PURE__*/React.createElement("div", {
    className: "liquid-glass rounded-full px-5 py-2 text-sm font-medium text-white font-body whitespace-nowrap"
  }, "\xC0 propos")), /*#__PURE__*/React.createElement("div", {
    className: "mt-6 max-w-3xl"
  }, /*#__PURE__*/React.createElement(BlurText, {
    text: "Comprendre ce qui se joue en ligne.",
    as: "h2",
    delay: 90,
    splitBy: "word",
    className: "text-3xl md:text-4xl lg:text-5xl font-heading italic tracking-tight leading-[1.05] text-white whitespace-nowrap"
  })), /*#__PURE__*/React.createElement(FadeIn, {
    delay: 0.3
  }, /*#__PURE__*/React.createElement("p", {
    className: "mt-6 max-w-2xl text-white/85 font-body font-light text-lg md:text-xl leading-relaxed"
  }, "Ma\xEEtre de conf\xE9rences associ\xE9 en cultures num\xE9riques \xE0 l'Universit\xE9 Paris Cit\xE9 et enseignant au CELSA, je suis sp\xE9cialiste des cultures num\xE9riques et des radicalit\xE9s en ligne.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), "Je coanime le podcast ", /*#__PURE__*/React.createElement("span", {
    className: "italic text-white"
  }, "\xAB\xA0Complorama\xA0\xBB"), " (France Info), collabore \xE0 ", /*#__PURE__*/React.createElement("span", {
    className: "italic text-white"
  }, "Conspiracy Watch"), " et participe \xE0 l'\xE9mission ", /*#__PURE__*/React.createElement("span", {
    className: "italic text-white"
  }, "\xAB\xA0Les V\xE9rificateurs\xA0\xBB"), " (LCI)."))));
}

// ---------- Features Chess ----------
// ---------- Card with real image ----------
function MediaCard({
  href,
  img,
  kicker,
  title,
  body,
  cta,
  badge,
  compact
}) {
  const aspect = compact ? 'aspect-[3/2]' : 'aspect-[4/3]';
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    target: "_blank",
    rel: "noopener",
    className: "group block liquid-glass rounded-2xl overflow-hidden h-full flex flex-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: `relative ${aspect} overflow-hidden`
  }, /*#__PURE__*/React.createElement("img", {
    src: img,
    alt: title,
    className: "absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
  }), badge && /*#__PURE__*/React.createElement("div", {
    className: "absolute top-4 left-4 rounded-full px-3 py-1 text-[11px] font-medium text-white font-body border border-white/15",
    style: {
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)'
    }
  }, badge)), /*#__PURE__*/React.createElement("div", {
    className: "p-6 flex-1 flex flex-col"
  }, kicker && /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] uppercase tracking-[0.15em] text-white/50 font-body font-medium mb-2"
  }, kicker), /*#__PURE__*/React.createElement("h4", {
    className: "font-heading italic text-2xl md:text-3xl text-white leading-tight"
  }, title), /*#__PURE__*/React.createElement("p", {
    className: "mt-3 text-white/65 font-body font-light text-base leading-relaxed flex-1"
  }, body), /*#__PURE__*/React.createElement("div", {
    className: "mt-5 inline-flex items-center gap-2 text-sm font-medium text-white/90 font-body"
  }, cta, " ", /*#__PURE__*/React.createElement(ArrowUpRight, {
    size: 14,
    strokeWidth: 2,
    className: "transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
  }))));
}

// ---------- Features Chess ----------
function FeatureRow({
  reverse,
  title,
  body,
  cta,
  href,
  label,
  tint
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10 md:gap-16`
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1 max-w-xl"
  }, /*#__PURE__*/React.createElement(FadeIn, null, /*#__PURE__*/React.createElement("h3", {
    className: "text-3xl md:text-4xl lg:text-5xl font-heading italic text-white tracking-tight leading-[0.95]"
  }, title)), /*#__PURE__*/React.createElement(FadeIn, {
    delay: 0.15
  }, /*#__PURE__*/React.createElement("p", {
    className: "mt-5 text-white/70 font-body font-light text-sm md:text-base max-w-md"
  }, body)), /*#__PURE__*/React.createElement(FadeIn, {
    delay: 0.3
  }, /*#__PURE__*/React.createElement("a", {
    href: href,
    target: "_blank",
    rel: "noopener",
    className: "mt-7 inline-flex liquid-glass-strong rounded-full px-5 py-2.5 text-sm font-medium text-white items-center gap-2 font-body"
  }, cta, " ", /*#__PURE__*/React.createElement(ArrowUpRight, {
    size: 14,
    strokeWidth: 2
  })))), /*#__PURE__*/React.createElement(FadeIn, {
    delay: 0.2,
    className: "flex-1 w-full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "liquid-glass rounded-2xl overflow-hidden aspect-[4/3] w-full relative"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0",
    style: {
      background: tint || 'radial-gradient(120% 80% at 30% 20%, rgba(120,160,220,0.25), transparent 60%), radial-gradient(100% 80% at 80% 90%, rgba(180,200,240,0.18), transparent 60%), #0b1220'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-6 rounded-xl bg-black/40 border border-white/10 p-5 flex flex-col gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "h-2 w-2 rounded-full bg-white/30"
  }), /*#__PURE__*/React.createElement("span", {
    className: "h-2 w-2 rounded-full bg-white/30"
  }), /*#__PURE__*/React.createElement("span", {
    className: "h-2 w-2 rounded-full bg-white/30"
  })), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-white/40 font-mono uppercase tracking-wider"
  }, "on air")), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 flex flex-col justify-end gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-3 w-20 rounded-full bg-white/20"
  }), /*#__PURE__*/React.createElement("div", {
    className: "font-heading italic text-white text-2xl md:text-3xl leading-tight"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "h-2 w-32 rounded-full bg-white/10"
  }), /*#__PURE__*/React.createElement("div", {
    className: "h-2 w-24 rounded-full bg-white/10"
  }), /*#__PURE__*/React.createElement("div", {
    className: "mt-2 flex gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-1 flex-1 rounded-full bg-white/30"
  }), /*#__PURE__*/React.createElement("div", {
    className: "h-1 flex-1 rounded-full bg-white/10"
  }), /*#__PURE__*/React.createElement("div", {
    className: "h-1 flex-1 rounded-full bg-white/10"
  }), /*#__PURE__*/React.createElement("div", {
    className: "h-1 flex-1 rounded-full bg-white/10"
  }))))))));
}
function FeaturesChess() {
  return /*#__PURE__*/React.createElement("section", {
    id: "projets",
    className: "px-6 md:px-12 lg:px-24 py-16 md:py-28"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-3xl mb-16"
  }, /*#__PURE__*/React.createElement(FadeIn, null, /*#__PURE__*/React.createElement("div", {
    className: "inline-flex items-center gap-2.5 liquid-glass rounded-full pl-4 pr-5 py-3 whitespace-nowrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-[11px] uppercase tracking-[0.2em] text-white/60"
  }, "[\u200901\u2009]"), /*#__PURE__*/React.createElement("span", {
    className: "text-white font-body text-base md:text-lg tracking-tight"
  }, "T\xE9l\xE9, radio, podcast")))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-6"
  }, /*#__PURE__*/React.createElement(Parallax, {
    speed: 0,
    className: "h-full"
  }, /*#__PURE__*/React.createElement(FadeIn, {
    delay: 0,
    className: "h-full"
  }, /*#__PURE__*/React.createElement(MediaCard, {
    href: "./complorama/",
    img: "./complorama.jpg",
    badge: "Podcast",
    kicker: "France Info",
    title: "Complorama",
    body: "Co-producteur et coanimateur de ce podcast France Info qui explore les dynamiques du complotisme contemporain.",
    cta: "Voir tous les \xE9pisodes"
  }))), /*#__PURE__*/React.createElement(Parallax, {
    speed: 0,
    className: "h-full"
  }, /*#__PURE__*/React.createElement(FadeIn, {
    delay: 0.1,
    className: "h-full"
  }, /*#__PURE__*/React.createElement(MediaCard, {
    href: "https://www.radiofrance.fr/franceinter/podcasts/antidote",
    img: "./antidote.jpg",
    badge: "Radio",
    kicker: "France Inter",
    title: "Antidote",
    body: "Chroniqueur de la matinale de France Inter de 2020 \xE0 2022 \u2014 un an et demi \xE0 d\xE9crypter, chaque semaine, les soubresauts de la complosph\xE8re.",
    cta: "D\xE9couvrir"
  }))), /*#__PURE__*/React.createElement(Parallax, {
    speed: 0,
    className: "h-full"
  }, /*#__PURE__*/React.createElement(FadeIn, {
    delay: 0.2,
    className: "h-full"
  }, /*#__PURE__*/React.createElement(MediaCard, {
    href: "https://www.tf1info.fr/emissions/lci/verificateurs-14293/",
    img: "./lci.jpg",
    badge: "TV",
    kicker: "LCI",
    title: "Les V\xE9rificateurs",
    body: "Consultant hebdomadaire de l'\xE9mission de 2025 \xE0 2026 \u2014 v\xE9rifier l'info en direct et d\xE9construire la d\xE9sinformation.",
    cta: "Voir l'\xE9mission"
  })))));
}

// ---------- Features Grid (Institutionnel) ----------
function FeaturesGrid() {
  const items = [{
    img: "./conspiracywatch.jpg",
    kicker: "Observatoire",
    title: "Conspiracy Watch",
    body: "Collaborateur de l'Observatoire du conspirationnisme, qui documente et analyse les théories du complot depuis 2007.",
    href: "https://www.conspiracywatch.info",
    cta: "Explorer"
  }, {
    img: "./france-medias-monde.jpg",
    kicker: "Gouvernance",
    title: "CHIPIP — France Médias Monde",
    body: "Membre du Comité d'indépendance et d'intégrité du groupe audiovisuel public à destination internationale.",
    href: "https://www.francemediasmonde.com/fr/nos-engagements/deontologie/",
    cta: "En savoir plus"
  }, {
    img: "./infographie.jpg",
    kicker: "Livre · Éditions CNRS",
    title: "Internet, une infographie",
    body: "Un ouvrage grand public qui décrypte, visuellement, l'impact du numérique sur nos sociétés — réseaux, plateformes, nouveaux pouvoirs.",
    href: "https://www.cnrseditions.fr/catalogue/societe/internet/",
    cta: "Voir le livre"
  }, {
    img: "./faussaires.jpg",
    kicker: "Livre collectif · Philippe Rey",
    title: "Les Faussaires de la nation",
    body: "Comment l'extrême droite défigure l'histoire, et comment lui résister : cinquante historiens réunis sous la direction de Vincent Duclert et Maria Malagardis. Parution le 1er octobre.",
    href: "https://rdv-histoire.com/programme/les-faussaires-de-la-nation-comment-lextreme-droite-defigure-lhistoire",
    cta: "Découvrir"
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "institutionnel",
    className: "px-6 md:px-12 lg:px-24 py-16 md:py-28"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-3xl mb-14"
  }, /*#__PURE__*/React.createElement(FadeIn, null, /*#__PURE__*/React.createElement("div", {
    className: "inline-flex items-center gap-2.5 liquid-glass rounded-full pl-4 pr-5 py-3 whitespace-nowrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-[11px] uppercase tracking-[0.2em] text-white/60"
  }, "[\u200902\u2009]"), /*#__PURE__*/React.createElement("span", {
    className: "text-white font-body text-base md:text-lg tracking-tight"
  }, "Recherche, livres & institutionnel")))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl"
  }, items.map((it, i) => /*#__PURE__*/React.createElement(Parallax, {
    key: it.title,
    speed: 0,
    className: "h-full"
  }, /*#__PURE__*/React.createElement(FadeIn, {
    delay: i * 0.1,
    className: "h-full"
  }, /*#__PURE__*/React.createElement(MediaCard, _extends({}, it, {
    compact: true
  })))))));
}

// ---------- Conferencier (replaces Stats) ----------
function Conferencier() {
  const ref = useHls("./conf.mp4");
  return /*#__PURE__*/React.createElement("section", {
    id: "conferences",
    className: "relative overflow-hidden py-14 md:py-24"
  }, /*#__PURE__*/React.createElement(ParallaxLayer, {
    speed: 0.1,
    scale: 1.2,
    mobileFactor: 0.6,
    className: "absolute inset-0 z-0 overflow-hidden"
  }, /*#__PURE__*/React.createElement("video", {
    ref: ref,
    autoPlay: true,
    loop: true,
    muted: true,
    playsInline: true,
    preload: "auto",
    className: "absolute inset-0 w-full h-full object-cover desat edge-fade-both"
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 bg-black/50 edge-fade-both"
  })), /*#__PURE__*/React.createElement("div", {
    className: "relative z-10 px-6 md:px-12 lg:px-24"
  }, /*#__PURE__*/React.createElement(FadeIn, null, /*#__PURE__*/React.createElement("div", {
    className: "liquid-glass rounded-3xl p-10 md:p-16 overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-2xl"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inline-block liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white font-body"
  }, "Conf\xE9rencier"), /*#__PURE__*/React.createElement("h2", {
    className: "mt-6 text-5xl md:text-6xl lg:text-7xl font-heading italic text-white leading-[0.85] tracking-tight"
  }, "Inviter quelqu'un qui comprend ", /*#__PURE__*/React.createElement("em", {
    className: "not-italic text-white/70"
  }, "vraiment"), " ce qui se joue en ligne."), /*#__PURE__*/React.createElement("p", {
    className: "mt-7 text-white/75 font-body font-light text-base md:text-lg leading-relaxed max-w-xl"
  }, "Conf\xE9rences, keynotes, tables rondes, masterclass : j'interviens aupr\xE8s des entreprises, des universit\xE9s, des administrations et des m\xE9dias sur les radicalit\xE9s en ligne, la d\xE9sinformation, les IA g\xE9n\xE9ratives, les mutations d\xE9mocratiques du num\xE9rique et, plus largement, les cultures num\xE9riques."), /*#__PURE__*/React.createElement("div", {
    className: "mt-8 flex flex-wrap gap-4"
  }, /*#__PURE__*/React.createElement(MailLink, {
    subject: "Demande de conf\xE9rence",
    className: "liquid-glass-strong rounded-full px-6 py-3 text-sm font-medium text-white flex items-center gap-2 font-body whitespace-nowrap"
  }, "R\xE9server une intervention ", /*#__PURE__*/React.createElement(ArrowUpRight, {
    size: 14,
    strokeWidth: 2
  })), /*#__PURE__*/React.createElement("a", {
    href: "#contact",
    className: "bg-white text-black rounded-full px-6 py-3 text-sm font-medium font-body hover:bg-white/90 transition-colors whitespace-nowrap"
  }, "Demander un devis"))), /*#__PURE__*/React.createElement("div", {
    className: "hidden md:grid grid-cols-2 gap-4 lg:w-80 shrink-0"
  }, [["Entreprises", "Keynotes & comex"], ["Universités", "Cours & séminaires"], ["Médias", "Interventions & plateaux"], ["Administrations", "Formations & conférences"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    className: "liquid-glass-strong rounded-2xl p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-heading italic text-xl text-white leading-tight"
  }, k), /*#__PURE__*/React.createElement("div", {
    className: "mt-1 text-white/60 text-xs font-body font-light"
  }, v)))))))));
}

// ---------- Productions ----------
// ---------- TMF Lab : tuile pleine largeur ----------
// Charte du labo : fond #07080a, accent orange #ff5b2e (--feu), texte #e9eaee.
const LAB_URL = "https://tmflab.tech/";
const LAB_ACCENT = "#ff5b2e";
function LabTile({
  video,
  logo
}) {
  const ref = useHls(video || "");
  return /*#__PURE__*/React.createElement(FadeIn, {
    className: "mb-10"
  }, /*#__PURE__*/React.createElement("a", {
    href: LAB_URL,
    target: "_blank",
    rel: "noopener",
    className: "group relative block rounded-3xl overflow-hidden",
    style: {
      background: '#07080a',
      boxShadow: '0 0 0 1px rgba(255,91,46,0.35), 0 40px 90px -40px rgba(255,91,46,0.45)'
    }
  }, video && /*#__PURE__*/React.createElement("video", {
    ref: ref,
    autoPlay: true,
    loop: true,
    muted: true,
    playsInline: true,
    preload: "auto",
    className: "absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 pointer-events-none",
    style: {
      background: 'linear-gradient(90deg, rgba(7,8,10,0.94) 0%, rgba(7,8,10,0.72) 42%, rgba(7,8,10,0.12) 100%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "relative z-10 flex flex-col justify-center p-8 md:p-14 min-h-[380px] max-w-2xl"
  }, logo ? /*#__PURE__*/React.createElement(mot.img, {
    src: logo,
    alt: "tmflab.tech",
    initial: {
      opacity: 0,
      y: 8,
      filter: 'blur(8px)'
    },
    whileInView: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)'
    },
    viewport: {
      once: true,
      amount: 0.4
    },
    transition: {
      duration: 0.9,
      delay: 0.2,
      ease: [0.2, 0.7, 0.2, 1]
    },
    className: "w-56 md:w-72 h-auto"
  }) : /*#__PURE__*/React.createElement("div", {
    className: "font-mono text-xs uppercase tracking-[0.2em]",
    style: {
      color: LAB_ACCENT
    }
  }, "tmflab.tech"), /*#__PURE__*/React.createElement("h3", {
    className: "mt-7 font-heading italic text-4xl md:text-6xl leading-[0.95] tracking-tight text-white"
  }, "Je ne code pas.", /*#__PURE__*/React.createElement("br", null), "J'exp\xE9rimente."), /*#__PURE__*/React.createElement("p", {
    className: "mt-5 text-white/75 font-body font-light text-base md:text-lg leading-relaxed"
  }, "Toutes mes exp\xE9rimentations et explorations num\xE9riques, r\xE9unies dans mon laboratoire."), /*#__PURE__*/React.createElement("div", {
    className: "mt-8 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium font-body text-black transition-transform duration-300 group-hover:translate-x-0.5",
    style: {
      background: LAB_ACCENT
    }
  }, "Entrer dans le labo ", /*#__PURE__*/React.createElement(ArrowUpRight, {
    size: 14,
    strokeWidth: 2
  })))));
}
function Testimonials() {
  const items = [{
    href: "./carte-complotisme/",
    img: "./comploscore.jpg",
    badge: "Data viz",
    kicker: "Cartographie interactive",
    title: "ComploScore",
    body: "Un nutri-score du complotisme : carte interactive pour visualiser et comparer les niveaux de conspirationnisme par pays.",
    cta: "Explorer la carte"
  }, {
    href: "./TECHNOFASCISME-Infographie-interactive/",
    img: "./technofascisme-preview.svg",
    badge: "Infographie",
    kicker: "Exploration interactive",
    title: "Technofascisme",
    body: "Une exploration visuelle des figures, idéologies et réseaux qui structurent le technofascisme contemporain.",
    cta: "Explorer"
  }, {
    href: "https://www.egoblog.net/happyworld/",
    img: "./happyworld.jpg",
    badge: "Documentaire",
    kicker: "Birmanie · 2011",
    title: "Happy World",
    body: "Tourné clandestinement en Birmanie sous couverture touristique avec Gaël Bordier, ce documentaire satirique raconte la dictature par l'absurde — prix Orson Welles 2010. Son dispositif hypervidéo, éteint depuis, a été ressuscité par une migration menée avec l'IA.",
    cta: "Voir le film"
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "productions",
    className: "px-6 md:px-12 lg:px-24 py-16 md:py-28"
  }, /*#__PURE__*/React.createElement(LabTile, {
    video: "./tmflab.mp4",
    logo: "./tmflab-logo.svg"
  }), /*#__PURE__*/React.createElement(FadeIn, {
    delay: 0.2
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40"
  }, /*#__PURE__*/React.createElement("span", null, "Voir aussi"), items.map(t => /*#__PURE__*/React.createElement(React.Fragment, {
    key: t.title
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    className: "text-white/25"
  }, "\xB7"), /*#__PURE__*/React.createElement("a", {
    href: t.href,
    target: t.href.startsWith('http') ? '_blank' : undefined,
    rel: "noopener",
    className: "text-white/60 hover:text-white transition-colors"
  }, t.title))))));
}

// ---------- Crossfade video loop (seamless dissolve) ----------
function CrossfadeVideo({
  src,
  className,
  crossfade = 1.2
}) {
  const refA = useRef(null);
  const refB = useRef(null);
  useEffect(() => {
    const a = refA.current;
    const b = refB.current;
    if (!a || !b) return;
    [a, b].forEach(v => {
      v.muted = true;
      v.playsInline = true;
      v.loop = true;
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
    });
    a.style.opacity = '1';
    b.style.opacity = '0';
    const syncAndPlay = () => {
      if (!a.duration || isNaN(a.duration)) return;
      b.currentTime = (a.currentTime + a.duration / 2) % a.duration;
      a.play().catch(() => {});
      b.play().catch(() => {});
    };
    a.addEventListener('loadedmetadata', syncAndPlay);
    a.addEventListener('loadeddata', syncAndPlay);
    a.addEventListener('canplay', syncAndPlay);
    let raf;
    const tick = () => {
      const D = a.duration;
      if (D && !isNaN(D)) {
        const cf = Math.min(crossfade, D / 2.5);
        const op = t => {
          if (t < cf) return t / cf;
          if (t > D - cf) return Math.max(0, (D - t) / cf);
          return 1;
        };
        a.style.opacity = String(op(a.currentTime));
        b.style.opacity = String(op(b.currentTime));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      a.removeEventListener('loadedmetadata', syncAndPlay);
      a.removeEventListener('loadeddata', syncAndPlay);
      a.removeEventListener('canplay', syncAndPlay);
      cancelAnimationFrame(raf);
    };
  }, [src, crossfade]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("video", {
    ref: refA,
    src: src,
    autoPlay: true,
    loop: true,
    muted: true,
    playsInline: true,
    preload: "auto",
    className: className,
    style: {
      opacity: 1
    }
  }), /*#__PURE__*/React.createElement("video", {
    ref: refB,
    src: src,
    autoPlay: true,
    loop: true,
    muted: true,
    playsInline: true,
    preload: "auto",
    className: className,
    style: {
      opacity: 0
    }
  }));
}

// ---------- CTA + Footer ----------
function CtaFooter() {
  return /*#__PURE__*/React.createElement("section", {
    id: "contact",
    className: "relative overflow-hidden"
  }, /*#__PURE__*/React.createElement(ParallaxLayer, {
    speed: 0.1,
    scale: 1.2,
    mobileFactor: 0.6,
    className: "absolute inset-0 z-0 overflow-hidden"
  }, /*#__PURE__*/React.createElement(CrossfadeVideo, {
    src: "./bottom.mp4",
    className: "absolute inset-0 w-full h-full object-cover edge-fade-top",
    crossfade: 1.2
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 bg-black/35 edge-fade-top"
  })), /*#__PURE__*/React.createElement("div", {
    className: "relative z-10 px-6 md:px-12 lg:px-24 pt-32 pb-10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col items-center text-center max-w-3xl mx-auto"
  }, /*#__PURE__*/React.createElement(BlurText, {
    text: "Parlons-en.",
    as: "h2",
    splitBy: "word",
    className: "text-5xl md:text-6xl lg:text-7xl font-heading italic text-white leading-[1.05] pb-4"
  }), /*#__PURE__*/React.createElement(FadeIn, {
    delay: 0.4
  }, /*#__PURE__*/React.createElement("p", {
    className: "mt-10 text-white font-body font-light text-base md:text-lg max-w-lg md:max-w-2xl leading-relaxed",
    style: {
      textShadow: '0 2px 20px rgba(0,0,0,0.85)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "md:whitespace-nowrap"
  }, "Conf\xE9rences, interviews, consultations, collaborations \xE9ditoriales\xA0: \xE9crivez-moi."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), "Je r\xE9ponds personnellement \xE0 chaque message.")), /*#__PURE__*/React.createElement(FadeIn, {
    delay: 0.6
  }, /*#__PURE__*/React.createElement("div", {
    className: "mt-10 flex justify-center"
  }, /*#__PURE__*/React.createElement(MailLink, {
    className: "liquid-glass-strong rounded-full px-10 py-5 text-lg md:text-xl font-medium text-white font-body hover:bg-white/15 transition-colors whitespace-nowrap shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)]"
  }, "\xC9crivez-moi")))), /*#__PURE__*/React.createElement("div", {
    className: "mt-20 flex justify-center"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#top",
    onClick: e => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    className: "group flex flex-col items-center gap-2 text-white/50 hover:text-white/90 transition-colors",
    "aria-label": "Retour en haut"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] font-body uppercase tracking-[0.22em]"
  }, "Retour en haut"), /*#__PURE__*/React.createElement(mot.span, {
    animate: {
      y: [0, -6, 0]
    },
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: 'easeInOut'
    },
    className: "liquid-glass h-10 w-10 rounded-full flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(ArrowUp, {
    size: 16,
    strokeWidth: 2
  })))), /*#__PURE__*/React.createElement("div", {
    className: "mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-white/40 text-xs font-body"
  }, "\xA9 2026 Tristan Mend\xE8s France \u2014 vib\xE9cod\xE9 avec d\xE9contraction."), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-6"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#projets",
    className: "text-white/40 text-xs font-body hover:text-white/70"
  }, "Projets"), /*#__PURE__*/React.createElement("a", {
    href: "#apropos",
    className: "text-white/40 text-xs font-body hover:text-white/70"
  }, "\xC0 propos"), /*#__PURE__*/React.createElement(MailLink, {
    className: "text-white/40 text-xs font-body hover:text-white/70"
  }, "Contact")))));
}

// ---------- App ----------
function App() {
  return /*#__PURE__*/React.createElement("div", {
    className: "bg-black min-h-screen relative"
  }, /*#__PURE__*/React.createElement("div", {
    className: "aurora-blob blob-1",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "aurora-blob blob-2",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement(ScrollProgress, null), /*#__PURE__*/React.createElement(Navbar, null), /*#__PURE__*/React.createElement(Hero, null), /*#__PURE__*/React.createElement("div", {
    className: "bg-black"
  }, /*#__PURE__*/React.createElement(StartSection, null), /*#__PURE__*/React.createElement(FeaturesChess, null), /*#__PURE__*/React.createElement(FeaturesGrid, null), /*#__PURE__*/React.createElement(Testimonials, null), /*#__PURE__*/React.createElement(Conferencier, null), /*#__PURE__*/React.createElement(CtaFooter, null)));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
