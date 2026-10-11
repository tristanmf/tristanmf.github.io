/* Revue de presse — logique de la page.
   Les données (1 808 articles + audiovisuel) vivent dans data.json, chargé au
   démarrage : la page elle-même reste légère. sources.json associe un nom de
   média à son domaine, ce qui permet d'afficher sa favicon — copiée dans
   favicons/ par scripts/fetch-press-favicons.mjs, jamais chargée depuis un
   domaine tiers. Toute favicon manquante laisse voir la pastille à initiales. */

const CATS = ["Presse nationale","Magazines","Presse régionale","Radio & télé (sites)","Agences & lettres pro","Web & pure players","Presse étrangère"];
const COL  = {"Complément Google Actualités":"--gk","Presse nationale":"--c1","Magazines":"--c4","Presse régionale":"--c2","Radio & télé (sites)":"--c3","Agences & lettres pro":"--c6","Web & pure players":"--c7","Presse étrangère":"--c5"};
const GK   = "Complément Google Actualités";

const fmt = n => n.toLocaleString("fr-FR");
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const ini = s => {
  const w = s.replace(/^(Le|La|Les|L'|L’)\s*/i, "").replace(/[^\p{L}\p{N} ]/gu, " ").trim().split(/\s+/).filter(Boolean);
  return ((w[0] || "?")[0] + (w[1] ? w[1][0] : (w[0] || "")[1] || "")).toUpperCase();
};

// Pastille colorée aux initiales, surmontée de la favicon du média quand on la
// connaît. `onerror` retire l'image si le fichier manque : la pastille reprend
// sa place, donc jamais de carré vide.
let DOMAINS = {};
const icon = domain => domain
  ? `<img src="favicons/${esc(domain)}.png" alt="" loading="lazy" decoding="async" onerror="this.remove()">`
  : "";
const badge = p => `<span class="bdg" style="background:var(${COL[p.c]})" aria-hidden="true">${esc(ini(p.s))}${icon(DOMAINS[p.s])}</span>`;

// Domaine d'un lien audiovisuel, pour lui donner aussi sa favicon.
const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };

function init(data) {
  const P = data.articles, AV = data.av;

  const years = [...new Set(P.map(p => p.d.slice(0, 4)))].sort();
  const byY = {};
  P.forEach(p => { const y = p.d.slice(0, 4); const k = p.o === "Europresse" ? p.c : GK; byY[y] = byY[y] || {}; byY[y][k] = (byY[y][k] || 0) + 1; });
  const tot = y => Object.values(byY[y] || {}).reduce((a, b) => a + b, 0);
  const sources = new Set(P.map(p => p.s));
  const avg = Math.round(["2020","2021","2022","2023","2024","2025"].reduce((a, y) => a + tot(y), 0) / 6);

  // Chiffres d'en-tête
  const nE = P.filter(p => p.o === "Europresse").length, nG = P.length - nE;
  const st = [
    [fmt(P.length), `articles recensés depuis 1997 (${fmt(nE)} Europresse, ${fmt(nG)} Google Actualités)`],
    [fmt(sources.size), "titres de presse et sites différents"],
    ["≈ " + avg, "articles par an en moyenne, de 2020 à 2025"],
    [fmt(P.filter(p => p.c === "Presse nationale").length), "articles dans la presse nationale"],
    [AV.n ? fmt(AV.n) : "—", "passages radio, télé et podcast documentés"],
  ];
  document.getElementById("stats").innerHTML = st.map(([b, s]) => `<div class="stat"><b>${b}</b><small>${s}</small></div>`).join("");

  // Mur défilant
  (function () {
    const picks = P.filter(p => p.c !== "Agences & lettres pro" && p.t.length > 12).slice(0, 240);
    const lanes = [[], [], []];
    picks.forEach((p, i) => lanes[i % 3].push(p));
    const chip = p => `<div class="chip"><span class="srcrow">${badge(p)}<span class="src">${esc(p.s)}</span></span><span class="tt">${esc(p.t)}</span><span class="dt">${p.d.split("-").reverse().join("/")}</span></div>`;
    document.getElementById("wall").innerHTML = lanes.map((l, i) => `<div class="lane" style="--dur:${150 + i * 30}s">${l.map(chip).join("")}${l.map(chip).join("")}</div>`).join("");
  })();

  // Graphique par année
  function drawChart() {
    const ys = years.filter(y => +y >= 2005);
    const W = Math.max(640, ys.length * 30), H = 300, pl = 36, pb = 26, pt = 10;
    const max = Math.max(...ys.map(tot));
    const step = max > 200 ? 50 : 25;
    const top = Math.ceil(max / step) * step;
    const bw = (W - pl - 10) / ys.length;
    const sy = v => H - pb - (v / top) * (H - pb - pt);
    let g = "";
    for (let v = 0; v <= top; v += step) {
      g += `<line x1="${pl}" x2="${W - 6}" y1="${sy(v)}" y2="${sy(v)}" stroke="${css('--rule')}"/><text x="${pl - 6}" y="${sy(v) + 4}" text-anchor="end" font-size="11" fill="${css('--muted')}" font-family="IBM Plex Mono, monospace">${v}</text>`;
    }
    ys.forEach((y, i) => {
      let acc = 0;
      const x = pl + i * bw + bw * 0.15, w = bw * 0.7;
      CATS.concat([GK]).forEach(c => {
        const v = (byY[y] || {})[c] || 0; if (!v) return;
        const y1 = sy(acc + v), y0 = sy(acc);
        g += `<rect x="${x}" y="${y1}" width="${w}" height="${Math.max(0, y0 - y1)}" fill="${css(COL[c])}"><title>${y} · ${c} : ${v}</title></rect>`;
        acc += v;
      });
      g += `<text x="${x + w / 2}" y="${H - 8}" text-anchor="middle" font-size="10.5" fill="${css('--muted')}" font-family="IBM Plex Mono, monospace">${(+y % 5 === 0 || +y >= 2016) ? "’" + y.slice(2) : ""}</text>`;
      if (+y >= 2019) g += `<text x="${x + w / 2}" y="${sy(acc) - 4}" text-anchor="middle" font-size="10.5" fill="${css('--ink')}" font-family="IBM Plex Mono, monospace">${acc}</text>`;
    });
    document.getElementById("chart").innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="min-width:560px" role="img" aria-label="Articles par année">${g}</svg>`;
    document.getElementById("legend").innerHTML = CATS.concat([GK]).map(c => `<span><i style="background:var(${COL[c]})"></i>${c}</span>`).join("");
    const pre = years.filter(y => +y < 2005).reduce((a, y) => a + tot(y), 0);
    document.getElementById("chartnote").textContent = `Avant 2005 : ${pre} articles (1997-2004). Les barres grises ajoutent les articles trouvés seulement par Google Actualités (2014-2026). 2026 s'arrête au 10 octobre.`;
  }
  drawChart();
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", drawChart);
  new MutationObserver(drawChart).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  // Familles de médias
  (function () {
    const c = {}; P.forEach(p => c[p.c] = (c[p.c] || 0) + 1);
    const m = Math.max(...Object.values(c));
    document.getElementById("cats").innerHTML = CATS.map(k =>
      `<div class="hbar"><span>${k}</span><span class="track"><span class="fill" style="display:block;width:${(c[k] || 0) / m * 100}%;background:var(${COL[k]})"></span></span><span class="n">${fmt(c[k] || 0)}</span></div>`
    ).join("") + `<p class="note">${Math.round((c["Presse nationale"] + c["Magazines"]) / P.length * 100)} % des articles paraissent dans la presse nationale ou les magazines.</p>`;
  })();

  // Médias les plus citants
  (function () {
    const c = {}, k = {};
    P.forEach(p => { c[p.s] = (c[p.s] || 0) + 1; k[p.s] = p; });
    document.getElementById("tops").innerHTML = Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 30)
      .map(([s, n]) => `<li><span class="srcrow">${badge(k[s])}<span>${esc(s)}</span></span><span>${n}</span></li>`).join("");
  })();

  // À quel titre
  (function () {
    const c = {}; let none = 0;
    P.forEach(p => { if (!p.q.length) none++; p.q.forEach(q => c[q] = (c[q] || 0) + 1); });
    const e = Object.entries(c).sort((a, b) => b[1] - a[1]);
    const m = e[0][1];
    document.getElementById("quals").innerHTML = e.map(([k, n]) =>
      `<div class="hbar"><span>${k}</span><span class="track"><span class="fill" style="display:block;width:${n / m * 100}%;background:var(--accent)"></span></span><span class="n">${n}</span></div>`
    ).join("");
    document.getElementById("noq").textContent = fmt(none);
  })();

  // Audiovisuel
  document.getElementById("avlede").textContent = AV.lede;
  document.getElementById("avgrid").innerHTML = AV.items.map(a => {
    const h = hostOf(a.u);
    const ic = h ? `<span class="bdg" style="background:var(--c3)" aria-hidden="true">${esc(ini(a.m))}${icon(h)}</span>` : "";
    return `<div class="card"><span class="k">${esc(a.k)}</span><span class="m">${ic}${esc(a.m)}</span><span class="e">${esc(a.e)}</span>${a.u ? `<a class="e" href="${esc(a.u)}" target="_blank" rel="noopener">Source</a>` : ""}</div>`;
  }).join("");

  // Index filtrable
  const fy = document.getElementById("fy"), fc = document.getElementById("fc"), q = document.getElementById("q");
  fy.innerHTML = `<option value="">Toutes les années</option>` + years.slice().reverse().map(y => `<option>${y}</option>`).join("");
  fc.innerHTML = `<option value="">Tous les médias</option>` + CATS.map(c => `<option>${c}</option>`).join("");
  function render() {
    const t = q.value.trim().toLowerCase(), y = fy.value, c = fc.value;
    const r = P.filter(p => (!y || p.d.startsWith(y)) && (!c || p.c === c) && (!t || (p.t + " " + p.s).toLowerCase().includes(t)));
    document.getElementById("cnt").textContent = fmt(r.length) + " références";
    document.getElementById("list").innerHTML = r.slice(0, 600).map(p =>
      `<div class="row"><span class="d">${p.d.split("-").reverse().join("/")}</span><span class="s">${badge(p)}<span>${esc(p.s)}</span>${p.o !== "Europresse" ? '<span class="pill">Google</span>' : ""}</span><span>${p.u ? `<a href="${esc(p.u)}" target="_blank" rel="noopener">${esc(p.t)}</a>` : esc(p.t)}</span></div>`
    ).join("") + (r.length > 600 ? `<div class="row"><span></span><span></span><span class="d">… affinez la recherche pour voir les ${fmt(r.length - 600)} autres.</span></div>` : "");
  }
  [q, fy, fc].forEach(e => e.addEventListener("input", render));
  render();
}

// sources.json est accessoire : sans lui, la page s'affiche avec les initiales.
Promise.all([
  fetch("data.json").then(r => { if (!r.ok) throw new Error(`data.json : HTTP ${r.status}`); return r.json(); }),
  fetch("sources.json").then(r => r.ok ? r.json() : {}).catch(() => ({})),
]).then(([data, domains]) => {
  DOMAINS = domains;
  init(data);
}).catch(err => {
  document.getElementById("stats").innerHTML =
    `<p class="loading">Les données n'ont pas pu être chargées (${esc(err.message)}).</p>`;
  console.error(err);
});
