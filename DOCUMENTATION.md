# Documentation technique

Ce document explique comment le site fonctionne et comment le faire évoluer. Pour une explication pas à pas destinée à un débutant, voir [docs/GUIDE.md](./docs/GUIDE.md).

## Sommaire

1. [Principes](#1-principes)
2. [Du code source à la page](#2-du-code-source-à-la-page)
3. [Le bureau](#3-le-bureau)
4. [Thème clair et sombre](#4-thème-clair-et-sombre)
5. [Le terminal](#5-le-terminal)
6. [Contenu et « À compléter »](#6-contenu-et--à-compléter-)
7. [Intégrations externes](#7-intégrations-externes)
8. [Sécurité](#8-sécurité)
9. [Accessibilité](#9-accessibilité)
10. [Tests, CI et déploiement](#10-tests-ci-et-déploiement)
11. [Terraform](#11-terraform)
12. [Conventions](#12-conventions)
13. [Dépannage](#13-dépannage)

---

## 1. Principes

- **Site 100 % statique.** Tout est calculé au build, y compris les appels à l'API GitHub. Le navigateur du visiteur ne télécharge que du HTML, du CSS, un peu de JavaScript et les polices. Il n'y a ni serveur, ni base de données, ni cookie.
- **Le contenu est séparé du code.** Les textes vivent dans `src/config/site.ts` et `src/data/*.ts`. Les composants ne contiennent pas de texte personnel, à part quelques phrases d'interface.
- **Rien de provisoire en production.** Ce qui n'est pas renseigné est visible en développement et invisible en production (voir [§6](#6-contenu-et--à-compléter-)).
- **Une seule source pour deux présentations.** Les fenêtres du bureau (`src/components/apps/`) et la version simple (`src/pages/simple.astro`) ont chacune leur mise en page, mais lisent les mêmes données. Modifier `src/data/projects.ts` met donc à jour les deux.
- **Amélioration progressive.** Sans JavaScript, les icônes et le dock sont de simples liens vers la version simple. Le JavaScript les transforme en lanceurs de fenêtres.
- **Sécurité par défaut.** La CSP est stricte, aucun style ni script n'est écrit en ligne, et aucun secret n'arrive dans le navigateur (voir [§8](#8-sécurité)).

## 2. Du code source à la page

```
src/config/site.ts ─┐
src/data/*.ts ──────┼──► src/lib/content.ts ──► ready.* (quoi publier)
public/documents/ ──┘          │                missingItems() (quoi compléter)
                               ▼
                    src/apps/registry.ts ──► visibleApps()
                               │
API GitHub (build) ──► src/lib/github.ts
                               │
                               ▼
         src/pages/index.astro : barre de menu + icônes + une <Window> par application + dock
         src/pages/simple.astro : mise en page éditoriale, mêmes données
                               │
                               ▼  npm run build
                            dist/ (HTML + CSS + JS + polices)
```

Dans le navigateur, trois scripts prennent le relais :

| Script                                   | Rôle                                                   |
| ---------------------------------------- | ------------------------------------------------------ |
| `public/scripts/theme-init.js`           | applique le thème **avant** l'affichage (pas de flash) |
| `src/scripts/theme.ts`                   | bouton de thème, choix enregistré, suivi du système    |
| `src/scripts/window-manager.ts`          | ouverture, placement, déplacement, fermeture           |
| `src/scripts/terminal/shell.ts`          | affichage et saisie du terminal                        |
| `src/scripts/mail.ts`                    | fenêtre Mail : modèles, copie de l'adresse, envoi      |

## 3. Le bureau

### 3.1 Le registre des applications

`src/apps/registry.ts` décrit chaque fenêtre :

| Champ         | Effet                                                                     |
| ------------- | ------------------------------------------------------------------------- |
| `id`          | identifiant, utilisé dans l'URL (`/#projets`) et dans `open <id>`         |
| `label`       | nom court (icône, dock, commande `open`)                                  |
| `windowTitle` | texte de la barre de titre                                                |
| `icon`        | nom d'une icône de `src/components/ui/icons.ts`                           |
| `desktop`     | `true` : icône sur le bureau                                              |
| `dock`        | `true` : bouton dans le dock (les 4 premiers restent visibles sur mobile) |
| `openOnStart` | `true` : ouverte au chargement, sur ordinateur uniquement (terminal)        |
| `flush`       | `true` : sans marge intérieure (fenêtres « plateforme », terminal, mail)   |
| `geometry`    | position et taille par défaut pour un écran 1440×900                      |
| `publish`     | `false` : masquée en production (contenu absent)                          |

`visibleApps()` renvoie toutes les applications en développement, et seulement celles dont `publish` vaut `true` en production.

### 3.2 La fenêtre

`src/components/os/Window.astro` produit une `<section role="dialog" hidden>`. Elle contient une barre de titre (`[data-drag]`), des boutons « Agrandir » et « Fermer », et une zone de contenu. La zone de contenu est un *container* CSS : les fenêtres adaptent leur mise en page à leur propre largeur (`@container`), pas à celle de l'écran.

La géométrie par défaut est transmise par des attributs `data-x`, `data-y`, `data-w` et `data-h`, **jamais par un attribut `style`** : la CSP l'interdirait (voir [§8](#8-sécurité)).

### 3.3 Le gestionnaire de fenêtres

`src/scripts/window-manager.ts` :

- **Lanceurs.** Tout élément `[data-open="<id>"]` ouvre la fenêtre correspondante : icônes, dock, liens à l'intérieur des fenêtres. Ce sont des `<a>` vers `/simple#<id>` (exceptions dans `fallbackHref()` : le terminal pointe vers `/#terminal`, Mail vers `mailto:`). Sans JavaScript, ou depuis la version simple, le lien fonctionne normalement.
- **Placement.** À la première ouverture, la fenêtre prend sa géométrie par défaut, mise à l'échelle et recadrée selon la taille réelle de l'écran. Elle ne recouvre pas le dock.
- **Premier plan.** Un clic ou un focus clavier dans une fenêtre la passe devant (`z-index` croissant, renuméroté au-delà de 8000 pour rester sous le dock).
- **Déplacement.** On déplace la fenêtre avec la barre de titre, à la souris ou au doigt (Pointer Events). La barre reste toujours atteignable.
- **Redimensionnement.** Il se fait par le coin inférieur droit (CSS `resize: both`).
- **Agrandissement.** Bouton dédié ou double-clic sur la barre.
- **Fermeture.** Bouton, touche Échap, ou commande `exit` dans le terminal. Le focus revient sur le lanceur.
- **Liens directs.** `/#homelab` ouvre directement la fenêtre Homelab, à la place du terminal d'accueil. Un changement de `#` dans l'URL ouvre aussi la fenêtre.
- **Événements.** Le gestionnaire écoute `os:open` et `os:close` (`detail: { id }`). C'est ainsi que le terminal ouvre et ferme les fenêtres sans dépendre du gestionnaire.

### 3.4 Sur téléphone (moins de 768 px)

Tout se passe en CSS (`src/styles/os.css`, bloc `@media (max-width: 767px)`), plus une condition dans le gestionnaire (pas de déplacement) :

- au démarrage, aucune fenêtre ne s'ouvre : l'écran d'accueil montre la carte de présentation, les icônes en grille de 4 et, en bas à droite, le post-it « Recruteur pressé ? » ;
- les fenêtres s'ouvrent en cartes encadrées entre la barre de menu et le dock, avec un léger décalage en cascade quand on en empile plusieurs (variable CSS `--cascade`) ;
- le bouton « Agrandir » passe la fenêtre en plein écran ;
- le dock garde 4 applications (Projets, Parcours, Terminal, Mail) et le bouton CV ;
- `fastfetch` retire son logo quand le terminal fait moins de 64 caractères de large.

### 3.5 Ajouter une application

Exemple : une fenêtre « Veille » qui liste tes lectures techniques.

1. Crée les données : `src/data/veille.ts`.
2. Crée le contenu : `src/components/apps/VeilleApp.astro`. Mets-le dans un `<div class="app">` et utilise les classes de `src/styles/apps.css` (`app-block`, `entry`, `rows`…).
3. Ajoute `'veille'` au type `AppId` et une entrée dans `apps` (`src/apps/registry.ts`).
4. Associe-la dans `src/pages/index.astro` : `views = { …, veille: VeilleApp }`.
5. Pour la version simple, ajoute une section dans `src/pages/simple.astro` avec `<SectionHeading n={next()} cmd="open veille" title="…" id="veille" />`. La numérotation suit l'ordre d'affichage.
6. Facultatif : si son contenu peut être vide, ajoute un indicateur dans `ready` (`src/lib/content.ts`), utilise-le pour `publish`, et ajoute la ligne correspondante dans `missingItems()`.

La commande `open veille` du terminal fonctionne automatiquement : la liste des applications lui est transmise.

### 3.6 Les fenêtres « plateforme »

Quatre fenêtres reprennent l'organisation d'interfaces que tout recruteur connaît. On comprend ainsi chacune sans explication :

| Fenêtre   | Organisée comme             | Éléments repris                                                                                       |
| --------- | --------------------------- | ----------------------------------------------------------------------------------------------------- |
| Parcours  | un profil LinkedIn          | bannière, photo ronde qui chevauche, titre, « Coordonnées », relations, encart « À l'écoute », sections Infos / Expérience / Formation / Compétences, vignettes d'organisation |
| Projets   | un profil GitHub            | colonne de profil, dépôts épinglés en grille, pastille de langage, étoiles, graphe de contributions    |
| Freelance | un profil Malt              | en-tête avec disponibilité et tarif journalier, bouton « Proposer un projet », compétences en étiquettes |
| Mail      | un « Nouveau message »      | destinataire en pastille, champ Objet, corps, bouton Envoyer arrondi, corbeille                        |

**Ce qui n'est pas repris, volontairement :** les logos, les noms de marque présentés comme le service lui-même, et les couleurs signatures (bleu LinkedIn, rouge Gmail…). Tout est dans la palette du site. Il y a trois raisons à ce choix :

- les conditions d'utilisation et les chartes de marque de ces services interdisent d'imiter leur interface ;
- une page qui imite parfaitement LinkedIn ressemble à de l'hameçonnage, ce qui serait malvenu sur un profil sécurité ;
- l'objectif est que le visiteur reconnaisse la plateforme, pas qu'il croie y être. Chaque fenêtre renvoie d'ailleurs vers le vrai profil.

Les styles sont dans `src/styles/platforms.css`, avec des préfixes : `li__` (Parcours), `gh__` et `repo__` (Projets), `malt__` (Freelance), `gm__` (Mail).

**Pastille de langage (Projets).** La couleur vient d'une classe `lang-<nom>` (`lang-java`, `lang-typescript`…), définie dans `platforms.css`. Un langage absent de la liste s'affiche en gris : ajoute sa classe si besoin.

### 3.7 La fenêtre Mail

- Le destinataire est `site.email`. Tant qu'il est vide, la fenêtre n'est pas publiée.
- **Envoyer** construit un lien `mailto:` (`src/scripts/mail-core.ts`, testé) et ouvre la messagerie du visiteur avec l'objet et le message préremplis. Le message part donc du vrai compte du recruteur, et aucune donnée ne passe par un serveur. L'adresse est encodée pour qu'on ne puisse pas y glisser des paramètres (`?cc=…`).
- Les **modèles** (`src/data/mail.ts`) remplissent l'objet et le corps, puis sélectionnent le premier `[champ à compléter]`.
- **Copier l'adresse** sert aux visiteurs qui n'ont pas de messagerie configurée (cas fréquent sur un ordinateur de bureau).
- Pour un envoi sans quitter la page, il faudrait un petit serveur.

## 4. Thème clair et sombre

- **Couleurs.** Toutes les couleurs sont des variables CSS dans `src/styles/tokens.css`. Le thème clair est défini sur `:root`. Le thème sombre est défini deux fois : sous `@media (prefers-color-scheme: dark)` (quand JavaScript est absent) et sous `:root[data-theme='dark']` (choix explicite).
- **Avant l'affichage.** `public/scripts/theme-init.js` lit le choix enregistré (`localStorage`, clé `theme`), ou à défaut le réglage du système, et pose `data-theme` sur `<html>`. Le fichier est externe pour rester compatible avec la CSP.
- **Ensuite.** `src/scripts/theme.ts` gère le bouton, la commande `theme clair|sombre` du terminal (événement `os:theme`), et suit les changements du système tant qu'aucun choix n'est enregistré.
- **Ajouter une couleur.** Ajoute la variable dans les **trois** blocs de `tokens.css` (clair, sombre système, sombre explicite), puis utilise `var(--ma-couleur)`. Vérifie le contraste : au moins 4,5:1 pour du texte, dans les deux thèmes.
- **Exception.** Le terminal reste sombre dans les deux thèmes (`--term-*`), comme un vrai terminal.

## 5. Le terminal

### 5.1 Architecture

| Fichier                             | Contenu                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------- |
| `components/apps/TerminalApp.astro` | balisage, et **données sérialisées en JSON** dans la page au build        |
| `scripts/terminal/types.ts`         | types partagés                                                            |
| `scripts/terminal/fs.ts`            | système de fichiers virtuel en lecture seule, résolution des chemins      |
| `scripts/terminal/commands.ts`      | interpréteur : fonctions **pures**, sans DOM, donc testables              |
| `scripts/terminal/shell.ts`         | affichage, historique (↑ ↓), autocomplétion (Tab), Ctrl+L, effets         |

Une commande ne touche jamais le DOM. Elle renvoie des **lignes** à afficher et des **effets** (`open`, `close`, `theme`, `clear`, `download`), que `shell.ts` applique.

### 5.2 Ajouter une commande

Dans `src/scripts/terminal/commands.ts`, ajoute une entrée à l'objet `commands` :

```ts
stack: {
  description: 'technologies que j’utilise',
  run(ctx) {
    say(ctx, 'Docker · Kubernetes · Terraform · Prometheus', 'accent');
  },
},
```

Elle apparaît automatiquement dans `help`, dans `man` et dans l'autocomplétion. `ctx.args` contient les arguments, `ctx.data` les données du site, `ctx.cwd` le dossier courant (modifiable, comme le fait `cd`), et `ctx.effects.push(...)` déclenche un effet.

Ajoute un test dans `tests/terminal.test.ts`.

### 5.3 Ajouter un fichier

Le système de fichiers est construit par `buildFs()` (`fs.ts`) à partir des données. Ajoute une entrée `'nom.txt': file('contenu')` dans le dossier voulu. Pour un contenu qui vient du site, ajoute d'abord le champ dans `TerminalData` (`types.ts`), puis remplis-le dans `TerminalApp.astro`.

### 5.4 Sécurité du terminal

- Le texte est inséré avec `textContent`, **jamais `innerHTML`** : rien de ce qui est tapé ne peut devenir du HTML.
- Le JSON intégré à la page est échappé (`<` → `<`) pour ne pas pouvoir fermer la balise `<script>`.
- Il n'y a aucune exécution réelle : tubes, redirections et enchaînements sont refusés explicitement.

## 6. Contenu et « À compléter »

Trois mécanismes garantissent qu'aucun texte provisoire n'est publié :

1. **`<Todo label="…" />`** (`src/components/ui/Todo.astro`) affiche un encadré en pointillés **en développement uniquement**. En production, il ne produit rien.
2. **Les sections vides** ne sont pas affichées en production : par exemple, la section « Services » du homelab n'apparaît que si la liste n'est pas vide.
3. **Les fenêtres sans contenu** (Recommandations, Marché, Questions) ont `publish: false` tant que leurs données sont vides. Elles disparaissent alors du bureau, du dock, du terminal et de la version simple.

À chaque build, `reportMissing()` affiche la liste de ce qui manque, avec le fichier à modifier. Les documents (CV, lettre, photo) sont détectés automatiquement : il suffit de déposer le fichier au bon endroit dans `public/` pour que les boutons apparaissent.

## 7. Intégrations externes

### GitHub (au build)

`src/lib/github.ts` :

- **`getRepo('Stefy237/Mysh')`** : API REST publique. Elle renvoie le langage, les étoiles et la date du dernier push. Elle fonctionne sans jeton (60 requêtes par heure).
- **`getContributions('Stefy237')`** : API GraphQL. Elle renvoie le calendrier de contributions et **exige un jeton** (`GITHUB_TOKEN`).
- Les résultats sont gardés en cache pendant le build : un dépôt n'est demandé qu'une fois, même s'il apparaît sur deux pages.
- **En cas d'échec** (réseau, quota, jeton absent), la fonction renvoie `null` avec un avertissement dans le terminal. Le site se construit quand même, sans l'élément concerné.
- **Jeton.** En local, mets-le dans `.env`. En CI, le workflow utilise le secret `GH_STATS_TOKEN` s'il existe, sinon le jeton fourni par Actions. Crée un jeton *fine-grained* sans aucune permission au-delà de la lecture publique.

### Post LinkedIn

C'est la seule façon d'afficher la vraie interface de LinkedIn, en utilisant l'outil d'intégration officiel plutôt qu'une imitation. Sur le post : menu « … », puis « Intégrer ce post », puis copie l'adresse contenue dans `src="…"`. Colle-la dans `site.linkedinPostEmbedUrl`. Elle doit commencer par `https://www.linkedin.com/embed/feed/update/`. Le domaine est déjà autorisé dans la CSP (`frame-src`).

### Photo et bannière

Dépose `public/images/photo.webp` (portrait, au moins 800 px de large) et, si tu veux, `public/images/banniere.webp` (format 4:1, comme ta bannière LinkedIn). L'image de partage (`og:image`) est `public/images/og.jpg`, en 1200×630. Elles sont détectées au build. Sans photo, des initiales s'affichent ; sans bannière, un bandeau typographique reprend `site.bannerTags`. La photo est utilisée à cinq endroits : version simple (grande, en arche), Parcours, Projets, Freelance et la pastille du destinataire dans Mail.

### Vidéo YouTube

Renseigne `site.videoYoutubeId`. La vidéo est intégrée depuis `youtube-nocookie.com`, qui ne dépose pas de cookie de suivi avant la lecture.

### Malt

Le profil est un lien (`site.links.malt`). Le widget officiel n'est pas intégré, parce que son format exact n'a pas été vérifié. S'il s'agit d'un script ou d'une iframe tierce, il faudra **ajouter son domaine à la CSP** dans `astro.config.mjs`.

## 8. Sécurité

### Content-Security-Policy

- **La politique est générée par Astro** (`security.csp` dans `astro.config.mjs`). Astro calcule l'empreinte SHA-256 de chaque script et style qu'il produit et l'inscrit dans une balise `<meta http-equiv="Content-Security-Policy">`. Aucun `'unsafe-inline'`.
- **Règle à retenir : pas d'attribut `style="…"` dans le HTML.** La CSP le bloquerait. Mets les styles dans un `<style>` de composant ou dans `src/styles/`. Les positions calculées en JavaScript (`element.style.left = …`) restent autorisées : la CSP ne bloque pas les modifications faites par script.
- **Pas de `define:vars`, pas de script `is:inline` maison.** Un script externe dans `public/` est autorisé (`'self'`).
- **Domaines autorisés** : seulement `'self'`, plus `www.linkedin.com` et `www.youtube-nocookie.com` en `frame-src`.

### En-têtes HTTP (`public/_headers`)

Une balise `<meta>` ne peut pas porter certaines directives. Cloudflare Pages ajoute donc :

| En-tête                      | Rôle                                                          |
| ---------------------------- | ------------------------------------------------------------- |
| `Strict-Transport-Security`  | HTTPS obligatoire pendant un an                               |
| `frame-ancestors 'none'`     | interdit d'afficher le site dans une iframe (clickjacking)    |
| `X-Content-Type-Options`     | pas de devinette de type de fichier                           |
| `Referrer-Policy`            | n'envoie que le domaine aux sites externes                    |
| `Permissions-Policy`         | caméra, micro, localisation… désactivés                       |
| `Cross-Origin-Opener-Policy` | isole la fenêtre des autres origines                          |

Pour vérifier une fois en ligne : [securityheaders.com](https://securityheaders.com) et [observatory.mozilla.org](https://developer.mozilla.org/en-US/observatory).

### Le reste

- **Secrets.** `GITHUB_TOKEN` n'est lu qu'au build, côté Node. Il n'est jamais transmis au navigateur, et `.env` est ignoré par git.
- **Liens sortants.** Ils portent `rel="noopener"`, et `rel="me"` pour tes propres profils.
- **Dépendances.** `npm audit` tourne en CI (le build échoue au niveau « high »), et Dependabot propose les mises à jour chaque semaine.
- **Vie privée.** Les polices sont auto-hébergées (paquets `@fontsource`) : aucune requête vers Google Fonts. Le site n'a ni cookie, ni traceur, ni outil de statistiques, donc aucun bandeau de consentement n'est nécessaire.

## 9. Accessibilité

- **Fenêtres.** Chacune est un `role="dialog"` non modal, avec un titre (`aria-labelledby`). Le focus entre dans la fenêtre à l'ouverture et revient sur le lanceur à la fermeture. Échap ferme la fenêtre.
- **Navigation.** Un lien d'évitement mène aux applications. Les icônes et le dock sont de vrais liens, et les boutons de vrais `<button>`.
- **Terminal.** La sortie est une région `role="log"` avec `aria-live`. Tab ne complète que si la ligne n'est pas vide : sinon il sert à sortir du champ, pour ne jamais piéger le clavier.
- **Mouvement.** Les animations sont coupées si le système demande à réduire les mouvements.
- **Contraste.** Les couleurs ont été choisies pour respecter WCAG AA dans les deux thèmes. À revérifier à chaque nouvelle couleur.
- **Alternative complète.** La version simple contient tout, sans fenêtres ni JavaScript.

## 10. Tests, CI et déploiement

### Tests

`npm test` lance Vitest sur `tests/`. Les tests couvrent le terminal (chemins, commandes, effets, autocomplétion, affichage étroit) et la construction du lien `mailto:` de la fenêtre Mail.

### CI (`.github/workflows/ci.yml`)

À chaque pull request, et avant chaque déploiement, le workflow enchaîne :

1. `npm ci`
2. `npm audit`
3. `npm run check`
4. `npm run format:check`
5. `npm test`
6. `npm run build`
7. la vérification des liens internes de `dist/` (lychee, hors ligne)
8. l'archivage de `dist/`

### Déploiement (`.github/workflows/deploy.yml`)

À chaque push sur `main`, le workflow appelle d'abord la CI : si elle échoue, rien n'est publié. Il publie ensuite sur Cloudflare Pages, avec `wrangler pages deploy`, le `dist/` que la CI vient de valider, puis contrôle la production (HTTP 200 et en-têtes de sécurité). Il lui faut :

| Type          | Nom                     | Contenu                                               |
| ------------- | ----------------------- | ----------------------------------------------------- |
| Secret        | `CLOUDFLARE_API_TOKEN`  | jeton Cloudflare, permission « Cloudflare Pages: Edit » |
| Secret        | `CLOUDFLARE_ACCOUNT_ID` | identifiant du compte                                 |
| Secret (opt.) | `GH_STATS_TOKEN`        | jeton GitHub en lecture seule pour le graphe          |
| Variable (opt.) | `CF_PAGES_PROJECT`    | nom du projet Pages (défaut : `laura-nguegang`)       |
| Variable (opt.) | `SITE_URL`            | adresse publique (défaut : `https://laura-nguegang.pages.dev`) |

Tant que `CLOUDFLARE_API_TOKEN` n'existe pas, l'étape de publication est ignorée sans faire échouer le workflow.

## 11. Terraform

`infra/terraform/` décrit l'hébergement :

- `cloudflare_pages_project` : le projet Pages, en mode « envoi direct » (c'est la CI qui construit) ;
- `cloudflare_pages_domain` : le nom de domaine personnalisé ;
- `cloudflare_record` : l'enregistrement CNAME vers `<projet>.pages.dev`.

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars   # puis remplis les valeurs
export CLOUDFLARE_API_TOKEN=…                  # jeton avec Pages: Edit et DNS: Edit sur la zone
terraform init
terraform plan      # relis toujours le plan avant d'appliquer
terraform apply
```

L'état (`terraform.tfstate`) est local et ignoré par git. Il contient des identifiants de ressources : ne le partage pas.

## 12. Conventions

- **Langue.** Les contenus, commentaires et messages sont en français. Les identifiants de code sont en anglais, sauf les noms de rubriques (`parcours`, `projets`…), qui suivent les URL.
- **Styles.** Il n'y a aucun attribut `style`. Les couleurs passent par des variables, jamais par une valeur en dur dans un composant (sauf le terminal, toujours sombre).
- **Composants d'application.** Chaque contenu est enveloppé dans `<div class="app">`, avec des titres de section en `<h3>` et des titres d'éléments en `<h4>` (le `<h2>` est le titre de la fenêtre ou de la section).
- **Données.** Un champ vide (`''`, `null` ou `[]`) signifie « à compléter ». N'invente jamais de valeur provisoire qui ressemble à une vraie.
- **Commits.** Messages courts à l'impératif, par exemple « Ajoute la commande stack au terminal ».

## 13. Dépannage

| Symptôme                                                    | Cause probable et solution                                                                                   |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Un élément n'a pas de style en production, mais en a en dev | Attribut `style="…"` bloqué par la CSP : déplace-le dans une feuille de style. Regarde la console du navigateur. |
| `[github] … réponse 403` ou `401` au build                  | Quota dépassé ou jeton invalide. Vérifie `GITHUB_TOKEN`, ou attends une heure sans jeton.                    |
| Le graphe de contributions n'apparaît pas                   | Pas de `GITHUB_TOKEN` : l'API GraphQL l'exige.                                                               |
| `npm ci` refuse de s'exécuter                               | Version de Node : il faut Node 24 (`nvm use`).                                                               |
| Une fenêtre s'ouvre hors de l'écran                         | Géométrie par défaut trop grande : réduis-la dans `registry.ts` (elle est recadrée, mais reste perfectible). |
| Le bouton CV n'apparaît pas                                 | Le fichier n'est pas exactement au chemin `site.documents.cv` dans `public/` (majuscules comprises).          |
| L'iframe LinkedIn est vide                                  | Le post n'est pas public, ou l'URL n'est pas celle du `src` de l'iframe d'intégration.                      |
