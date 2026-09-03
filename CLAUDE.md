# tristanmf.github.io — notes pour Claude

Site GitHub Pages de Tristan Mendès France, servi sur **tristan.pro** (fichier `CNAME`).
Propriétaire non technicien, échanges en français, zéro travail manuel attendu de sa part :
automatiser, vérifier soi-même, livrer, expliquer en clair.

- Racine : portfolio (`index.html` + `app.jsx`, Tailwind).
- `/complorama/` : « Mur des épisodes » du podcast Complorama (franceinfo), entièrement automatisé.
- Ce fichier est public : n'importe quelle session Claude (web, Mac, Cowork) peut le lire à
  `https://raw.githubusercontent.com/tristanmf/tristanmf.github.io/main/CLAUDE.md`.

## Règles du site

- **Tout auto-hébergé, zéro tracker.** Aucun CDN, aucune Google Font, aucun domaine tiers au
  chargement d'une page. Polices dans `assets/fonts/`, bibliothèques dans `vendor/`
  (`scripts/vendor-assets.mjs` les rafraîchit). Ne jamais réintroduire une ressource externe.
- **Fichiers générés, ne pas éditer à la main** : `app.js`, `complorama/*.js`, `assets/tailwind.css`.
  Sources : `app.jsx`, `complorama/episodes-wall.jsx`, `complorama/episode-visual.jsx`,
  `tailwind.css` + `tailwind.config.js`. Le workflow **Build front-end** recompile et commite à
  chaque push d'une source sur `main` (`scripts/build-jsx.mjs`, Tailwind CLI).
- Jekyll est actif (pas de `.nojekyll`) : dossiers `_xxx` et fichiers `.xxx` ne sont pas publiés.
- Mobile d'abord : vérifier les rendus étroits (débordements de texte, contrastes, boutons
  accessibles sans survol).

## Flux de travail

- Développer sur une branche `claude/...`, ouvrir une PR vers `main`, la fusionner soi-même
  (Tristan ne relit pas le code). `main` = production.
- Le bac à sable Claude web ne joint pas l'extérieur (radiofrance.fr, OVH, GitHub Pages, unpkg…) :
  tout ce qui touche le réseau passe par un workflow GitHub Actions (`workflow_dispatch`, ref `main`)
  dont on lit ensuite les journaux. Les workflows ne se déclenchent que s'ils existent sur `main`.
- Dans l'outil Bash, `set -e` n'est pas honoré : chaîner avec `&&` et vérifier les sorties.
- Le dépôt est **public** : les journaux Actions le sont aussi. Jamais de donnée personnelle,
  de mot de passe ou de jeton dans un journal.

## Complorama (automatisé)

- Données : `complorama/episodes-data.js`, `RAW_EPISODES`, une ligne par épisode
  (`title, url, img, youtube, date, description, body`). Dédoublonnage par titre, numérotation
  ancrée sur « PODCAST. La 100e de Complorama ».
- Saisons septembre → août, S1 = janvier 2021 ; constantes `SEASON` / `SEASON_START` en tête de
  `episodes-wall.jsx` à mettre à jour à chaque rentrée. Liens d'abonnement : `SUBSCRIBE_LINKS`.
- Workflow **Sync new episodes**, deux fois par jour (08:00 et 18:00 UTC), idempotent :
  RSS Radio France + playlist YouTube → nouveaux épisodes, liens vidéo, descriptions, dates,
  corps d'article (pour la recherche), images miroir dans `complorama/assets/episodes/`.
  Pièges déjà gérés : alias d'URL Radio France, item promo de l'appli, visuel générique de
  l'émission (UUID `39bbb292-…`), formats d'image pikapi / cruiser, entités HTML nommées.
- **Sync episode images** (manuel) : re-miroir des images seules.

## OVH : accès complet depuis GitHub Actions (depuis septembre 2026)

Le compte OVH de Tristan (domaines, zones DNS, hébergement web, e-mail) se pilote **depuis
n'importe quelle session Claude, depuis n'importe où, sans passer par le manager OVH** :
un jeton API à validité illimitée est stocké dans les secrets du dépôt
(Settings → Secrets and variables → Actions) : `OVH_APP_KEY`, `OVH_APP_SECRET`,
`OVH_CONSUMER_KEY`, plus la variable optionnelle `OVH_ENDPOINT` (défaut `https://eu.api.ovh.com/1.0`).

- **Ne jamais demander ni coller ces valeurs dans une conversation.** Si le jeton doit être
  recréé : `https://eu.api.ovh.com/createToken/`, puis Tristan colle les trois valeurs dans les
  secrets GitHub lui-même.
