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
- Droits OVH : un joker `/hosting/web/*` ne couvre pas le chemin nu `/hosting/web` (⇒ 403).
  Le rapport de zone contourne via `GET /hosting/web/attachedDomain?domain=<zone>`.
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
- `tristan.pro` → GitHub Pages (ce dépôt). Question ouverte : faire de complorama.fr l'adresse
  principale du mur demanderait un second dépôt GitHub Pages, que seul Tristan peut créer.

## Autres outils Actions

- **Tools · Fetch asset** (`url`, `dest`) : miroir d'un fichier distant dans le dépôt.
- **Tools · Vendor assets** : re-télécharge polices et bibliothèques (`scripts/vendor-assets.mjs`).
- **Tools · SRI hashes** : historique, plus utilisé depuis l'auto-hébergement complet.
