// Episodes data — Complorama (France Info)
// Replace mock data with real episodes via the Radio France RSS feed.
// Fields:
//   n:       episode number
//   title:   episode title
//   img:     cover image path (optional — generated visual used as fallback)
//   date:    short date label (French format)
//   url:     link to the Radio France audio podcast page
//   youtube: link to the YouTube video version (last ~36 episodes only)
const EP_URL = "https://www.radiofrance.fr/franceinfo/podcasts/complorama";
const YT_URL = "https://www.youtube.com/playlist?list=PLg6GanYvTasWMem6U2VUxc9sQ6a7T7sIe";

// First episode that has a YouTube video version.
// Episodes with n >= FIRST_VIDEO_EP get a `youtube` link.
const FIRST_VIDEO_EP = 107; // 142 - 35 = 107 → last 36 episodes have video

window.EPISODES = [
  { n: 142, title: "L'algorithme et la rumeur",         img: "assets/ep-1.webp", date: "28 avr. 2026", url: EP_URL, youtube: YT_URL },
  { n: 141, title: "Quand les faits ne suffisent plus",  img: "assets/ep-2.webp", date: "21 avr. 2026", url: EP_URL, youtube: YT_URL },
  { n: 140, title: "La fabrique du soupçon",             img: "assets/ep-3.webp", date: "14 avr. 2026", url: EP_URL, youtube: YT_URL },
  { n: 139, title: "Réseaux, échos, chambres closes",    date: "07 avr. 2026", url: EP_URL, youtube: YT_URL },
  { n: 138, title: "Le retour des platistes",            date: "31 mars 2026", url: EP_URL, youtube: YT_URL },
  { n: 137, title: "Décoder une vidéo virale",           date: "24 mars 2026", url: EP_URL, youtube: YT_URL },
  { n: 136, title: "Pseudosciences et plateaux télé",    date: "17 mars 2026", url: EP_URL, youtube: YT_URL },
  { n: 135, title: "L'ombre du grand remplacement numérique", date: "10 mars 2026", url: EP_URL, youtube: YT_URL },
  { n: 134, title: "Vaccins : anatomie d'une défiance",  date: "03 mars 2026", url: EP_URL, youtube: YT_URL },
  { n: 133, title: "Le complot dans la pop culture",     date: "24 fév. 2026", url: EP_URL, youtube: YT_URL },
  { n: 132, title: "Influenceurs et désinformation médicale", date: "17 fév. 2026", url: EP_URL, youtube: YT_URL },
  { n: 131, title: "Climat : le doute organisé",         date: "10 fév. 2026", url: EP_URL, youtube: YT_URL },
  { n: 130, title: "Élections, IA et faux signaux",      date: "03 fév. 2026", url: EP_URL, youtube: YT_URL },
  { n: 129, title: "Survivalistes et fin du monde",      date: "27 jan. 2026", url: EP_URL, youtube: YT_URL },
  { n: 128, title: "Les nouveaux gourous du bien-être",  date: "20 jan. 2026", url: EP_URL, youtube: YT_URL },
  { n: 127, title: "Quand TikTok réécrit l'Histoire",   date: "13 jan. 2026", url: EP_URL, youtube: YT_URL },
  { n: 126, title: "Médias alternatifs ou désinformation pure ?", date: "06 jan. 2026", url: EP_URL, youtube: YT_URL },
  { n: 125, title: "Le mythe de l'élite cachée",         date: "16 déc. 2025", url: EP_URL, youtube: YT_URL },
  { n: 124, title: "Sectes 2.0 et communautés en ligne", date: "09 déc. 2025", url: EP_URL, youtube: YT_URL },
  { n: 123, title: "Deepfakes et confiance en l'image",  date: "02 déc. 2025", url: EP_URL, youtube: YT_URL },
  { n: 122, title: "La théorie du grand reset",          date: "25 nov. 2025", url: EP_URL, youtube: YT_URL },
  { n: 121, title: "Antivax, l'histoire longue",         date: "18 nov. 2025", url: EP_URL, youtube: YT_URL },
  { n: 120, title: "Lune, espace et faux drapeaux",      date: "11 nov. 2025", url: EP_URL, youtube: YT_URL },
  { n: 119, title: "Quand la science devient suspecte",  date: "04 nov. 2025", url: EP_URL, youtube: YT_URL },
];

// Generate older episodes for the infinite scroll demo.
// In production this would be a paged API call or RSS feed.
const PAST_TOPICS = [
  "Les ovnis reviennent à la mode", "Vérités alternatives", "Quand un meme devient idéologie",
  "Le grand jeu des fact-checkers", "Numérologie et superstitions", "L'extrême droite en ligne",
  "Anti-5G, anti-tout", "La rumeur, ce vieux média", "Faux médecins, vrais dégâts",
  "Sociétés secrètes : mythe et réalité", "Le nouvel ordre mondial, encore", "Telegram, refuge des extrêmes",
  "Désinformation russe en Europe", "Quand l'IA hallucine", "Les figures du complotisme français",
  "Crise sanitaire, crise du sens", "Le marketing de la peur", "Manipulation par l'image fixe",
  "Les vidéos détournées", "Faux experts à la télévision", "Plats, ronds, creux : la Terre",
  "Les nouveaux médias d'opinion", "Du QAnon à l'Élysée", "Vaccins : retour aux faits",
  "Médecines parallèles à l'épreuve", "Coronavirus, archives d'une infox", "Géopolitique et conspirations",
  "Le storytelling complotiste", "Influence russe, version 2025", "Streamers et désinformation",
  "Élites mondiales : fantasme et faits", "Bilderberg, Davos, mythes",
];
for (let i = 0; i < PAST_TOPICS.length; i++) {
  const n = 118 - i;
  if (n < 1) break;
  const month = ((10 - Math.floor(i / 4) + 12) % 12) + 1;
  const year = 2025 - Math.floor((i + 2) / 12);
  const day = 28 - (i % 4) * 7;
  const monthFr = ["jan.", "fév.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."][month - 1];
  const ep = {
    n,
    title: PAST_TOPICS[i],
    date: `${String(day).padStart(2, '0')} ${monthFr} ${year}`,
    url: EP_URL,
  };
  if (n >= FIRST_VIDEO_EP) ep.youtube = YT_URL;
  window.EPISODES.push(ep);
}