- Outils, à lancer depuis l'onglet Actions ou par l'API GitHub (`actions_run_trigger`, ref `main`) :
  - **Tools · OVH API** (`tools-ovh-api.yml`) : un appel signé. Entrées `method`, `path`,
    `body` (JSON), `quiet`. Exemples : `GET /domain/zone` · `GET /domain/zone/<zone>/record` ·
    `POST /domain/zone/<zone>/record {"fieldType":"A","subDomain":"","target":"…","ttl":3600}` ·
    `POST /domain/zone/<zone>/refresh` — **obligatoire après toute modification d'enregistrement**.
  - **Tools · OVH zone report** (`tools-ovh-report.yml`) : lecture seule, tout d'une zone en un
    run : domaine, enregistrements, redirections, hébergement rattaché et état SSL.
  - **Tools · OVH API schema** (`tools-ovh-schema.yml`) : routes et paramètres d'une section de
    l'API (schéma public, sans secret) ; à consulter avant un appel inhabituel.
  - **Tools · HTTP probe** (`tools-http-probe.yml`) : comportement réel d'un nom de domaine
    vu de l'extérieur : réponses http/https, cible de redirection vue par un téléphone, matrice
    navigateurs/robots, certificats. Vérification systématique après un changement DNS/SSL.
  - Code : `scripts/ovh-api.mjs`, `scripts/ovh-zone-report.mjs`, `scripts/ovh-schema.mjs`,
    client partagé `scripts/lib/ovh.mjs` (`ovhClient()`, `redact()`) pour écrire de nouveaux scripts.
- Hygiène des journaux : `redact()` masque les champs personnels et les identifiants client OVH ;
  utiliser `quiet=true` pour `/me`, contacts, utilisateurs FTP, etc.
- **Jeton en place** (vérifié le 3 septembre 2026 via `GET /auth/currentCredential`) : créé le
  2 septembre 2026, statut `validated`, **sans date d'expiration**, sans restriction d'IP. Droits :
  GET / PUT / POST / DELETE sur `/domain/*`, `/hosting/web/*`, `/hosting/privateDatabase/*`,
  `/email/*`, `/me/api/*` ; GET seul sur `/me`, `/services/*`, `/vps/*`, `/dedicated/*`, `/ssl/*`.
  Pas de facturation (`/me/order`, `/me/bill`), pas de création de compte.
