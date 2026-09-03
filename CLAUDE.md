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

### Recherche dans les transcriptions — EN LIGNE depuis le 3 septembre 2026

Les 111 épisodes audio transcrits (94 416 segments, **483 739 mots**) sont interrogeables depuis
le mur. Pour comparaison, la recherche sur les titres et chapôs ne portait que sur ~25 800 mots :
**dix-neuf fois moins**.

**Architecture** — backend privé, décidé pour ne jamais publier le texte intégral d'une
production Radio France, et parce que c'est plus rapide :

```
recherche.complorama.fr  →  dossier complorama/api  (hébergement egoblog.net, PHP 8.4)
complorama/api/search.php     l'unique point d'entrée · réponse en ~10 ms
complorama/api/.htaccess      pas de listing, refus des fichiers de données
complorama/data/              HORS RACINE WEB — rien n'y est joignable par HTTP
  segments-audio.json         déposé par le Mac (9,1 Mo)
  index.sqlite                construit par Actions (5,2 Mo, FTS5)
```

- Le mur appelle ce point d'entrée **après une frappe, jamais au chargement** : c'est le seul
  contact avec un autre domaine de toute la page, et son échec est sans effet (le mur continue).
- Aucun lecteur YouTube n'est intégré : le bouton vidéo est un lien, Google n'est chargé qu'au clic.
- Seuls de courts extraits sortent, jamais le texte complet.

**Workflow `Complorama · Indexer les transcriptions`** — récupère le fichier par SFTP, construit
l'index, déploie. **Vérification seule par défaut**, cocher « Déployer » pour publier. À relancer
après chaque nouveau dépôt de transcriptions par le Mac.

**Rattachement des transcriptions aux épisodes : par DATE d'abord, puis titre, le numéro en
dernier recours** — et jamais de repli sur le numéro si le fichier annonce une date ou un titre
qui ne correspond à rien (l'épisode est écarté et signalé). Un test avec des titres reformulés
avait montré qu'un repli sur le numéro rattachait silencieusement un passage au mauvais épisode.
Résultat sur les vraies données : 111/111 rattachés par la date.

**Numérotation du mur, vérifiée** : 1 à 112 sans trou, et « La 100e de Complorama » tombe bien
sur le n°100 — l'ancre se contrôle donc elle-même.

**Manque l'épisode n°26** (« Présidentielle 2022 : l'élection qui serait truquée », 31 mars 2022),
absent du lot transcrit. Il suffit de le transcrire et de redéposer le fichier.

#### Noms propres mal transcrits — deux mécanismes

Whisper écrit les noms propres à l'oreille : « Meyssan » était devenu « Messant ».
Un relevé de 59 noms contre l'index a mesuré l'ampleur réelle : **53 corrects, 6 fautifs**.
La qualité des transcriptions est donc bonne, le problème est ciblé.

1. **`_backend/complorama/corrections.json`**, appliqué à la construction de l'index.
   Répare la recherche **et la citation affichée** — citer l'émission de quelqu'un avec un nom
   mal orthographié n'est pas acceptable. N'y entrent que les graphies dont on a **lu le
   passage** : substituer sur une simple ressemblance phonétique reviendrait à faire dire à
   Tristan un nom qu'il n'a pas prononcé. Section `a_confirmer` pour les cas en attente.
   Confirmés au 3 septembre : Meyssan (messant, messand), Perronne (perrone),
   Reynouard (reynoir), Rassinier (racinier).
2. **Repli automatique du moteur**, pour tout ce qu'on n'a pas anticipé : une recherche sans
   résultat déclenche une recherche des graphies voisines réellement présentes dans le
   vocabulaire de l'index (distance d'édition, sans seuil de fréquence — un nom prononcé une
   seule fois en six ans est justement ce qu'on veut retrouver), et le mur l'annonce en clair.