- Droits OVH : un joker `/x/*` couvre les sous-chemins mais **pas le chemin nu `/x`** :
  `GET /hosting/web`, `GET /domain`, `GET /email/domain` répondent 403. Contournements :
  `GET /domain/zone` (liste des zones), `GET /hosting/web/attachedDomain?domain=<zone>`
  (hébergement d'un domaine, utilisé par le rapport de zone).
- **Conduite** : lectures libres. Avant toute écriture (POST / PUT / DELETE), annoncer
  précisément ce qui va être fait et attendre l'accord de Tristan, sauf demande explicite de
  l'action dans le même échange. Vérifier ensuite avec HTTP probe ou zone report.
- Une session Claude Code sur le Mac de Tristan (« Zone egoblog avec APIs OVH/WordPress ») a aussi
  accès à OVH et au WordPress d'egoblog : ne pas supposer être seul à écrire.

### État connu au 2 septembre 2026

- Dix zones sur le compte : blogtrotters.fr, complorama.fr, egoblog.net, faismoila.biz,
  mendes-france.com, mendes-france.net, radiosofa.com, tmfab.fr, tmflab.tech, tristan.pro.
- Hébergement web `egoblog.net` (offre perso, cluster013, IP 213.186.33.24), multisite :
  egoblog.net, blogtrotters.fr, tmflab.tech, tmfab.fr, complorama.fr (avec et sans www).
- `complorama.fr` et `www.complorama.fr` → 301 vers `https://tristan.pro/complorama/`, servie par
  le dossier `www/complorama-redir` de cet hébergement, Let's Encrypt valide pour les deux noms.
  Une règle anti-robots renvoie 403 à curl/wget/agent vide : normal, sonder avec une identité de
  navigateur. Restes inertes en zone : TXT `1|https://tristan.pro/complorama/` (@) et `4|…` (www)
  de l'ancienne redirection OVH.
- `tristan.pro` → GitHub Pages (ce dépôt). Vérifié le 3 septembre : https OK (Let's Encrypt
  jusqu'au 5 novembre 2026, renouvelé par GitHub), http → https, www → apex en http. Le 2 septembre
  au soir Tristan a supprimé puis recréé le fichier `CNAME` (contenu inchangé) : sans effet.
  Question ouverte : faire de complorama.fr l'adresse principale du mur demanderait un second
  dépôt GitHub Pages, que seul Tristan peut créer.

## Autres outils Actions

- **Tools · Fetch asset** (`url`, `dest`) : miroir d'un fichier distant dans le dépôt.
- **Tools · Vendor assets** : re-télécharge polices et bibliothèques (`scripts/vendor-assets.mjs`).
- **Tools · SRI hashes** : historique, plus utilisé depuis l'auto-hébergement complet.

## Journal de bord — Complorama, OVH, outillage (état au 3 septembre 2026)

Tenir cette section à jour à la fin de chaque chantier (état, décisions, reste à faire).

### Fait (PR #11 → #46, toutes fusionnées sur `main`)

- **Mur Complorama** : 112 épisodes ; tuiles avec numéro, date, badge VIDÉO lisible sur image
  claire, boutons Écouter / Vidéo visibles sans survol sur mobile, tuiles 4:5 et titres tronqués
  proprement sur petit écran. Recherche multi-mots (ET) sur titre, description, corps d'article
  et date, avec classement par pertinence. Puces de saison filtrantes + barre de suivi qui suit le
  défilement. En-tête : kicker « PODCAST · FRANCEINFO », auteurs (Tristan en premier, lien
  tristan.pro), avatar auto-hébergé → page Radio France, boutons d'abonnement aux couleurs des
  plateformes (Apple, Spotify, Deezer, Amazon, Podcast Addict, YouTube, RSS).
- **Pipeline automatique** (deux fois par jour) : nouveaux épisodes, liens YouTube (dont vidéos
  bonus rattachées par titre), descriptions, dates, corps d'article, visuels miroirs, remplacement
  du visuel générique. Dédoublonnage par URL, titre normalisé et UUID d'image.
- **Auto-hébergement total** : JSX précompilé, Tailwind compilé, React / hls.js / framer-motion
  et polices dans le dépôt. Audit fait : aucun domaine tiers au chargement de tristan.pro ni de
  /complorama/ (la bannière « protection avancée » de Safari venait de l'avatar twimg).
- **OVH depuis GitHub Actions** : jeton en secrets, quatre workflows outils, rapport de zone,
  sonde HTTP, schéma d'API. Diagnostic complorama.fr fait : le renvoi 301 vers
  tristan.pro/complorama/ est servi par l'hébergement egoblog.net avec Let's Encrypt sur les deux
  noms ; l'alerte « connexion non sécurisée » sur mobile venait de l'ancien service de redirection
  OVH (sans HTTPS) et n'a plus lieu d'être.

### Décisions prises

- Saisons en puces filtrantes, pas de séparateurs dans la grille : préserver l'effet « mur ».
- Sync par cron idempotent 2×/jour plutôt qu'un calendrier calé sur les vendredis de diffusion.
- Vidéos bonus (hors RSS) : pas de section dédiée ; rattachées à l'épisode dont le titre
  correspond (≥ 70 %), sinon lien `youtube` ajouté à la main dans `episodes-data.js`.
- complorama.fr reste pour l'instant un renvoi 301 vers tristan.pro/complorama/ ; en faire
  l'adresse principale du mur est **en réflexion chez Tristan** (voir « Reste à faire »).
- OVH : un seul jeton, droits larges hors facturation, stocké uniquement dans les secrets GitHub ;
  lectures libres, écritures annoncées et validées ; aucun accès OVH depuis le Mac n'est requis.
- Aucune dépendance externe, y compris pas de Cloudflare ni de CDN devant les sites.
- Pas de PR à faire relire par Tristan : Claude fusionne lui-même après vérification.

### Reste à faire / à surveiller

- **Rentrée du 11 septembre 2026** : vérifier ce vendredi soir (sync 18:00 UTC) et samedi matin
  (08:00 UTC) que le premier épisode de la saison 7 remonte, que la pastille passe de
  « REPRISE LE 11 SEPT » à « EN COURS » et que la puce « Saison 07 » apparaît. Rentrée 2027 :
  passer `SEASON` à 8 et `SEASON_START` à la date annoncée.
- **complorama.fr comme adresse principale** (si Tristan le décide) : il crée un dépôt GitHub
  (par ex. `tristanmf/complorama`) et y autorise l'application GitHub de Claude ; ensuite, côté
  Claude : y publier le mur (ou une simple page de renvoi), configurer le domaine personnalisé
  dans Pages, pointer la zone via l'API OVH (A 185.199.108/109/110/111.153 + AAAA
  2606:50c0:8000/8001/8002/8003::153 sur `@`, CNAME `www` → `tristanmf.github.io`), retirer
  complorama.fr et www du multisite egoblog.net, activer « Enforce HTTPS », vérifier avec HTTP probe.
- **`https://www.tristan.pro`** : certificat GitHub toujours limité à l'apex au 3 septembre
  (détails et marche à suivre dans la section « Portfolio » ci-dessous, « DNS / certificat »).
- **Nettoyages optionnels** : supprimer les TXT `1|…` / `4|…` inertes de la zone complorama.fr ;
  supprimer `tools-sri.yml` ; charger `hls.js` (529 Ko) seulement quand une vidéo `.m3u8` est lue
  sur la page racine.
- **Jeton OVH** : il lui manque le droit sur le chemin nu `GET /hosting/web` (liste des
  hébergements). Non bloquant grâce au repli par domaine rattaché ; à inclure si le jeton est un
  jour recréé, avec les autres chemins nus (`/domain`, `/email/domain`, `/me`).
- `app.jsx` (portfolio) est aussi modifié par une autre session Claude : toujours repartir de
  `main` à jour avant d'y toucher, et laisser le workflow Build front-end recompiler.

---

# Portfolio (page d'accueil) — état, décisions, reste à faire

Ce site est un **showcase** : sa fonction est d'amener à la prise de contact (conférences,
interviews). Ne pas le surcharger. Section rédigée le 2 septembre 2026.

## Repères pratiques (page d'accueil)

- On travaille dans **`app.jsx`** ; `index.html` ne porte que le `<head>` (SEO, Open Graph,
  JSON-LD) et le CSS global. Le build (~15-20 s) recompile aussi Tailwind, qui scanne
  `index.html` + `app.jsx` : toute nouvelle classe est prise en compte sans rien faire.
- **Valider `app.jsx` avant tout commit** — une erreur de syntaxe = page blanche :
  `node -e 'const p=require("/tmp/node_modules/@babel/parser");p.parse(require("fs").readFileSync("app.jsx","utf8"),{sourceType:"script",plugins:["jsx"]});console.log("ok")'`
  (`npm install @babel/parser` dans `/tmp` si absent.)
- Toujours `git pull --rebase origin main` avant de pousser : plusieurs conversations
  (Complorama, TMF Lab, outillage) écrivent sur `main` en parallèle.
- Les images **collées** dans le chat n'arrivent jamais sur disque. Seul canal fiable :
  déposer les fichiers dans le dépôt et pousser (Tristan sait faire, ou une session Claude
  sur son Mac le fait pour lui).
- Pillow (installable) pour composer les visuels. Formats des cartes : standard 4:3 →
  **1200 × 900** ; compact (section 02) 3:2 → **1200 × 800**. Style maison : visuel ou icône
  du projet plutôt que capture d'écran (cf. `clipflow.jpg`).
- `README.md` est obsolète (parle de `styles.css`/`script.js`). `portfolio-site.zip` traîne à
  la racine, origine inconnue : demander avant de supprimer.
- Projets hébergés ailleurs, **absents de ce dépôt**, impossibles à casser d'ici :
  ComploScore (`tristanmf/carte-complotisme` → `tristan.pro/carte-complotisme/`),
  Technofascisme (`tristanmf/TECHNOFASCISME-Infographie-interactive`),
  Happy World (`egoblog.net/happyworld/`), TMF Lab (`tmflab.tech`).

## Structure de la page (ordre réel dans `App`)

1. **Hero** `#top` — vidéo `hero.mp4`, titre, boutons, réseaux, indicateur « Défiler ».
   `min-height` (pas `height` fixe) pour ne jamais rogner l'indicateur.
2. **À propos** `#apropos` — sans vidéo (retirée volontairement).
3. **[01] Télé, radio, podcast** `#projets` — Complorama, Antidote, Les Vérificateurs.
4. **[02] Recherche, livres & institutionnel** `#institutionnel` — Conspiracy Watch, CHIPIP,
   *Internet, une infographie*, *Les Faussaires de la nation*.
5. **Productions** `#productions` — **tuile TMF Lab seule** (`tmflab.mp4`, `tmflab-logo.svg`,
   accent `#ff5b2e`, fond `#07080a`) + ligne discrète « Voir aussi » vers ComploScore,
   Technofascisme, Happy World. La grille de cartes est retirée mais son tableau `items`
   est **conservé dans `app.jsx`** pour réactivation.
6. **Conférencier** `#conferences` — vidéo `conf.mp4` ; cartes Entreprises / Universités /
   Médias (« Interventions & plateaux ») / Administrations (« Formations & conférences »).
7. **Parlons-en** `#contact` — vidéo `bottom.mp4` en crossfade, bouton « Écrivez-moi ».

Transversal : navbar (scroll-spy, menu mobile), aurora blobs bleu/violet, barre de
progression, parallax hero et fonds vidéo. La dérive parallax des cartes est **désactivée**
(`speed={0}`) : elle donnait l'impression d'un défaut d'alignement.

## Décisions prises (et pourquoi) — ne pas rouvrir sans raison

**Contact**
- Adresse : `contact@tristan.pro`, alias OVH (MX Plan) redirigé vers Gmail, **vérifié** avec
  cinq expéditeurs. Choisi pour être révocable sans exposer l'adresse personnelle.
- Obfusquée en codes de caractères décalés (`MAIL_A`/`MAIL_B`, offset 7), jamais en clair ni
  en base64. Pas de formulaire : risque de perte de messages, dépendance tierce.
- **Piège connu** : un mail envoyé *depuis* `tristanmf@gmail.com` vers `contact@` n'arrive
  jamais (Gmail déduplique le Message-ID). Ce n'est pas une panne, ne pas rediagnostiquer.
- Le SPF de tristan.pro contient encore `include:icloud.com` : inoffensif, **ne pas toucher**.

**Contenu**
- LCI non reconduit → carte au passé (« de 2025 à 2026 »), en dernière position.
- Livre CNRS monté en section 02 avec le nouveau collectif (Philippe Rey, 1er oct. 2026).
- TMF Lab : charte **orange sur fond sombre**, pas jaune. Titre = accroche réelle du labo :
  « Je ne code pas. J'expérimente. » Le logo est blanc : jamais sur fond clair.
- ClipFlow et Blogtrotters ne sont plus sur le site : ils vivent dans TMF Lab.
- Refusé : replier une section derrière un bouton (contenu caché = contenu non vu) ;
  pastille TMF Lab dans le hero (dilue le message « disponible pour confs »).
- Médias : Tristan **intervient**, il n'**anime** pas. Éviter « tables rondes » en libellé.
- Positionnement : « cultures numériques » en tête des descriptions SEO ; « transforme la
  société » (pas « l'information ») dans le hero.

**Technique**
- Mode économie d'énergie iOS bloque l'autoplay vidéo → bouton play natif. Accepté, aucun
  contournement fiable (CSS testé, inefficace).

## DNS / certificat www.tristan.pro

- `www CNAME tristanmf.github.io.` corrigé chez OVH le 14/08/2026, propagé.
- Le certificat GitHub ne couvrait pas `www` (cassé depuis juin 2025 — le CNAME pointait sur
  l'apex). Renouvellement naturel attendu vers le **6 octobre 2026**.
- Le 2 septembre, `CNAME` a été supprimé puis recréé dans le dépôt (commits `f22bb57` /
  `d410181`) — empreinte d'un vidage/resaisie du *Custom domain* dans Settings › Pages.
  Sondé le 3 septembre : le certificat couvre toujours l'apex seul → attendre le 6 octobre,
  resonder avec Tools · HTTP probe, puis cocher *Enforce HTTPS*.
- Ne jamais activer l'hébergement web OVH sur tristan.pro (réécrit A et MX). Ne toucher qu'à
  `www` ; A, MX, NS, TXT et CNAME de service OVH sont à préserver.

## Reste à faire / à surveiller

- [ ] **Certificat www** : HTTP probe du 3 septembre 10:07 → certificat encore limité à l'apex
      (émis le 7 août) ; la resaisie du 2 septembre n'a rien redéclenché. Attendre le
      renouvellement (~6 octobre), resonder, puis recocher *Enforce HTTPS*.
- [ ] **1er octobre 2026** : sortie des *Faussaires de la nation* → lien vers la page éditeur,
      retirer « Parution le 1er octobre » de la carte.
- [ ] Vérifications visuelles impossibles depuis le bac à sable (Tristan) : rendu de la tuile
      TMF Lab et de la ligne « Voir aussi ».
- [ ] Réécrire `README.md` ; décider du sort de `portfolio-site.zip`.
- [ ] Option ouverte : variante sombre du logo TMF Lab (inutile tant que la tuile est sombre).
- [ ] Option ouverte : réactiver la grille de cartes sous la tuile (données en place).