**Workflow `Complorama · Diagnostic de recherche`** : donne, pour une liste de mots, ceux que
l'index ne contient pas et les graphies voisines qu'il contient. C'est l'outil qui alimente la
table de corrections. Option `--brief` pour passer une longue liste d'un coup.

**Pour les futurs épisodes**, la session Mac passe à Whisper un `initial_prompt` contenant les
noms du champ (Meyssan, Soral, Chouard, Raoult, Casasnovas, Perronne, Faurisson, Rassinier,
Reynouard, Daillet, Azalbert, QAnon, Bilderberg, adrénochrome…). Plafonné à ~220 jetons ;
n'agit que sur les nouvelles transcriptions. Cela évite que le problème se reproduise.

#### Ce qui reste à faire

- **`segments-video.json`** (côté Mac) : transcriptions des vidéos YouTube. Elles ne servent pas
  de contenu indexé mais de **règle graduée** pour calculer la correspondance `moment audio →
  moment vidéo`, stockée dans la table `video_map`. Tant qu'elle est vide, un résultat d'épisode
  filmé affiche « voir la vidéo » sans minutage — et surtout **ne prétend pas** que le passage a
  été coupé au montage, ce qui serait faux.
- Le script d'alignement audio/vidéo lui-même (à écrire, côté GitHub, une fois le fichier là).
- L'alerte par ticket GitHub quand un nouvel épisode ou une nouvelle vidéo paraît.

#### Vérifications faites le 3 septembre, à ne pas refaire

- **Radio France ne permet pas de lien vers un minutage.** Ni `SeekToAction` schema.org, ni aucun
  marqueur de saut ; JSON-LD vide, et l'URL du MP3 absente du HTML servi (chargée en JavaScript).
- **Pas de transcription officielle** : aucune balise `<podcast:transcript>` dans le flux RSS.
- **Le flux RSS ne contient que 7 épisodes** (fenêtre glissante). Il sert à détecter les
  nouveautés, pas à reconstituer le catalogue ; les MP3 anciens ne sont pas récupérables par là.
- **Les sous-titres YouTube ne sont pas récupérables depuis GitHub Actions** : le runner reçoit
  une page dégradée, sans `captionTracks`. D'où l'alignement calculé depuis le Mac.
- **Audio et vidéo ne sont pas le même montage** : l'audio est la version longue (~30 min et
  plus), la vidéo un montage raccourci (~20 min). L'audio est le sur-ensemble, donc **on n'indexe
  que l'audio** — indexer les deux créerait des doublons et fausserait le classement.
- **Une tâche OVH `hostedssl/multisite/create` est bloquée en statut *doing* depuis le 31 août.**
  Elle n'a empêché ni le rattachement ni l'émission du certificat du sous-domaine. Anomalie à
  garder en tête, sans conséquence connue à ce jour.

#### Répartition des rôles entre les deux Claude

Le partage se fait par **tickets GitHub** : la synchronisation ouvre un ticket
« Épisode NNN à transcrire » quand elle voit un nouvel épisode ou une nouvelle vidéo (GitHub
envoie l'alerte par mail à Tristan) ; la session Mac le lit, fait le travail, le referme. Aucun
copier-coller pour Tristan.

*Côté GitHub (cette session)* : détecter les nouveautés, ouvrir le ticket, indexer, déployer.

*Côté Mac (en skill, il a seul les outils)* : télécharger l'audio et, s'il existe, la vidéo ;
transcrire les deux avec la chaîne Whisper habituelle ; déposer par SFTP dans
`complorama/data/` ; mettre à jour le répertoire Notion ; refermer le ticket. Format attendu :
`{"episodes":[…],"segments":[{"id","ep","t","t_fin","txt"},…]}`, audio et vidéo dans deux
fichiers distincts (`segments-audio.json`, `segments-video.json`).

**Accès SFTP** : un utilisateur OVH dédié, **cloisonné dans le dossier `complorama/`**, créé le
3 septembre par le workflow `Tools · OVH SFTP user`. Vérifié : il reçoit « permission denied »
sur tout le reste — il ne peut atteindre ni le WordPress d'egoblog, ni Blogtrotters, ni TMF Lab.
Son mot de passe est le secret GitHub `OVH_SFTP_PASSWORD` ; son identifiant n'est écrit nulle
part, il se recalcule à l'exécution (`primaryLogin` + `-cplr`) pour ne jamais apparaître dans un
journal public. Hôte : `ssh.cluster113.hosting.ovh.net`, SFTP uniquement.
Le Mac, lui, utilise son propre accès `ovhftp` sur le compte principal : aucun secret à faire
circuler entre les deux sessions.

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
  - **Tools · OVH hosting report** (`tools-ovh-hosting.yml`) : lecture seule, tout d'un
    hébergement web en un run : offre et quota disque, moteur PHP configuré, bases et bases
    encore créables, cron, domaines attachés avec le dossier servi.
  - **Tools · HTTP probe** (`tools-http-probe.yml`) : comportement réel d'un nom de domaine
    vu de l'extérieur : réponses http/https, cible de redirection vue par un téléphone, matrice
    navigateurs/robots, certificats. Vérification systématique après un changement DNS/SSL.
  - Code : `scripts/ovh-api.mjs`, `scripts/ovh-zone-report.mjs`, `scripts/ovh-hosting-report.mjs`,
    `scripts/ovh-schema.mjs`, client partagé `scripts/lib/ovh.mjs` (`ovhClient()`, `redact()`)
    pour écrire de nouveaux scripts.
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
- **Capacités de l'hébergement `egoblog.net`** (relevé du 3 septembre 2026, `Tools · OVH hosting
  report`) : offre `hosting-perso` mutualisée, **100 Go d'espace dont 8,2 Go utilisés** ;
  **PHP 8.4 disponible** (aussi 8.2, 8.0, 7.3, 5.6, 5.5 — la version appliquée à un dossier se
  choisit par son fichier `.ovhconfig`) ; **SSH** (`ssh.cluster113.hosting.ovh.net`) et FTP
  (`ftp.cluster113.hosting.ovh.net`) ; **2 bases MySQL 8.0** (une de 1 Go quasi vide, une de
  256 Mo utilisée à 20 Mo) et **4 bases `sqlPerso` encore créables** ; **aucun cron configuré** ;
  aucun module OVH installé. Dossiers servis : `www` (egoblog.net), `blogtrotters`,
  `www/tmflab` (tmflab.tech + tmfab.fr), `www/complorama-redir`.
  De quoi héberger un petit backend (PHP + SQLite ou MySQL) si un projet en a besoin.
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
- Tristan a supprimé puis recréé le `CNAME` (commits `f22bb57` / `d410181`, 3 septembre
  ~08:07 UTC, contenu inchangé) — empreinte d'un vidage/resaisie du *Custom domain* dans
  Settings › Pages, qui redéclenche la demande de certificat.
- **Sonde HTTP du 3 sept. 08:09 UTC** (run 33731822540) : `www` toujours **non couvert**
  (certificat `*.github.io` présenté) ; apex inchangé (`tristan.pro` seul, émis 7 août,
  expire 5 nov.). Deux minutes après la resaisie, c'est trop tôt pour conclure.
- **Sonde HTTP du 3 sept. 11:19 UTC** (run 33749009094, ~3h après la resaisie) : `www`
  toujours **non couvert**, apex inchangé — même résultat qu'à 08:09. La resaisie du
  Custom domain n'a donc pas suffi à elle seule à déclencher l'émission.
- **À faire : ne pas répéter le remove/re-add.** Attendre le renouvellement naturel du
  6 octobre, puis resonder avec Tools · HTTP probe. Si `www` est alors couvert, cocher
  *Enforce HTTPS*.
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
