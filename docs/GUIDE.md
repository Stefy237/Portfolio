# Comprendre, construire et modifier le portfolio `laura·os`

**Guide d'initiation à l'usage d'un lecteur sans connaissance préalable des technologies employées**

*Dernière révision : 28 octobre 2026. Ce guide décrit l'état du dépôt à cette date. Pour la référence technique condensée, voir [DOCUMENTATION.md](../DOCUMENTATION.md).*

---

## Avant-propos

### Objet du document

Ce document explique, du plus général au plus particulier, comment le portfolio `laura·os` est conçu, construit et mis en ligne. Il poursuit trois objectifs :

1. **Comprendre** : donner au lecteur les notions nécessaires (Web, Node.js, Astro, Git, GitHub, Cloudflare, Terraform) pour se représenter le fonctionnement du site de bout en bout.
2. **Situer** : relier chaque notion aux fichiers concrets du dépôt, de sorte que le lecteur sache *où* se trouve ce qu'il cherche.
3. **Agir** : fournir des procédures pas à pas pour modifier le contenu, l'apparence ou le comportement du site, puis publier ces modifications sans risque.

### Public visé

Le lecteur visé n'a jamais utilisé Astro, Git, Terraform ou Cloudflare. On suppose seulement qu'il sait utiliser un ordinateur, ouvrir un éditeur de texte (Visual Studio Code, par exemple) et taper une commande dans un terminal en suivant des instructions.

### Organisation

Le document est divisé en dix parties, qui peuvent être lues dans l'ordre ou consultées isolément :

| Partie | Contenu | À lire si… |
|---|---|---|
| I | Notions fondamentales du Web et des outils | vous partez de zéro |
| II | Le site du point de vue du visiteur | vous voulez savoir ce que le code produit |
| III | Astro, le générateur de site | vous voulez comprendre la construction du site |
| IV | Organisation du code et du contenu | vous cherchez un fichier précis |
| V | Procédures de modification | vous voulez changer quelque chose |
| VI | Git et GitHub | vous voulez enregistrer et publier vos modifications |
| VII | Cloudflare | vous voulez comprendre l'hébergement |
| VIII | Terraform | vous voulez comprendre ou modifier l'infrastructure |
| IX | Sécurité et qualité | vous voulez comprendre les garde-fous |
| X | Dépannage | quelque chose ne fonctionne pas |

Des annexes regroupent un glossaire, un mémento des commandes et une bibliographie.

### Conventions typographiques

- `texte en police fixe` : nom de fichier, commande, extrait de code ou valeur à saisir telle quelle.
- **Définition** : introduit un terme technique la première fois qu'il est employé. Tous les termes définis figurent dans le glossaire (annexe A).
- Les blocs précédés de `$` ou présentés comme `bash` sont des commandes à taper dans un terminal, sans le `$`.
- Les chemins de fichiers sont donnés à partir de la racine du projet (le dossier `Portfolio/`).

> **Remarque.** Les encadrés de ce type signalent une subtilité, un piège fréquent ou une bonne pratique.

---

# Partie I — Notions fondamentales

## 1. Le fonctionnement du Web

### 1.1 Client, serveur et protocole HTTP

**Définition.** Le *Web* est un système d'échange de documents entre deux types de programmes : le **client** (le navigateur du visiteur : Firefox, Chrome, Safari) et le **serveur** (un ordinateur, quelque part sur Internet, qui détient les documents).

Lorsqu'un visiteur saisit `https://laura-nguegang.pages.dev`, le navigateur envoie au serveur une **requête HTTP** (« donne-moi la page `/` »). Le serveur répond par une **réponse HTTP** composée :

- d'un **code d'état** : `200` (succès), `404` (introuvable), `522` ou `523` (le serveur intermédiaire n'a pas pu joindre l'origine) ;
- d'**en-têtes** (*headers*) : des métadonnées comme le type du document ou des consignes de sécurité ;
- d'un **corps** : le document lui-même.

**HTTPS** est la variante chiffrée de HTTP. Le chiffrement empêche un tiers (sur un Wi-Fi public, par exemple) de lire ou de modifier les échanges.

### 1.2 Les trois langages d'une page Web

Toute page Web repose sur trois langages complémentaires :

| Langage | Rôle | Analogie |
|---|---|---|
| **HTML** (*HyperText Markup Language*) | la structure et le contenu : titres, paragraphes, liens, images | le gros œuvre d'une maison |
| **CSS** (*Cascading Style Sheets*) | la présentation : couleurs, polices, disposition, animations | la décoration |
| **JavaScript** (JS) | le comportement : réactions aux clics, fenêtres déplaçables, terminal | l'électricité et la domotique |

Exemple minimal :

```html
<h1 class="titre">Bonjour</h1>          <!-- HTML : un titre -->
<style> .titre { color: teal; } </style> <!-- CSS : le titre est bleu-vert -->
<script> alert('Salut'); </script>       <!-- JS : affiche une boîte de dialogue -->
```

### 1.3 URL, nom de domaine et DNS

**Définition.** Une **URL** (*Uniform Resource Locator*) est l'adresse d'une ressource : `https://laura-nguegang.pages.dev/simple#projets` se décompose en :

- `https://` : le protocole ;
- `laura-nguegang.pages.dev` : le **nom de domaine** (ou nom d'hôte) ;
- `/simple` : le **chemin** de la page ;
- `#projets` : le **fragment**, qui désigne une partie de la page. Il n'est jamais envoyé au serveur ; seul le navigateur l'utilise. Le site s'en sert pour ouvrir directement une fenêtre (`/#homelab`).

Un ordinateur ne comprend que des adresses numériques (*adresses IP*, comme `104.21.3.17`). Le **DNS** (*Domain Name System*) est l'annuaire mondial qui traduit un nom de domaine en adresse IP. Un **enregistrement DNS** est une ligne de cet annuaire. Le type **CNAME** signifie « ce nom est un alias de tel autre nom » ; c'est celui qu'utilisera le futur domaine `laura-nguegang.fr` pour pointer vers `laura-nguegang.pages.dev`.

### 1.4 Site statique et site dynamique

**Définition.** Un site est **dynamique** lorsque le serveur fabrique la page à chaque visite (en interrogeant une base de données, par exemple). Il est **statique** lorsque les pages sont fabriquées *une fois pour toutes, à l'avance*, puis simplement distribuées telles quelles.

Le portfolio est **entièrement statique**. Cela présente plusieurs avantages :

- **rapidité** : le serveur n'a rien à calculer, il envoie un fichier ;
- **sécurité** : il n'y a ni base de données à pirater, ni code serveur à exploiter ;
- **coût** : l'hébergement de fichiers statiques est gratuit chez de nombreux fournisseurs, dont Cloudflare ;
- **simplicité** : le site entier est un dossier de fichiers (`dist/`).

L'étape qui transforme le code source en pages prêtes à distribuer s'appelle la **construction** (*build*). Elle est réalisée par un **générateur de site statique** : ici, **Astro** (partie III).

### 1.5 CDN

**Définition.** Un **CDN** (*Content Delivery Network*) est un réseau de serveurs répartis dans le monde entier qui conservent une copie du site. Le visiteur est servi par le serveur le plus proche de lui, ce qui réduit le temps de chargement. Cloudflare est l'un des principaux CDN ; c'est lui qui distribue le portfolio (partie VII).

## 2. Les outils du développeur

### 2.1 Le terminal

**Définition.** Le **terminal** (ou *console*, *invite de commandes*) est un programme qui permet de piloter l'ordinateur en tapant des commandes texte. Sous Linux, le programme qui interprète ces commandes s'appelle le **shell** (ici `zsh`).

Commandes de base utiles :

| Commande | Effet |
|---|---|
| `pwd` | affiche le dossier courant |
| `ls` | liste le contenu du dossier courant |
| `cd Portfolio` | entre dans le dossier `Portfolio` |
| `cd ..` | remonte d'un niveau |
| `Ctrl + C` | interrompt la commande en cours (par exemple le serveur de développement) |

> **Remarque.** Le terminal de démonstration affiché *sur le site* imite ces commandes, mais n'exécute rien : c'est un programme JavaScript qui simule un shell (§ 17.3).

### 2.2 Node.js, npm et nvm

**Définition.** **Node.js** est un programme qui exécute du JavaScript *en dehors* d'un navigateur, directement sur l'ordinateur. Astro, les tests et les outils de vérification sont écrits en JavaScript : ils ont donc besoin de Node.js.

**Définition.** **npm** (*Node Package Manager*) est l'outil, livré avec Node.js, qui installe les **paquets** (bibliothèques de code écrites par d'autres) dont le projet dépend, et qui lance les **scripts** du projet.

**Définition.** **nvm** (*Node Version Manager*) permet d'installer et d'utiliser plusieurs versions de Node.js. Le projet exige **Node 24** ; cette version est inscrite dans le fichier `.nvmrc`. La commande `nvm use`, lancée dans le dossier du projet, lit ce fichier et active la bonne version.

> **Remarque.** Sur la machine de développement, le Node.js du système est en version 18, trop ancienne pour Astro 7. **Il faut donc taper `nvm use` dans chaque nouveau terminal avant toute commande `npm`.** Sinon, Astro refuse de démarrer.

### 2.3 `package.json` et `package-lock.json`

Le fichier `package.json` est la carte d'identité du projet pour npm. On y trouve :

```json
"scripts": {
  "dev": "astro dev",          // serveur de développement
  "build": "astro build",      // construction du site dans dist/
  "preview": "astro preview",  // aperçu local du site construit
  "check": "astro check",      // vérification des types
  "test": "vitest run",        // tests automatiques
  "test:watch": "vitest"       // tests relancés à chaque modification
},
"dependencies": { ... },       // paquets nécessaires au site
"devDependencies": { ... }     // paquets nécessaires seulement au développement
```

Une commande `npm run dev` exécute donc `astro dev`.

Le fichier `package-lock.json` enregistre la **version exacte** de chaque paquet installé, y compris les paquets dont dépendent vos paquets. Il garantit que l'ordinateur de développement et les serveurs de GitHub installent rigoureusement les mêmes versions. **On ne le modifie jamais à la main** ; npm le met à jour.

Les paquets installés sont placés dans le dossier `node_modules/`. Ce dossier est volumineux, se régénère à volonté (`npm install` ou `npm ci`) et n'est jamais enregistré dans Git.

### 2.4 TypeScript

**Définition.** **TypeScript** est du JavaScript enrichi de **types** : on y déclare la forme attendue des données. Par exemple, dans `src/data/projects.ts` :

```ts
export interface Project {
  slug: string;          // une chaîne de caractères
  name: string;
  stack: string[];       // une liste de chaînes
  repo: string | null;   // une chaîne, ou « rien » (null)
  featured: boolean;     // vrai ou faux
}
```

Si l'on oublie un champ ou si l'on met un nombre là où une chaîne est attendue, la commande `npm run check` signale l'erreur **avant** la mise en ligne. Pour un novice, c'est un filet de sécurité précieux : l'éditeur souligne en rouge les erreurs au moment même de la saisie.

Notions de syntaxe utiles pour modifier les données :

| Écriture | Signification |
|---|---|
| `'texte'` ou `"texte"` | une chaîne de caractères. Si le texte contient une apostrophe, utilisez les guillemets doubles (`"l'équipe"`) ou échappez-la (`'l\'équipe'`) |
| `'a' + 'b'` | concaténation (sert à couper une longue phrase sur plusieurs lignes) |
| `[ 'a', 'b' ]` | une liste (tableau) |
| `{ nom: 'x', age: 3 }` | un objet (ensemble de champs nommés) |
| `null` | absence de valeur |
| `// commentaire` ou `/** commentaire */` | texte ignoré par l'ordinateur, destiné au lecteur |
| `export const x = …` | rend `x` utilisable par d'autres fichiers |
| `import { x } from './fichier'` | utilise le `x` exporté par un autre fichier |

> **Remarque.** Chaque élément d'une liste ou d'un objet est suivi d'une virgule. Une virgule oubliée est l'erreur la plus fréquente ; `npm run check` et l'éditeur la signalent immédiatement.

### 2.5 Git

**Définition.** **Git** est un **logiciel de gestion de versions** : il enregistre l'historique de toutes les modifications d'un projet, permet de revenir en arrière et de travailler sur plusieurs versions en parallèle. Il est présenté en détail dans la partie VI.

---

# Partie II — Le site du point de vue du visiteur

Avant d'étudier le code, il convient de décrire ce qu'il produit.

## 3. Les deux présentations du site

Le site propose deux présentations du même contenu.

### 3.1 Le bureau (`/`)

La page d'accueil imite le **bureau d'un système d'exploitation**, baptisé `laura·os` :

- une **barre de menu** en haut (nom, statut de disponibilité, lien « Version simple », bouton de thème clair ou sombre) ;
- des **icônes** sur le bureau, une par application ;
- un **dock** en bas (barre de raccourcis) avec le bouton « Mon CV » ;
- un **post-it** « Recruteur pressé ? » qui renvoie vers la version simple ;
- des **fenêtres** que l'on ouvre, déplace, agrandit et ferme.

Chaque « application » est une fenêtre :

| Application | Contenu | Présentation inspirée de |
|---|---|---|
| À propos | présentation, statut, liens | — |
| Projets | projets mis en avant, graphe de contributions GitHub | un profil GitHub |
| Parcours | expériences, formation, compétences, post intégré | un profil LinkedIn |
| Terminal | shell de démonstration (23 commandes) | un vrai terminal |
| Mail | rédaction d'un message pré-adressé | un « Nouveau message » de webmail |
| Homelab | feuille de route et services du laboratoire personnel | — |
| Freelance | offres, compétences, contact | un profil Malt |
| Dossier | CV, lettre, vidéo | un explorateur de fichiers |
| Certifications | certifications et dates visées | — |
| Recommandations | témoignages (masquée tant qu'il n'y en a pas) | — |
| Marché | salaires par région (masquée tant que les données manquent) | — |
| Questions | réponses aux questions d'entretien | — |

**Sur ordinateur**, le terminal s'ouvre automatiquement au chargement et tape la commande `fastfetch`, qui résume le profil : le visiteur comprend le principe du site en quelques secondes.

**Sur téléphone** (écran de moins de 768 pixels de large), le bureau devient un écran d'accueil : carte de présentation avec bouton CV, grille d'icônes, post-it discret en bas à droite des icônes, dock réduit à quatre applications. Aucune fenêtre ne s'ouvre au chargement. Les fenêtres s'affichent sous forme de cartes encadrées, légèrement décalées lorsqu'on en empile plusieurs ; le bouton « agrandir » les passe en plein écran.

### 3.2 La version simple (`/simple`)

La version simple présente tout le contenu sur une seule page, sous forme éditoriale : introduction avec photo, trois faits marquants, parcours, projets, homelab, certifications, freelance, questions. Elle fonctionne **sans JavaScript**, s'imprime proprement et constitue la solution de repli : si JavaScript est désactivé, les icônes du bureau deviennent de simples liens vers les sections correspondantes de cette page.

### 3.3 Les autres adresses

| Adresse | Contenu |
|---|---|
| `/404.html` | page d'erreur « introuvable », dans l'esprit du terminal |
| `/robots.txt` | consignes pour les moteurs de recherche |
| `/sitemap-index.xml` | plan du site pour les moteurs de recherche |
| `/documents/CV_Laura_Nguegang.pdf` | le CV |
| `/images/…` | photo, bannière, image de partage |

---

# Partie III — Astro, le générateur de site

## 4. Présentation d'Astro

### 4.1 Définition et philosophie

**Astro** est un générateur de site statique. Il lit des fichiers source (composants `.astro`, données TypeScript, feuilles de style) et produit un dossier de fichiers HTML, CSS et JavaScript prêts à être distribués.

Sa philosophie tient en une phrase : **ne livrer au navigateur que le strict nécessaire**. Par défaut, une page Astro ne contient *aucun* JavaScript ; on n'en ajoute que là où une interaction l'exige (ici : le gestionnaire de fenêtres, le terminal, le thème et la fenêtre Mail). Il en résulte des pages légères et rapides.

Le projet utilise **Astro 7** (`"astro": "^7.4.2"` dans `package.json`).

### 4.2 Les trois modes de fonctionnement

| Commande | Mode | Usage |
|---|---|---|
| `npm run dev` | **développement** | Lance un serveur local sur `http://localhost:4321`. Chaque modification enregistrée est visible immédiatement dans le navigateur, sans recharger. Les éléments « à compléter » y sont signalés par des encadrés orange en pointillés. |
| `npm run build` | **construction** | Produit le site définitif dans `dist/`. Les éléments « à compléter » disparaissent, et la liste de ce qui manque s'affiche dans le terminal. |
| `npm run preview` | **aperçu** | Sert le contenu de `dist/` sur `http://localhost:4321`, pour voir exactement ce qui sera mis en ligne. |

> **Remarque.** Certaines différences n'apparaissent qu'après la construction : fenêtres masquées en production (`publish: false`), encadrés « à compléter » supprimés, politique de sécurité appliquée. **Avant de publier une modification importante, vérifiez-la avec `npm run build && npm run preview`.**

Pour voir le site sur un téléphone pendant le développement, lancez `npm run dev -- --host`, puis ouvrez sur le téléphone l'adresse affichée (`http://192.168.x.x:4321`). Le téléphone doit être connecté au même réseau Wi-Fi que l'ordinateur.

### 4.3 Le processus de construction

```
 Sources                              Construction (npm run build)             Résultat : dist/
 ───────                              ────────────────────────────             ────────────────
 src/config/site.ts   ─┐
 src/data/*.ts        ─┤                                                   ┌─► index.html
 src/components/*.astro┤──► Astro exécute le code des composants ─────────┼─► simple/index.html
 src/pages/*.astro    ─┤    (y compris les appels à l'API GitHub)          ├─► 404.html
 src/styles/*.css     ─┤                                                   ├─► robots.txt, sitemap-*.xml
 src/scripts/*.ts     ─┘──► Vite regroupe et optimise CSS et JS ──────────┼─► _astro/*.css, *.js
 public/*             ─────► copié tel quel ──────────────────────────────┴─► images/, documents/, _headers…
```

Points essentiels :

- **Le code des composants s'exécute une seule fois, au moment de la construction**, sur l'ordinateur ou sur le serveur de GitHub, et jamais dans le navigateur du visiteur. C'est pourquoi le site peut interroger l'API GitHub avec un jeton secret sans jamais l'exposer (§ 12).
- **Vite** est l'outil interne d'Astro qui regroupe, minifie et nomme les fichiers CSS et JavaScript. Leur nom contient une empreinte (`index.Bx3k9.css`) qui change à chaque modification ; le navigateur peut donc les garder en cache indéfiniment sans risque de servir une version périmée.
- **Le dossier `public/`** est copié sans transformation. On y place ce qui doit être servi tel quel : images, PDF, favicon, `_headers`.

## 5. Anatomie d'un composant `.astro`

### 5.1 Structure générale

**Définition.** Un **composant** est un morceau d'interface réutilisable, écrit dans un fichier `.astro`. Un fichier `.astro` comporte jusqu'à quatre parties :

```astro
---
// 1. Le « frontmatter », entre les deux lignes de tirets.
//    Du TypeScript exécuté AU BUILD : imports, calculs, lecture des données.
import { faq } from '../../data/faq';
const items = faq.filter((q) => q.answer !== '');
---

<!-- 2. Le gabarit (template) : du HTML enrichi d'expressions entre accolades. -->
<ul>
  {items.map((q) => <li>{q.question}</li>)}
</ul>

<style>
  /* 3. Des styles limités à ce composant (ils ne débordent pas ailleurs). */
  ul { padding: 0; }
</style>

<script>
  // 4. Un script exécuté DANS LE NAVIGATEUR (facultatif).
  console.log('chargé');
</script>
```

### 5.2 Les expressions du gabarit

Entre accolades `{ … }`, on peut insérer n'importe quelle expression TypeScript :

| Écriture | Effet |
|---|---|
| `{site.name}` | insère la valeur |
| `{liste.map((x) => <li>{x}</li>)}` | répète un élément pour chaque entrée d'une liste |
| `{condition && <p>…</p>}` | affiche l'élément seulement si la condition est vraie |
| `{condition ? <A /> : <B />}` | affiche A si la condition est vraie, B sinon |
| `class:list={['a', { b: actif }]}` | classe `a` toujours, classe `b` seulement si `actif` est vrai |

### 5.3 Exemple commenté : la fenêtre « Questions »

Le fichier `src/components/apps/FaqApp.astro` est l'un des plus simples du projet :

```astro
---
import { faq } from '../../data/faq';      // les questions et réponses
import Todo from '../ui/Todo.astro';         // l'encadré « à compléter »

// En développement : toutes les questions. En production : seulement celles qui ont une réponse.
const items = faq.filter((q) => import.meta.env.DEV || q.answer.trim() !== '');
---

<div class="app">
  <p class="muted">Mes réponses aux questions qu'on me pose souvent…</p>
  <div>
    {
      items.map((q, i) => (
        <details class="qa" open={i === 0}>      <!-- la première est dépliée -->
          <summary>{q.question}</summary>
          {q.answer ? <p>{q.answer}</p> : <p><Todo label="ta réponse" /></p>}
        </details>
      ))
    }
  </div>
</div>
```

On y retrouve les trois idées-forces du projet :

1. **le contenu vient d'un fichier de données** (`src/data/faq.ts`), pas du composant ;
2. **un contenu manquant est signalé en développement** (`<Todo>`) **et masqué en production** (`import.meta.env.DEV`) ;
3. **le HTML produit est simple et accessible** (`<details>` et `<summary>` sont des éléments natifs, utilisables au clavier).

### 5.4 Les propriétés (*props*)

Un composant peut recevoir des paramètres, appelés **propriétés**. Par exemple, `Window.astro` reçoit l'application à afficher :

```astro
---
interface Props {
  app: AppMeta;
  variant?: 'default' | 'terminal' | 'flush';   // le « ? » signifie facultatif
}
const { app, variant = 'default' } = Astro.props;
---
```

et `index.astro` l'utilise ainsi : `<Window app={app} variant="terminal">…</Window>`. Ce qui est placé entre les balises ouvrante et fermante est inséré à l'emplacement de la balise `<slot />` du composant.

## 6. Le routage : des fichiers aux adresses

**Définition.** Le **routage** est la correspondance entre une adresse (URL) et la page affichée. Astro pratique le **routage par fichiers** : chaque fichier du dossier `src/pages/` devient une page.

| Fichier | Adresse produite | Rôle |
|---|---|---|
| `src/pages/index.astro` | `/` | le bureau |
| `src/pages/simple.astro` | `/simple` | la version simple |
| `src/pages/404.astro` | `/404.html` | la page d'erreur |
| `src/pages/robots.txt.ts` | `/robots.txt` | un **point de terminaison** (*endpoint*) : un fichier `.ts` qui produit un fichier texte au lieu d'une page HTML |

Il n'existe **que ces pages**. Les « onglets » du bureau ne sont pas des pages mais des **fenêtres**, toutes présentes dans le HTML de `/` et masquées par défaut (attribut `hidden`). Le gestionnaire de fenêtres (§ 17.2) les affiche à la demande. Une adresse comme `/#projets` charge la page `/`, puis le script lit le fragment `#projets` et ouvre la fenêtre correspondante.

Pour **créer une nouvelle page**, il suffit d'ajouter un fichier : `src/pages/contact.astro` produirait `/contact`. Le plan du site (`sitemap`) l'inclurait automatiquement.

## 7. La mise en page commune : `Base.astro`

**Définition.** Un **gabarit de mise en page** (*layout*) est un composant qui enveloppe toutes les pages et contient ce qui leur est commun. Le projet en possède un seul : `src/layouts/Base.astro`.

Il produit l'en-tête HTML (`<head>`) de chaque page :

- encodage et adaptation aux écrans mobiles (`viewport`) ;
- **titre** et **description** de la page (affichés dans les résultats de recherche) ;
- **URL canonique** (l'adresse officielle de la page, construite à partir de `SITE_URL`) ;
- **métadonnées Open Graph** (`og:title`, `og:image`…) : elles déterminent l'aperçu affiché lorsqu'on partage le lien sur LinkedIn ou dans une messagerie. L'image de partage est `public/images/og.jpg` (1200 × 630 pixels) ;
- chargement des polices et des feuilles de style globales ;
- le script `public/scripts/theme-init.js`, qui applique le thème clair ou sombre avant l'affichage pour éviter un flash.

## 8. La configuration : `astro.config.mjs`

Ce fichier règle le comportement d'Astro :

```js
const SITE_URL = process.env.SITE_URL || 'https://laura-nguegang.pages.dev';

export default defineConfig({
  site: SITE_URL,                       // adresse publique : liens canoniques, Open Graph, sitemap
  trailingSlash: 'ignore',              // /simple et /simple/ sont acceptés
  integrations: [sitemap()],            // génère sitemap-index.xml
  markdown: { syntaxHighlight: false }, // pas de coloration de code (aucun Markdown sur le site)
  devToolbar: { enabled: false },       // la barre d'outils d'Astro masquerait le dock
  build: { inlineStylesheets: 'never' },// CSS en fichiers séparés, mis en cache
  security: { csp: { directives: [ … ] } }, // politique de sécurité (§ 30.1)
});
```

**`process.env.SITE_URL`** désigne une **variable d'environnement** : une valeur fournie de l'extérieur au moment de la construction. En local, elle est lue dans le fichier `.env` ; sur GitHub, elle est fournie par le workflow (§ 23.4). L'opérateur `||` fournit une valeur par défaut si la variable est absente *ou vide*.

> **Remarque.** Le jour où un nom de domaine sera acheté, il suffira de définir `SITE_URL=https://laura-nguegang.fr` (variable de dépôt sur GitHub, et dans `.env`) ; toutes les adresses absolues du site suivront.

## 9. Les variables d'environnement et le fichier `.env`

Le fichier `.env` (à la racine) contient des valeurs propres à la machine, dont certaines sont **secrètes** :

```
GITHUB_TOKEN=github_pat_…     # jeton GitHub en lecture seule (graphe de contributions)
SITE_URL=https://laura-nguegang.pages.dev
```

Règles impératives :

1. **`.env` n'est jamais enregistré dans Git** : il figure dans `.gitignore` (§ 22.3). Le fichier `.env.example`, lui, est enregistré : il documente les variables attendues, sans valeur secrète.
2. **Un jeton ne doit jamais apparaître dans le code**, dans un message, une capture d'écran ou une conversation. S'il a été exposé, il faut le **révoquer** et en créer un nouveau.
3. Les variables de `.env` ne sont lues qu'**au moment de la construction**, côté Node.js. Astro n'envoie au navigateur que les variables dont le nom commence par `PUBLIC_` ; aucune variable du projet ne porte ce préfixe.

## 10. Les styles

### 10.1 Organisation des feuilles de style

| Fichier | Contenu |
|---|---|
| `src/styles/tokens.css` | les **variables de conception** (*design tokens*) : couleurs, polices, rayons, ombres, pour le thème clair et le thème sombre |
| `src/styles/global.css` | styles de base communs (corps du texte, liens, boutons, pastilles) |
| `src/styles/os.css` | le bureau : barre de menu, icônes, fenêtres, dock, post-it, adaptation au téléphone |
| `src/styles/apps.css` | le contenu des fenêtres simples (blocs, lignes, questions) |
| `src/styles/platforms.css` | les fenêtres « plateforme » : préfixes `li__` (Parcours), `gh__`/`repo__` (Projets), `malt__` (Freelance), `gm__` (Mail) |
| `src/styles/simple.css` | la version simple et sa mise en page d'impression |

### 10.2 Les variables CSS et les thèmes

**Définition.** Une **variable CSS** (ou *propriété personnalisée*) est une valeur nommée, déclarée une fois et réutilisée partout :

```css
:root { --accent: #0f766e; }          /* déclaration (thème clair) */
.bouton { background: var(--accent); } /* utilisation */
```

Le thème sombre redéfinit les mêmes variables avec d'autres valeurs. Dans `tokens.css`, il est déclaré **deux fois** :

- sous `@media (prefers-color-scheme: dark)`, qui suit le réglage du système d'exploitation du visiteur ;
- sous `:root[data-theme='dark']`, qui s'applique quand le visiteur a choisi explicitement le thème sombre (bouton ou commande `theme sombre`).

Ainsi, **pour changer une couleur du site, on modifie une seule ligne de `tokens.css`** (dans chacun des trois blocs : clair, sombre système, sombre explicite), et tout le site suit.

### 10.3 Les requêtes média : adapter au téléphone

**Définition.** Une **requête média** (*media query*) applique des styles sous condition. Tout le comportement « téléphone » est regroupé dans `src/styles/os.css`, dans le bloc :

```css
@media (max-width: 767px) {
  /* styles appliqués seulement aux écrans de moins de 768 px de large */
}
```

Les fenêtres utilisent en outre des **requêtes de conteneur** (`@container`) : leur contenu s'adapte à la largeur *de la fenêtre* et non à celle de l'écran, ce qui permet à une fenêtre étroite sur ordinateur de se réorganiser comme sur un téléphone.

### 10.4 Une règle à ne jamais enfreindre : pas d'attribut `style`

```html
<p style="color: red">…</p>    <!-- INTERDIT -->
```

La politique de sécurité du site (§ 30.1) bloque les styles écrits directement dans le HTML. Un tel élément s'afficherait correctement en développement, puis **perdrait son style une fois en ligne**. On place toujours les styles dans une balise `<style>` de composant ou dans un fichier de `src/styles/`. (Les modifications faites par un script, comme `element.style.left = '10px'`, restent autorisées.)

## 11. Le JavaScript exécuté dans le navigateur

Quatre scripts donnent vie au site. Ils sont écrits en TypeScript dans `src/scripts/`, importés depuis une balise `<script>` d'une page, puis regroupés par Vite au moment de la construction.

| Script | Rôle |
|---|---|
| `public/scripts/theme-init.js` | applique le thème **avant** l'affichage (fichier externe, chargé tel quel) |
| `src/scripts/theme.ts` | bouton de thème, mémorisation du choix, suivi du système |
| `src/scripts/window-manager.ts` | ouverture, placement, déplacement, agrandissement et fermeture des fenêtres |
| `src/scripts/terminal/` | le shell de démonstration |
| `src/scripts/mail.ts` et `mail-core.ts` | la fenêtre Mail : modèles, copie de l'adresse, lien `mailto:` |

Leur fonctionnement est décrit au § 17.

## 12. La récupération des données GitHub au build

Le fichier `src/lib/github.ts` interroge l'**API** de GitHub (une interface qui permet à un programme de demander des données à GitHub) :

- **`getRepo('Stefy237/Mysh')`** obtient le langage principal, le nombre d'étoiles et la date de dernière mise à jour d'un dépôt. Cette API est publique et fonctionne sans jeton, dans la limite de 60 requêtes par heure.
- **`getContributions('Stefy237')`** obtient le calendrier de contributions affiché dans la fenêtre Projets. Cette API (*GraphQL*) **exige un jeton** : la variable `GITHUB_TOKEN`.

Ces appels ont lieu **pendant la construction** ; le visiteur reçoit le résultat déjà intégré au HTML. En cas d'échec (pas de réseau, jeton absent ou expiré), la fonction renvoie `null`, affiche un avertissement `[github]` dans le terminal, et le site se construit quand même, sans l'élément concerné.

> **Conséquence pratique.** Le graphe de contributions reflète l'état de GitHub *au moment de la dernière construction*. Pour le rafraîchir, il faut reconstruire et redéployer le site (un simple « Run workflow » sur GitHub suffit, § 23.4).

---

# Partie IV — Organisation du code et du contenu

## 13. Cartographie du dépôt

```
Portfolio/
├── astro.config.mjs          Configuration d'Astro (adresse, sécurité, sitemap)
├── package.json              Dépendances et scripts npm
├── package-lock.json         Versions exactes des dépendances (ne pas modifier)
├── tsconfig.json             Configuration de TypeScript
├── vitest.config.ts          Configuration des tests
├── .nvmrc                    Version de Node.js exigée (24)
├── .env                      Variables locales et secrètes (jamais dans Git)
├── .env.example              Modèle de .env (dans Git)
├── .gitignore                Fichiers que Git doit ignorer
│
├── README.md                 Présentation courte du projet
├── DOCUMENTATION.md          Référence technique condensée
├── GUIDE.md                  Le présent guide
│
├── public/                   Copié tel quel dans le site
│   ├── _headers              En-têtes HTTP de sécurité (lus par Cloudflare)
│   ├── favicon.svg           Icône de l'onglet
│   ├── documents/            CV et lettre en PDF
│   ├── images/               photo.webp, banniere.webp, og.jpg
│   └── scripts/theme-init.js Thème appliqué avant l'affichage
│
├── src/
│   ├── config/site.ts        ★ Identité, liens, documents, disponibilité
│   ├── data/                 ★ Tout le contenu éditorial
│   │   ├── parcours.ts           expériences, formation, compétences
│   │   ├── projets.ts            projets
│   │   ├── certifications.ts     certifications
│   │   ├── faq.ts                questions d'entretien
│   │   ├── freelance.ts          offres freelance
│   │   ├── homelab.ts            feuille de route, services, liens
│   │   ├── mail.ts               modèles de messages
│   │   ├── marche.ts             salaires par région
│   │   └── recommandations.ts    témoignages
│   ├── apps/registry.ts      ★ Liste des fenêtres et de leurs réglages
│   ├── pages/                Les pages (routage par fichiers)
│   ├── layouts/Base.astro    En-tête HTML commun
│   ├── components/
│   │   ├── os/               Bureau : MenuBar, Window, Dock, ThemeToggle
│   │   ├── apps/             Contenu de chaque fenêtre (XxxApp.astro)
│   │   ├── embeds/           Graphe GitHub, post LinkedIn
│   │   ├── simple/           Éléments de la version simple
│   │   └── ui/               Briques communes : Icon, Avatar, Todo
│   ├── lib/
│   │   ├── content.ts        Ce qui est prêt / ce qui manque
│   │   ├── files.ts          Vérifie qu'un fichier existe dans public/
│   │   └── github.ts         Appels à l'API GitHub (au build)
│   ├── scripts/              JavaScript du navigateur (fenêtres, terminal, thème, mail)
│   └── styles/               Feuilles de style
│
├── tests/                    Tests automatiques (Vitest)
├── infra/terraform/          Description de l'infrastructure Cloudflare
└── .github/
    ├── workflows/ci.yml      Vérifications automatiques à chaque envoi
    ├── workflows/deploy.yml  Mise en ligne automatique
    └── dependabot.yml        Mises à jour automatiques des dépendances
```

Les fichiers marqués ★ sont ceux que l'on modifie le plus souvent. **Dans la grande majorité des cas, modifier le contenu du site ne demande de toucher qu'à `src/config/site.ts` et `src/data/`.**

Dossiers générés, à ne pas modifier : `node_modules/` (dépendances), `dist/` (site construit), `.astro/` (fichiers internes d'Astro), `infra/terraform/.terraform/` (fournisseurs Terraform téléchargés).

## 14. Le principe de séparation du contenu et du code

Le projet applique une règle stricte : **les textes personnels ne sont pas écrits dans les composants, mais dans des fichiers de données**. Un même fichier de données alimente plusieurs présentations :

```
src/data/projects.ts ──┬──► fenêtre Projets (ProjectsApp.astro)
                      ├──► version simple (simple.astro)
                      └──► terminal (commande « projets », fichiers ~/projets/*.md)
```

Modifier un projet dans `projets.ts` met donc à jour les trois présentations à la fois, sans risque d'incohérence.

## 15. Le mécanisme « prêt à publier / à compléter »

Le site est conçu pour **ne jamais publier de contenu provisoire**. Trois mécanismes y concourent.

### 15.1 La convention des valeurs vides

Dans `site.ts` et `src/data/`, une valeur vide signifie « pas encore renseigné » :

| Valeur | Signification |
|---|---|
| `''` (chaîne vide) | texte non renseigné |
| `null` | valeur absente (date, lien…) |
| `[]` (liste vide) | aucune entrée |

> **Règle.** Ne jamais écrire de valeur provisoire ressemblant à une vraie (« À venir », « lorem ipsum », « 2026 ? ») : elle serait publiée. Laissez la valeur vide.

### 15.2 Le composant `<Todo>`

`src/components/ui/Todo.astro` affiche un encadré orange en pointillés « À compléter » **uniquement en développement** (`import.meta.env.DEV`). En production, il ne produit rien.

### 15.3 Les indicateurs `ready` et la liste `missingItems()`

`src/lib/content.ts` calcule, au moment de la construction :

- l'objet **`ready`**, qui indique ce qui est prêt. Par exemple, `ready.cv` vaut vrai si le fichier `public/documents/CV_Laura_Nguegang.pdf` existe, et `ready.recommendations` si la liste des recommandations n'est pas vide ;
- la fonction **`missingItems()`**, qui dresse la liste lisible de tout ce qui manque, avec le fichier à modifier.

Cette liste s'affiche dans le terminal à chaque `npm run build` :

```
[contenu] 5 élément(s) à compléter (masqués en production) :
  - Lettre → déposer le PDF dans public/documents/lettre-de-motivation.pdf
  - Vidéo → src/config/site.ts (videoYoutubeId)
  …
```

Les fenêtres dont le contenu dépend d'un indicateur (`publish: ready.recommendations`, par exemple) disparaissent automatiquement du site tant que leur contenu manque, et apparaissent dès qu'il est fourni.

## 16. Le registre des applications

Le fichier `src/apps/registry.ts` décrit chaque fenêtre par un objet :

```ts
{
  id: 'freelance',                    // identifiant : /#freelance, « open freelance »
  label: 'Freelance',                 // nom court : icône, dock
  windowTitle: 'malt.fr/profile/…',   // texte de la barre de titre
  icon: 'tools',                      // icône (liste dans src/components/ui/icons.ts)
  desktop: true,                      // icône sur le bureau
  dock: true,                         // bouton dans le dock
  openOnStart: false,                 // ouverte au chargement (ordinateur uniquement)
  flush: true,                        // contenu sans marge intérieure
  geometry: { x: 440, y: 110, w: 640, h: 560 }, // position et taille pour un écran 1440×900
  publish: true,                      // publiée en production
},
```

| Champ | Effet d'une modification |
|---|---|
| `desktop: false` | retire l'icône du bureau (la fenêtre reste accessible par le dock et le terminal) |
| `dock: false` | retire le bouton du dock. Sur téléphone, seuls les quatre premiers boutons du dock restent visibles : **l'ordre des entrées compte** |
| `openOnStart: true` | ouvre la fenêtre au chargement, sur ordinateur |
| `geometry` | position (`x`, `y`) et taille (`w`, `h`) par défaut, en pixels, pour un écran de référence de 1440 × 900 ; elles sont mises à l'échelle sur les autres écrans |
| `publish: false` | **masque entièrement la fenêtre en production** : bureau, dock, terminal (`open`, `ls`) |

La fonction `visibleApps()` renvoie toutes les applications en développement, et seulement celles dont `publish` vaut `true` en production.

## 17. Le fonctionnement interne de l'interface

### 17.1 La fenêtre (`Window.astro`)

Chaque fenêtre est une balise `<section role="dialog" hidden>` contenant une barre de titre (boutons « agrandir » et « fermer ») et une zone de contenu. Sa géométrie par défaut est transmise par des attributs `data-x`, `data-y`, `data-w`, `data-h`, jamais par un attribut `style` (§ 10.4).

### 17.2 Le gestionnaire de fenêtres (`window-manager.ts`)

Ce script :

- **intercepte les clics** sur tout élément portant l'attribut `data-open="<id>"` (icônes, dock, liens internes) et ouvre la fenêtre correspondante. Ces éléments sont de vrais liens vers `/simple#<id>` : sans JavaScript, ils mènent à la version simple ;
- **place** la fenêtre à sa première ouverture selon sa géométrie, réduite si l'écran est petit ;
- **passe au premier plan** la fenêtre cliquée ;
- permet de la **déplacer** par sa barre de titre et de l'**agrandir** (bouton ou double-clic) ;
- la **ferme** au bouton, à la touche Échap ou par la commande `exit` du terminal, et rend le focus clavier à l'élément qui l'avait ouverte ;
- **lit le fragment de l'adresse** : `/#homelab` ouvre directement la fenêtre Homelab ;
- **sur téléphone**, n'ouvre aucune fenêtre au démarrage, désactive le déplacement et applique un décalage en cascade (variable CSS `--cascade`) aux fenêtres empilées.

Le terminal commande les fenêtres sans dépendre du gestionnaire : il émet des **événements** `os:open` et `os:close`, que le gestionnaire écoute.

### 17.3 Le terminal de démonstration

| Fichier | Rôle |
|---|---|
| `components/apps/TerminalApp.astro` | balisage, et données du site intégrées à la page sous forme de JSON au build |
| `scripts/terminal/types.ts` | types partagés |
| `scripts/terminal/fs.ts` | système de fichiers virtuel en lecture seule (`~/projets/`, `visite.md`…) |
| `scripts/terminal/commands.ts` | les commandes, écrites comme des **fonctions pures** : elles reçoivent une entrée et renvoient des lignes à afficher, sans toucher à la page, ce qui les rend testables |
| `scripts/terminal/shell.ts` | affichage, saisie, historique (flèches ↑ ↓), autocomplétion (Tab) |

Commandes disponibles : `help`, `whoami`, `pwd`, `ls`, `cd`, `cat`, `open`, `projets`, `certifs`, `contact`, `cv`, `theme`, `fastfetch`, `history`, `date`, `echo`, `uname`, `man`, `clear`, `exit`, ainsi que trois clins d'œil (`sudo`, `rm`, `ssh`).

Le terminal **n'exécute rien de réel** : tout se passe dans le navigateur, sur des données intégrées à la page. Le texte est inséré avec `textContent` (jamais `innerHTML`), si bien qu'aucune saisie ne peut injecter de code dans la page.

### 17.4 La fenêtre Mail

Le bouton « Envoyer » construit un lien `mailto:` contenant le destinataire (`site.email`), l'objet et le message, puis ouvre la messagerie du visiteur. Aucun serveur n'intervient. Les modèles de messages proviennent de `src/data/mail.ts`. Tant que `site.email` est vide, la fenêtre n'est pas publiée.

---

# Partie V — Procédures de modification

Cette partie rassemble les opérations courantes sous forme de procédures. Chacune suppose que le serveur de développement est lancé (§ 18.1) afin de voir le résultat en direct.

## 18. La boucle de travail

### 18.1 Démarrer une session

```bash
cd ~/Desktop/Projet_perso/Portfolio
nvm use                # active Node 24
npm install            # seulement la première fois, ou après une mise à jour des dépendances
npm run dev            # puis ouvrir http://localhost:4321
```

### 18.2 Cycle type d'une modification

```
 1. Modifier un fichier, enregistrer (Ctrl+S)
 2. Observer le résultat dans le navigateur (mise à jour instantanée)
 3. npm run check      → aucune erreur de type ?
 4. npm test           → tous les tests passent ?
 5. npm run build      → la construction réussit ? que reste-t-il à compléter ?
 6. npm run preview    → le site construit est-il conforme ? (facultatif mais conseillé)
 7. git add / git commit / git push   → enregistrement et mise en ligne (partie VI)
```

Les étapes 3 à 5 sont **refaites automatiquement par GitHub** à chaque envoi (§ 23.3). Les exécuter localement permet de détecter un problème avant qu'il n'atteigne le site en ligne.

## 19. Modifier le contenu

### 19.1 Modifier un texte d'identité (titre, disponibilité, localisation…)

Fichier : `src/config/site.ts`.

```ts
availability: 'Disponible en CDI · Immédiatement',
```

Modifiez la valeur entre apostrophes et enregistrez. La disponibilité apparaît dans la barre de menu, la fenêtre Parcours, le terminal (`fastfetch`) et la version simple.

### 19.2 Ajouter un projet

Fichier : `src/data/projects.ts`. Ajoutez un objet dans la liste `projets`, à la position voulue (l'ordre de la liste est l'ordre d'affichage) :

```ts
{
  slug: 'mon-projet',                 // identifiant sans espace ni accent (sert au terminal : ~/projets/mon-projet.md)
  name: 'Mon projet',
  summary: 'Une ligne de résumé.',
  description: 'Deux à quatre phrases : le problème, ce que vous avez fait, le résultat.',
  stack: ['Docker', 'Terraform'],
  repo: 'Stefy237/mon-projet',        // format propriétaire/nom, ou null
  demo: null,                          // URL d'une démonstration, ou null
  prod: null,                          // URL du service en production, ou null
  language: 'HCL',                     // langage principal si GitHub ne le fournit pas, ou null
  featured: true,                      // mis en avant dans la fenêtre Projets
},
```

Si `repo` est renseigné, la construction interroge GitHub pour afficher le langage, les étoiles et la date de mise à jour. La couleur de la pastille de langage provient d'une classe `lang-<nom>` de `src/styles/platforms.css` ; un langage absent de la liste s'affiche en gris.

### 19.3 Ajouter ou modifier une expérience

Fichier : `src/data/career.ts`, liste `experiences`. Champs : `role`, `org`, `type` (« Stage », « CDI »…), `place`, `period` (texte libre, par exemple `'mars – sept. 2026'`), `summary`, `highlights` (liste des réalisations), `skills` (liste des compétences), `main` (`true` pour l'expérience technique principale).

La liste `skills` du même fichier décrit les compétences générales ; le champ `context` y prend l'une des valeurs `'stage'`, `'projet'` ou `'apprentissage'`.

### 19.4 Mettre à jour une certification

Fichier : `src/data/certifications.ts`. Une fois la certification obtenue :

```ts
status: 'obtenue',
targetDate: null,
obtainedOn: 'déc. 2026',
verifyUrl: 'https://www.credly.com/badges/…',   // lien de vérification public
```

### 19.5 Ajouter une question d'entretien

Fichier : `src/data/faq.ts`. Ajoutez `{ question: '…', answer: '…' }`. Une question dont la réponse est vide est visible en développement et masquée en production.

### 19.6 Modifier les offres freelance

Fichier : `src/data/freelance.ts`. Les champs `services` (une ligne par offre) et `skills` (étiquettes) alimentent la fenêtre Freelance. `dailyRate` (tarif journalier) vaut `null` pour ne pas l'afficher, ou un nombre (`450`) pour l'afficher.

### 19.7 Mettre à jour le homelab

Fichier : `src/data/homelab.ts`.

- `phases` : feuille de route ; `status` vaut `'terminée'`, `'en cours'` ou `'à venir'`.
- `services` : services du laboratoire ; `status` vaut `'en place'` ou `'en cours'`.
- `homelabLinks` : `status` (page de statut publique), `grafana` (tableau de bord public), `repo` (dépôt du code d'infrastructure). Un bouton apparaît pour chaque lien renseigné.
- `recordings` : sessions de terminal enregistrées (asciinema).

### 19.8 Ajouter une recommandation

Fichier : `src/data/recommendations.ts`. Ajoutez un objet en respectant l'interface du fichier, **avec l'accord écrit de l'auteur**. La fenêtre Recommandations apparaît dès la première entrée.

## 20. Modifier les fichiers et les images

### 20.1 Remplacer le CV ou ajouter la lettre de motivation

Déposez le fichier PDF dans `public/documents/` **sous le nom exact** indiqué dans `site.documents` (`CV_Laura_Nguegang.pdf`, `lettre-de-motivation.pdf`), majuscules comprises. La construction détecte sa présence et affiche les boutons de téléchargement. Retirez du document public le numéro de téléphone et l'adresse postale.

### 20.2 Remplacer la photo ou la bannière

Les images sont au format **WebP** (plus léger que JPEG ou PNG à qualité égale) :

- `public/images/photo.webp` : portrait, environ 800 × 800 pixels, moins de 300 Ko ;
- `public/images/banniere.webp` : format très allongé (environ 4:1), comme une bannière LinkedIn ;
- `public/images/og.jpg` : image de partage, **exactement 1200 × 630 pixels**, en JPEG pour une compatibilité maximale.

Pour convertir une image en WebP, on peut utiliser un outil en ligne (Squoosh, par exemple) ou la commande `convert photo.jpg -resize 800x800 -quality 82 photo.webp` (ImageMagick). Si le nom du fichier change, mettez à jour `site.photo` ou `site.banner` dans `site.ts`.

## 21. Modifier l'interface

### 21.1 Masquer temporairement une fenêtre

Dans `src/apps/registry.ts`, passez `publish` à `false` pour l'application concernée. Rappel : la fenêtre reste visible avec `npm run dev`. Pour vérifier le résultat, lancez `npm run build && npm run preview`.

### 21.2 Masquer une section de la version simple

La version simple a sa propre mise en page dans `src/pages/simple.astro`. Repérez la section (par exemple `<section … id="freelance">`) et entourez-la d'un commentaire de gabarit :

```astro
{/*
<section class="s-section" id="freelance" …>
  …
</section>
*/}
```

### 21.3 Changer l'ordre ou le contenu du dock

L'ordre des boutons du dock suit l'ordre des entrées dans `registry.ts` (seules celles qui ont `dock: true`). Déplacez une entrée pour changer sa position. Sur téléphone, seuls les quatre premiers restent visibles.

### 21.4 Changer une couleur

Dans `src/styles/tokens.css`, modifiez la variable concernée dans les trois blocs (clair, sombre système, sombre explicite). Vérifiez ensuite le **contraste** du texte (au moins 4,5:1 selon les règles d'accessibilité WCAG), par exemple avec l'outil de contraste des outils de développement du navigateur.

### 21.5 Ajouter une commande au terminal

Dans `src/scripts/terminal/commands.ts`, ajoutez une entrée à l'objet `commands` :

```ts
stack: {
  description: 'technologies que j’utilise',
  run(ctx) {
    say(ctx, 'Docker · Terraform · Ansible · Prometheus', 'accent');
  },
},
```

La commande apparaît automatiquement dans `help`, dans `man` et dans l'autocomplétion. Ajoutez un test correspondant dans `tests/terminal.test.ts` (§ 31.1).

### 21.6 Ajouter une nouvelle application (fenêtre)

1. Créez les données : `src/data/veille.ts`.
2. Créez le contenu : `src/components/apps/VeilleApp.astro`, dans un `<div class="app">`.
3. Dans `src/apps/registry.ts`, ajoutez `'veille'` au type `AppId` et une entrée dans la liste `apps`.
4. Dans `src/pages/index.astro`, associez l'identifiant au composant : `views = { …, veille: VeilleApp }`.
5. Facultatif : ajoutez une section dans `simple.astro`, et un indicateur dans `ready` (`content.ts`) si le contenu peut être vide.

La commande `open veille` du terminal fonctionne alors automatiquement.

---

# Partie VI — Git et GitHub

## 22. Git : la gestion de versions

### 22.1 Concepts

| Terme | Définition |
|---|---|
| **Dépôt** (*repository*) | un projet suivi par Git. Le dossier `Portfolio/` est un dépôt ; l'historique est stocké dans le dossier caché `.git/` |
| **Commit** | un instantané enregistré de l'état des fichiers, accompagné d'un message qui décrit la modification. L'historique est une suite de commits |
| **Zone de préparation** (*staging area*) | l'ensemble des modifications sélectionnées pour le prochain commit (`git add`) |
| **Branche** | une ligne d'évolution parallèle. La branche principale s'appelle `main` ; c'est elle qui est mise en ligne |
| **Dépôt distant** (*remote*) | une copie du dépôt hébergée ailleurs, ici sur GitHub, sous le nom `origin` |
| **Push** | envoyer ses commits vers le dépôt distant |
| **Pull** | récupérer les commits du dépôt distant |

### 22.2 Les commandes essentielles

```bash
git status                     # quels fichiers ont changé ?
git diff                       # quelles lignes ont changé ?
git add src/data/projects.ts    # préparer un fichier pour le commit
git add .                      # préparer tous les fichiers modifiés (vérifier avant avec git status)
git commit -m "Ajoute le projet X"   # enregistrer un instantané
git push                       # envoyer sur GitHub → déclenche la mise en ligne
git log --oneline              # historique résumé
git pull                       # récupérer les modifications faites ailleurs (Dependabot, interface GitHub)
```

### 22.3 Le fichier `.gitignore`

Il liste les fichiers que Git ne doit **jamais** enregistrer : dépendances (`node_modules/`), site construit (`dist/`), secrets (`.env`, `terraform.tfvars`, `*.tfstate`), images sources (`images-sources/`). Avant tout commit, vérifiez avec `git status` qu'aucun fichier secret n'apparaît.

> **Remarque importante.** Un dépôt public est lisible par tous, **historique compris**. Une information enregistrée par erreur dans un commit puis supprimée reste lisible dans l'historique. Si un secret a été poussé, il faut le **révoquer immédiatement** : le supprimer du code ne suffit pas.

L'adresse e-mail associée aux commits (`git config user.email`) est elle aussi publique. Pour ne pas exposer son adresse personnelle, on peut utiliser l'adresse anonyme fournie par GitHub (*Settings → Emails → Keep my email addresses private*).

## 23. GitHub

### 23.1 Rôle

**GitHub** est un service d'hébergement de dépôts Git. Pour ce projet, il remplit quatre fonctions :

1. conserver le code et son historique (`github.com/Stefy237/…`) ;
2. **exécuter automatiquement** des vérifications et la mise en ligne grâce à **GitHub Actions** ;
3. **stocker les secrets** nécessaires à la mise en ligne ;
4. **proposer les mises à jour** des dépendances grâce à **Dependabot**.

### 23.2 GitHub Actions : principes

**Définition.** **GitHub Actions** est un service d'**intégration continue** (CI) et de **déploiement continu** (CD). À chaque événement (un `push`, l'ouverture d'une demande de fusion…), GitHub démarre une machine virtuelle neuve, y télécharge le code et exécute une suite d'étapes décrite dans un fichier YAML du dossier `.github/workflows/`.

**Définition.** **YAML** est un format de fichier de configuration lisible, fondé sur l'indentation (les espaces en début de ligne ont un sens).

Vocabulaire :

| Terme | Signification |
|---|---|
| *workflow* | un fichier `.yml` : une chaîne de traitement complète |
| `on` | les événements qui déclenchent le workflow |
| *job* | un ensemble d'étapes exécutées sur une même machine |
| *step* | une étape : une commande (`run`) ou une action réutilisable (`uses`) |
| *runner* | la machine virtuelle qui exécute le job (`ubuntu-latest`) |
| `secrets.X` | une valeur secrète stockée dans les réglages du dépôt |
| `vars.X` | une valeur non secrète stockée dans les réglages du dépôt |

### 23.3 Le workflow d'intégration continue (`ci.yml`)

Déclenché à chaque demande de fusion (*pull request*) et appelé avant chaque déploiement, il vérifie que le projet est sain :

| Étape | Commande | Ce qui est vérifié |
|---|---|---|
| 1 | `actions/checkout` | récupération du code |
| 2 | `actions/setup-node` | installation de Node.js (version lue dans `.nvmrc`) |
| 3 | `npm ci` | installation des dépendances **exactement** selon `package-lock.json` |
| 4 | `npm audit --audit-level=high` | absence de vulnérabilité connue grave dans les dépendances |
| 5 | `npm run check` | absence d'erreur de type |
| 6 | `npm run format:check` | respect de la mise en forme (Prettier) |
| 7 | `npm test` | réussite des tests |
| 8 | `npm run build` | réussite de la construction |
| 9 | `lychee` | absence de lien interne cassé dans `dist/` |
| 10 | `upload-artifact` | conservation du site construit pendant 7 jours (téléchargeable depuis l'onglet Actions) |

Si une étape échoue, le workflow s'arrête et s'affiche en rouge ; GitHub envoie une notification.

### 23.4 Le workflow de déploiement (`deploy.yml`)

Déclenché à chaque `push` sur `main`, ou manuellement (`workflow_dispatch`), il appelle d'abord `ci.yml`. Le job de publication déclare `needs: verify` : si une vérification échoue, rien n'est publié. Il récupère ensuite le dossier `dist/` que la CI vient de valider, le publie, puis contrôle le site en ligne (réponse HTTP 200 et en-têtes de sécurité) :

```yaml
- name: Récupérer le site validé par la CI
  uses: actions/download-artifact@v4
  with:
    name: dist
    path: dist
- name: Publier sur Cloudflare Pages
  if: ${{ env.CF_TOKEN != '' }}                # seulement si le secret existe
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    command: pages deploy dist --project-name=laura-nguegang --branch=main
```

**Wrangler** est l'outil en ligne de commande de Cloudflare. La commande `pages deploy dist` envoie le contenu du dossier `dist/` dans le projet Cloudflare Pages. Une minute environ après le `push`, le site en ligne est à jour.

Le réglage `concurrency: deploy-production` garantit que deux déploiements ne s'exécutent jamais en même temps.

**Lancer un déploiement manuellement** (pour rafraîchir le graphe de contributions sans modifier le code, par exemple) : onglet **Actions** du dépôt → workflow **Déploiement** → bouton **Run workflow**.

### 23.5 Les secrets et variables du dépôt

Les secrets se règlent dans **Settings** (onglet du dépôt, et non l'onglet Actions) → colonne de gauche, section *Security* → **Secrets and variables** → **Actions**.

| Type | Nom | Contenu |
|---|---|---|
| Secret | `CLOUDFLARE_API_TOKEN` | jeton Cloudflare de la CI, permission *Pages : Edit* uniquement |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | identifiant du compte Cloudflare |
| Secret | `GH_STATS_TOKEN` | jeton GitHub *fine-grained*, lecture seule des dépôts publics (graphe de contributions) |
| Variable (facultative) | `SITE_URL` | adresse publique ; par défaut `https://laura-nguegang.pages.dev` |
| Variable (facultative) | `CF_PAGES_PROJECT` | nom du projet Pages ; par défaut `laura-nguegang` |

> **Pourquoi `GH_STATS_TOKEN` et non `GITHUB_TOKEN` ?** GitHub fournit automatiquement à chaque workflow un jeton nommé `GITHUB_TOKEN`, limité au dépôt et insuffisant pour lire le calendrier de contributions. Les noms commençant par `GITHUB_` étant réservés, le jeton personnel est stocké sous le nom `GH_STATS_TOKEN`, puis transmis au build sous le nom `GITHUB_TOKEN` attendu par le code.

Un secret n'est plus jamais lisible une fois enregistré, même par le propriétaire du dépôt ; on peut seulement le remplacer. Dans les journaux d'exécution, GitHub masque automatiquement sa valeur (`***`).

### 23.6 Dependabot

Le fichier `.github/dependabot.yml` demande à GitHub de vérifier régulièrement (chaque semaine pour npm et les actions, chaque mois pour Terraform) si des mises à jour existent, et d'ouvrir une **demande de fusion** pour chacune. La CI s'exécute automatiquement sur ces demandes.

Règles de conduite :

- une demande dont la CI est **verte** et qui concerne une version mineure (`1.2.3 → 1.3.0`) peut généralement être fusionnée ;
- une **version majeure** (`4.x → 5.x`, `6.x → 7.x`) peut introduire des changements incompatibles : lisez les notes de version avant de fusionner, même si la CI est verte ;
- les mises à jour majeures du fournisseur Terraform Cloudflare sont **ignorées** par configuration, car la version 5 renomme des ressources (§ 27.6).

Après la fusion d'une demande sur GitHub, récupérez la modification en local avec `git pull`.

---

# Partie VII — Cloudflare

## 24. Présentation

**Cloudflare** est une entreprise qui exploite l'un des plus grands réseaux de serveurs au monde. Elle propose, souvent gratuitement, la distribution de sites (CDN), la protection contre les attaques, la gestion de noms de domaine et l'hébergement.

Le portfolio utilise **Cloudflare Pages**, le service d'hébergement de sites statiques.

## 25. Cloudflare Pages

### 25.1 Projet et déploiements

**Définition.** Un **projet Pages** est un conteneur nommé (`laura-nguegang`) auquel est associée une adresse `<nom>.pages.dev`. Le nom doit être unique parmi tous les utilisateurs de Cloudflare (`portfolio-laura` était déjà pris).

**Définition.** Un **déploiement** est une version du site envoyée dans ce projet. Chaque déploiement est conservé et dispose de sa propre adresse de prévisualisation ; le dernier déploiement de la branche `main` est servi à l'adresse principale.

> **Distinction essentielle.** Créer le projet (avec Terraform) **ne met rien en ligne** : le projet est vide tant qu'aucun déploiement n'y a été envoyé, et l'adresse répond alors par une erreur 522 ou 523. C'est le workflow de déploiement qui envoie le contenu (§ 23.4). Les deux opérations sont distinctes par conception : l'infrastructure change rarement, le contenu souvent.

Le projet est en mode **envoi direct** (*Direct Upload*) : Cloudflare n'est pas relié au dépôt GitHub et ne construit rien lui-même. C'est GitHub Actions qui construit le site et l'envoie. Le processus de construction reste ainsi entièrement visible et contrôlé dans le dépôt.

### 25.2 Pages et Workers

Cloudflare propose aussi **Workers**, un service qui exécute du code côté serveur. Le compte dispose d'un sous-domaine Workers (`laura-nguegang.workers.dev`), sous lequel chaque Worker obtiendrait une adresse de la forme `<worker>.laura-nguegang.workers.dev`. Ce sous-domaine **n'est pas utilisé** par le portfolio, qui est servi par Pages à l'adresse `laura-nguegang.pages.dev`. Workers ne deviendrait utile que pour ajouter du code serveur (un formulaire de contact qui envoie lui-même les messages, par exemple).

### 25.3 Le fichier `public/_headers`

Cloudflare Pages lit ce fichier et ajoute les en-têtes HTTP indiqués aux réponses :

```
/*                                   ← s'applique à toutes les adresses
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Content-Security-Policy: frame-ancestors 'none'; …
  X-Content-Type-Options: nosniff
  …
/_astro/*                            ← fichiers à empreinte : cache d'un an
  Cache-Control: public, max-age=31536000, immutable
```

Leur rôle est détaillé au § 30.2.

## 26. Le compte, les identifiants et les jetons

### 26.1 L'Account ID

L'**Account ID** identifie le compte Cloudflare. Il figure dans l'adresse du tableau de bord (`dash.cloudflare.com/<account_id>/…`) et dans la colonne de droite de la page *Workers & Pages*. Ce n'est pas un secret, mais il est stocké comme tel sur GitHub par commodité.

### 26.2 Les jetons d'API et le principe du moindre privilège

**Définition.** Un **jeton d'API** (*API token*) est une clé qui autorise un programme à agir sur le compte, dans les limites des permissions qui lui ont été accordées.

**Définition.** Le **principe du moindre privilège** consiste à n'accorder à chaque acteur que les droits strictement nécessaires à sa tâche. Si le jeton est dérobé, les dégâts possibles sont limités à ces droits.

Le projet utilise deux jetons distincts, créés dans *My Profile → API Tokens → Create Token → Create Custom Token* :

| Jeton | Utilisé par | Permissions | Stockage |
|---|---|---|---|
| `github-ci-pages` | le workflow de déploiement | `Account · Cloudflare Pages · Edit`, limité au compte | secret GitHub `CLOUDFLARE_API_TOKEN` |
| `terraform-local` | Terraform, sur l'ordinateur | `Account · Cloudflare Pages · Edit` ; avec un domaine, en plus : `Zone · DNS · Edit` limité à la zone du domaine | variable d'environnement du terminal, au moment de l'usage |

Deux jetons distincts permettent d'en révoquer un sans interrompre l'autre usage. Chaque jeton porte une **date d'expiration** ; le jeton de la CI expire le 22 janvier 2027 et devra être renouvelé avant cette date (*API Tokens → … → Roll*, puis mise à jour du secret GitHub).

> **Remarque.** La permission « Account DNS Settings » ne sert pas à créer des enregistrements DNS ; elle n'est pas nécessaire.

### 26.3 Zone et nom de domaine

**Définition.** Une **zone**, dans Cloudflare, est un nom de domaine dont Cloudflare gère le DNS. Elle est identifiée par un **Zone ID**. Le portfolio n'a pas encore de nom de domaine : il est servi uniquement sur `laura-nguegang.pages.dev`. La procédure d'ajout d'un domaine est décrite au § 28.5.

---

# Partie VIII — Terraform

## 27. L'infrastructure en tant que code

### 27.1 Définition

**Définition.** L'**infrastructure en tant que code** (*Infrastructure as Code*, IaC) consiste à décrire l'infrastructure (serveurs, réseaux, DNS, projets d'hébergement) dans des fichiers texte, plutôt que de la configurer à la main dans une interface Web.

Avantages :

- **reproductibilité** : la même description produit la même infrastructure ;
- **traçabilité** : chaque modification est enregistrée dans Git, avec son auteur et sa raison ;
- **relecture** : on voit ce qui va changer *avant* de l'appliquer ;
- **documentation** : le code décrit exactement ce qui existe.

**Terraform** (édité par HashiCorp) est l'outil d'IaC le plus répandu. Il est **déclaratif** : on décrit l'*état souhaité* (« il doit exister un projet Pages nommé `laura-nguegang` »), et Terraform détermine lui-même les actions nécessaires pour l'atteindre (créer, modifier ou ne rien faire).

### 27.2 Le langage HCL

Les fichiers Terraform portent l'extension `.tf` et sont écrits en **HCL** (*HashiCorp Configuration Language*). Les principaux types de blocs :

```hcl
terraform { … }                     # réglages de Terraform lui-même (version, fournisseurs)
provider "cloudflare" { … }         # connexion à un service
variable "account_id" { … }         # paramètre d'entrée
locals { has_domain = … }           # valeur calculée, réutilisable
resource "type" "nom" { … }         # un élément d'infrastructure à créer et gérer
output "site_url" { … }             # valeur affichée après l'application
```

On référence un élément par son type et son nom : `var.account_id` (variable), `local.has_domain` (valeur locale), `cloudflare_pages_project.site.subdomain` (attribut d'une ressource).

### 27.3 Le fournisseur (*provider*)

**Définition.** Un **fournisseur** est un module qui permet à Terraform de dialoguer avec un service particulier. Le projet utilise le fournisseur `cloudflare/cloudflare` en version 4.x (`version = "~> 4.52"`, c'est-à-dire « 4.52 ou plus récent, mais inférieur à 5.0 »). Il lit le jeton dans la variable d'environnement `CLOUDFLARE_API_TOKEN`, de sorte que le jeton n'apparaît jamais dans le code.

### 27.4 L'état (*state*)

**Définition.** L'**état** est un fichier (`terraform.tfstate`) dans lequel Terraform mémorise ce qu'il a créé et la correspondance entre les ressources du code et les objets réels chez Cloudflare. À chaque exécution, Terraform compare trois choses : le code, l'état et la réalité.

Règles :

- l'état est **local** et **jamais enregistré dans Git** (il est dans `.gitignore`) : il peut contenir des informations sensibles ;
- **ne le supprimez pas** : Terraform « oublierait » les ressources existantes et tenterait de les recréer ;
- ne modifiez pas à la main, dans le tableau de bord Cloudflare, une ressource gérée par Terraform : l'état divergerait de la réalité (*dérive*), et le prochain `apply` annulerait la modification.

### 27.5 Le fichier de verrouillage

`.terraform.lock.hcl` enregistre la version exacte du fournisseur téléchargé (ici 4.52.10) et son empreinte. Comme `package-lock.json` pour npm, il garantit que tout le monde utilise la même version. **Il est enregistré dans Git.**

### 27.6 Pourquoi rester en version 4

La version 5 du fournisseur Cloudflare a renommé plusieurs ressources (`cloudflare_record` est devenu `cloudflare_dns_record`) et modifié des attributs. Une migration demande de réécrire le code et d'utiliser des blocs `moved` pour éviter de recréer les ressources. Dependabot est donc configuré pour ignorer les versions majeures de ce fournisseur.

> L'éditeur peut souligner `cloudflare_pages_domain` en rouge (« attribute domain not expected ») : l'extension Terraform de l'éditeur se réfère au schéma de la version 5. L'erreur ne concerne pas la version 4 utilisée ; `terraform validate` confirme que la configuration est valide.

## 28. Les fichiers du projet

### 28.1 Vue d'ensemble

| Fichier | Contenu | Dans Git |
|---|---|---|
| `terraform.tf` | version de Terraform exigée (≥ 1.6), fournisseur Cloudflare 4.x | oui |
| `variables.tf` | déclaration des paramètres, avec description, type, valeur par défaut et validation | oui |
| `main.tf` | les ressources | oui |
| `outputs.tf` | les valeurs affichées après application | oui |
| `terraform.tfvars.example` | modèle des valeurs | oui |
| `terraform.tfvars` | **vos** valeurs (Account ID…) | **non** |
| `.terraform.lock.hcl` | versions verrouillées | oui |
| `terraform.tfstate` | l'état | **non** |
| `.terraform/` | fournisseurs téléchargés | **non** |

### 28.2 Les variables (`variables.tf`)

| Variable | Rôle | Défaut |
|---|---|---|
| `account_id` | identifiant du compte Cloudflare | aucun (obligatoire) |
| `project_name` | nom du projet Pages ; une règle de validation impose des minuscules, chiffres et tirets | `laura-nguegang` |
| `domain` | nom de domaine personnalisé | `""` (aucun) |
| `zone_id` | identifiant de la zone DNS du domaine | `""` ; une validation l'exige dès qu'un domaine est renseigné |
| `record_name` | nom de l'enregistrement DNS : `@` pour le domaine nu, `www` pour un sous-domaine | `@` |

Les valeurs effectives sont lues dans `terraform.tfvars`.

### 28.3 Les ressources (`main.tf`)

```hcl
locals {
  has_domain = var.domain != ""          # vrai si un domaine est renseigné
}

resource "cloudflare_pages_project" "site" {   # toujours créée
  account_id        = var.account_id
  name              = var.project_name
  production_branch = "main"
  # pas de bloc « source » : envoi direct depuis GitHub Actions
}

resource "cloudflare_pages_domain" "site" {    # créée seulement avec un domaine
  count        = local.has_domain ? 1 : 0
  account_id   = var.account_id
  project_name = cloudflare_pages_project.site.name
  domain       = var.domain
}

resource "cloudflare_record" "site" {          # créée seulement avec un domaine
  count   = local.has_domain ? 1 : 0
  zone_id = var.zone_id
  name    = var.record_name
  type    = "CNAME"
  content = cloudflare_pages_project.site.subdomain   # → laura-nguegang.pages.dev
  proxied = true                                       # trafic protégé par Cloudflare
}
```

**`count`** indique combien d'exemplaires d'une ressource créer. L'expression `condition ? 1 : 0` permet de rendre une ressource **facultative** : sans domaine, seules les ressources du projet Pages existent.

Les références entre ressources (`cloudflare_pages_project.site.subdomain`) indiquent à Terraform l'**ordre de création** : le projet d'abord, l'enregistrement DNS ensuite.

### 28.4 Le cycle de travail

```bash
cd infra/terraform
export CLOUDFLARE_API_TOKEN=<jeton Terraform>   # pour la durée de la session du terminal
terraform init        # télécharge le fournisseur (première fois, ou après changement de version)
terraform fmt         # met en forme les fichiers (facultatif)
terraform validate    # vérifie la syntaxe et la cohérence
terraform plan        # AFFICHE ce qui va changer, sans rien modifier
terraform apply       # applique, après confirmation (taper « yes »)
terraform output      # réaffiche les sorties (adresse du site)
```

**Lire un plan.** Chaque ligne est précédée d'un symbole :

| Symbole | Signification |
|---|---|
| `+` | création |
| `~` | modification sur place |
| `-` | suppression |
| `-/+` | **destruction puis recréation** : à examiner attentivement, car la ressource disparaît temporairement |

Le résumé final (`Plan: 1 to add, 0 to change, 0 to destroy.`) doit correspondre à l'intention. **On relit toujours le plan avant de taper `yes`.** Sans domaine, le plan initial annonce une ressource ; avec un domaine, trois.

`terraform destroy` supprime toutes les ressources gérées. Il est à proscrire, sauf intention explicite.

### 28.5 Procédure : ajouter un nom de domaine

1. Acheter le domaine (par exemple `laura-nguegang.fr`), de préférence chez Cloudflare Registrar, ou ailleurs puis en déléguant les serveurs DNS à Cloudflare.
2. Dans Cloudflare, relever le **Zone ID** (page de vue d'ensemble du domaine).
3. Ajouter au jeton Terraform la permission `Zone · DNS · Edit`, limitée à cette zone.
4. Dans `terraform.tfvars`, décommenter et renseigner `domain` et `zone_id`.
5. `terraform plan` (deux ressources à ajouter), puis `terraform apply`.
6. Sur GitHub, créer la variable de dépôt `SITE_URL = https://laura-nguegang.fr` ; dans `.env`, mettre la même valeur.
7. Relancer le workflow de déploiement pour que les liens canoniques et le plan du site utilisent la nouvelle adresse.

## 29. Récapitulatif : du clavier à l'écran du visiteur

```
  Ordinateur                         GitHub                                   Cloudflare
  ──────────                         ──────                                   ──────────
  1. modification de src/data/…
  2. npm run dev / check / build
  3. git commit && git push ───────► 4. workflow CI : audit, types,
                                        tests, build, liens
                                     5. workflow Déploiement :
                                        npm ci, npm run build
                                        (API GitHub interrogée avec
                                         GH_STATS_TOKEN)
                                        wrangler pages deploy dist ──────────► 6. nouveau déploiement
                                                                                  du projet laura-nguegang
                                                                               7. distribution par le CDN
                                                                                  + en-têtes de _headers
  8. le visiteur ouvre https://laura-nguegang.pages.dev ◄──────────────────────────┘

  Terraform (ponctuellement, depuis l'ordinateur) : crée et configure le projet Pages
  (et, plus tard, le domaine et l'enregistrement DNS). Il n'intervient pas dans les étapes 3 à 7.
```

---

# Partie IX — Sécurité et qualité

## 30. La sécurité

### 30.1 La politique de sécurité du contenu (CSP)

**Définition.** La **CSP** (*Content Security Policy*) est une liste de règles, transmise par le site au navigateur, qui indique quelles ressources la page a le droit de charger et d'exécuter. Elle constitue la principale protection contre les attaques par injection de script (*XSS*), dans lesquelles un attaquant parvient à faire exécuter son propre code dans la page.

Le site applique une CSP stricte, générée par Astro (`security.csp` dans `astro.config.mjs`) :

- `default-src 'self'` : par défaut, seules les ressources du site lui-même sont autorisées ;
- chaque script et chaque style produit par Astro est autorisé par son **empreinte** SHA-256 : un script injecté, dont l'empreinte est inconnue, est refusé ;
- aucun `'unsafe-inline'` : les scripts et styles écrits directement dans le HTML sont interdits (d'où la règle du § 10.4) ;
- `frame-src` n'autorise que `www.linkedin.com` (post intégré) et `www.youtube-nocookie.com` (vidéo).

> **Conséquence pratique.** Intégrer un service tiers (widget, formulaire, statistiques) exige d'ajouter son domaine dans les directives de `astro.config.mjs`. Chaque ajout élargit la surface d'attaque : il doit être justifié.

### 30.2 Les en-têtes HTTP de sécurité

Définis dans `public/_headers` :

| En-tête | Protection |
|---|---|
| `Strict-Transport-Security` | impose HTTPS pendant un an, même si le visiteur tape `http://` |
| `Content-Security-Policy: frame-ancestors 'none'` | interdit l'affichage du site dans un cadre d'un autre site (*clickjacking*) |
| `X-Frame-Options: DENY` | même protection, pour les navigateurs anciens |
| `X-Content-Type-Options: nosniff` | empêche le navigateur de deviner le type d'un fichier |
| `Referrer-Policy` | ne transmet aux sites externes que le nom de domaine d'origine |
| `Permissions-Policy` | désactive caméra, micro, géolocalisation, paiement |
| `Cross-Origin-Opener-Policy` | isole la page des fenêtres d'autres origines |

On peut vérifier leur présence sur [securityheaders.com](https://securityheaders.com) ou avec la commande `curl -I https://laura-nguegang.pages.dev`.

### 30.3 La gestion des secrets

| Secret | Où il vit | Où il ne doit jamais apparaître |
|---|---|---|
| jeton GitHub | `.env` (local), secret `GH_STATS_TOKEN` (GitHub) | code, commits, captures, conversations |
| jeton Cloudflare CI | secret `CLOUDFLARE_API_TOKEN` (GitHub) | `.env`, code |
| jeton Cloudflare Terraform | variable d'environnement, le temps de la session | fichiers `.tf`, `terraform.tfvars` |

Les jetons ne sont utilisés qu'au moment de la construction ou du déploiement ; aucun n'atteint le navigateur du visiteur.

### 30.4 Vie privée

Le site n'utilise ni cookie, ni traceur, ni outil de statistiques ; aucun bandeau de consentement n'est donc requis. Les polices sont hébergées par le site lui-même (paquets `@fontsource`) plutôt que chargées depuis Google Fonts. La vidéo YouTube, si elle est ajoutée, est intégrée depuis le domaine `youtube-nocookie.com`.

## 31. La qualité

### 31.1 Les tests automatiques

**Définition.** Un **test automatique** est un petit programme qui vérifie qu'une fonction produit le résultat attendu. Le projet utilise **Vitest**. Les tests se trouvent dans `tests/` :

- `terminal.test.ts` : résolution des chemins, commandes, effets, autocomplétion, affichage étroit ;
- `mail.test.ts` : construction du lien `mailto:`.

```ts
// Extrait de tests/terminal.test.ts
it('ne remonte jamais au-dessus de la racine', () => {
  expect(resolvePath(HOME, '../../../../..')).toBe('/');
});
```

Chaque test décrit un comportement attendu (`it('…')`) et le vérifie (`expect(…).toBe(…)`). Si une modification casse ce comportement, le test échoue et la CI bloque la mise en ligne.

`npm test` exécute tous les tests ; `npm run test:watch` les relance à chaque modification.

### 31.2 La vérification des types

`npm run check` (`astro check`) analyse tous les fichiers TypeScript et `.astro` et signale les incohérences : champ manquant, mauvais type, faute de frappe dans un nom de variable.

### 31.3 Les autres contrôles

- **`npm audit`** compare les dépendances installées à une base de vulnérabilités connues.
- **lychee** (dans la CI) vérifie que tous les liens internes du site construit mènent à une page existante.
- **L'accessibilité** est assurée par construction : fenêtres déclarées comme boîtes de dialogue (`role="dialog"`), gestion du focus clavier, lien d'évitement, région `aria-live` pour le terminal, respect du réglage « réduire les animations ».

---

# Partie X — Dépannage

## 32. Problèmes fréquents

| Symptôme | Cause probable | Solution |
|---|---|---|
| `npm run dev` affiche une erreur de version de Node | Node du système (v18) utilisé | `nvm use` dans le dossier du projet |
| `command not found: nvm` | nvm non chargé dans ce terminal | `source ~/.nvm/nvm.sh`, puis `nvm use` |
| Erreur rouge dans l'éditeur après une modification de données | virgule, apostrophe ou accolade manquante | lire le message ; `npm run check` indique le fichier et la ligne |
| Un élément a son style en développement mais pas en ligne | attribut `style="…"` bloqué par la CSP | déplacer le style dans une feuille de style (§ 10.4) |
| Une fenêtre masquée (`publish: false`) reste visible | serveur de développement : tout y est visible | vérifier avec `npm run build && npm run preview` |
| Le bouton CV n'apparaît pas | fichier absent ou nom différent (majuscules) | vérifier le chemin exact de `site.documents.cv` dans `public/` |
| Le graphe de contributions est absent | jeton absent, invalide ou expiré | vérifier `GITHUB_TOKEN` (local) ou `GH_STATS_TOKEN` (GitHub) ; chercher `[github]` dans le journal de construction |
| Le graphe n'est pas à jour | il reflète la dernière construction | relancer le workflow Déploiement (§ 23.4) |
| Le site en ligne répond 522 ou 523 | projet Pages vide : aucun déploiement réussi | vérifier l'onglet Actions ; relancer le workflow Déploiement |
| Le workflow Déploiement affiche « Déploiement ignoré » | secret `CLOUDFLARE_API_TOKEN` absent | ajouter le secret (§ 23.5) |
| Le workflow échoue à l'étape de publication (erreur d'authentification) | jeton Cloudflare expiré ou révoqué | régénérer le jeton (*Roll*) et mettre à jour le secret |
| `terraform plan` veut recréer (`-/+`) le projet | changement de nom ou d'un attribut non modifiable | ne pas appliquer ; revoir la modification |
| `terraform apply` échoue sur le domaine | permission DNS manquante sur le jeton | ajouter `Zone · DNS · Edit` (et, si besoin, `Zone · Zone · Read`) |
| La CI échoue sur une demande Dependabot | mise à jour majeure incompatible | ne pas fusionner ; lire les notes de version |
| Un lien LinkedIn intégré reste vide | post non public, ou URL qui n'est pas celle du `src` de l'iframe | revoir `site.linkedinPostEmbedUrl` |

## 33. Méthode générale de diagnostic

1. **Lire le message d'erreur en entier**, en particulier la première ligne rouge et le nom de fichier indiqué.
2. **Localiser l'étape** : développement local, construction, CI, déploiement ou navigateur.
3. **Dans le navigateur**, ouvrir les outils de développement (`F12`) : l'onglet *Console* affiche les erreurs JavaScript et les violations de CSP, l'onglet *Réseau* les requêtes en échec.
4. **Sur GitHub**, onglet *Actions* : cliquer sur l'exécution en échec, puis sur l'étape rouge, pour lire le journal.
5. **Revenir en arrière** si nécessaire : `git diff` montre ce qui a changé depuis le dernier commit ; `git restore <fichier>` annule les modifications non enregistrées d'un fichier (irréversible : vérifiez avant).

---

# Annexes

## Annexe A — Glossaire

| Terme | Définition |
|---|---|
| **API** | interface qui permet à un programme de demander des données ou des actions à un service |
| **Astro** | générateur de site statique utilisé par le projet |
| **Build** (construction) | transformation du code source en site prêt à distribuer (`dist/`) |
| **CDN** | réseau de serveurs répartis qui distribuent le site au plus près des visiteurs |
| **CI/CD** | intégration continue (vérifications automatiques) et déploiement continu (mise en ligne automatique) |
| **CNAME** | enregistrement DNS qui déclare un nom comme alias d'un autre |
| **Commit** | instantané enregistré des fichiers dans Git |
| **Composant** | morceau d'interface réutilisable (fichier `.astro`) |
| **CSP** | politique de sécurité qui restreint les ressources qu'une page peut charger |
| **Dépendance** | paquet de code externe utilisé par le projet |
| **Déploiement** | envoi d'une version du site vers l'hébergeur |
| **DNS** | annuaire qui traduit les noms de domaine en adresses IP |
| **Endpoint** | fichier de `src/pages/` qui produit un fichier non HTML (ici `robots.txt`) |
| **En-tête HTTP** | métadonnée jointe à une réponse du serveur |
| **Fournisseur** (*provider*) | module Terraform qui dialogue avec un service |
| **Fragment** | partie d'une URL après `#`, lue seulement par le navigateur |
| **Frontmatter** | partie d'un fichier `.astro` entre `---`, exécutée au build |
| **HCL** | langage des fichiers Terraform |
| **IaC** | infrastructure décrite sous forme de code |
| **Jeton** (*token*) | clé d'accès à une API, assortie de permissions |
| **Layout** | composant qui enveloppe toutes les pages |
| **Moindre privilège** | principe consistant à n'accorder que les droits nécessaires |
| **Node.js** | environnement d'exécution de JavaScript hors navigateur |
| **npm** | gestionnaire de paquets et de scripts de Node.js |
| **nvm** | gestionnaire de versions de Node.js |
| **Open Graph** | métadonnées qui définissent l'aperçu d'un lien partagé |
| **Props** | paramètres transmis à un composant |
| **Pull request** | demande de fusion d'une branche dans une autre, sur GitHub |
| **Requête média** | règle CSS conditionnée à la taille de l'écran |
| **Routage** | correspondance entre adresses et pages |
| **Runner** | machine virtuelle qui exécute un workflow GitHub Actions |
| **Secret** | valeur confidentielle stockée par GitHub et injectée dans les workflows |
| **Site statique** | site dont les pages sont fabriquées à l'avance |
| **State** | fichier où Terraform mémorise l'infrastructure qu'il gère |
| **TypeScript** | JavaScript avec déclaration des types |
| **Variable CSS** | valeur nommée réutilisable dans les feuilles de style |
| **Variable d'environnement** | valeur fournie à un programme par son environnement d'exécution |
| **Vite** | outil interne d'Astro qui regroupe et optimise CSS et JavaScript |
| **Workflow** | chaîne de traitement automatisée de GitHub Actions |
| **Wrangler** | outil en ligne de commande de Cloudflare |
| **YAML** | format de fichier de configuration fondé sur l'indentation |

## Annexe B — Mémento des commandes

**Développement**

```bash
nvm use                         # activer Node 24 (à chaque nouveau terminal)
npm install                     # installer les dépendances
npm run dev                     # serveur de développement → http://localhost:4321
npm run dev -- --host           # idem, accessible depuis un téléphone du même réseau
npm run check                   # vérifier les types
npm test                        # lancer les tests
npm run build                   # construire le site dans dist/
npm run preview                 # prévisualiser le site construit
```

**Git**

```bash
git status                      # état des fichiers
git diff                        # détail des modifications
git add <fichier>               # préparer
git commit -m "message"         # enregistrer
git push                        # envoyer (et déployer)
git pull                        # récupérer
git log --oneline               # historique
```

**Terraform** (depuis `infra/terraform/`)

```bash
export CLOUDFLARE_API_TOKEN=…   # jeton Terraform
terraform init
terraform validate
terraform plan
terraform apply
terraform output
```

**Vérifications en ligne**

```bash
curl -I https://laura-nguegang.pages.dev     # code d'état et en-têtes
```

## Annexe C — Où modifier quoi ?

| Je veux… | Fichier |
|---|---|
| changer mon titre, ma disponibilité, ma localisation, mes liens | `src/config/site.ts` |
| changer mon adresse e-mail | `src/config/site.ts` (`email`) |
| ajouter ou modifier un projet | `src/data/projects.ts` |
| modifier une expérience, ma formation, mes compétences | `src/data/career.ts` |
| mettre à jour une certification | `src/data/certifications.ts` |
| modifier une réponse d'entretien | `src/data/faq.ts` |
| modifier les offres freelance | `src/data/freelance.ts` |
| mettre à jour le homelab | `src/data/homelab.ts` |
| modifier les modèles de mail | `src/data/mail.ts` |
| remplacer le CV ou la photo | `public/documents/`, `public/images/` |
| masquer une fenêtre | `src/apps/registry.ts` (`publish: false`) |
| changer l'ordre du dock | `src/apps/registry.ts` (ordre des entrées) |
| changer une couleur | `src/styles/tokens.css` |
| changer l'apparence sur téléphone | `src/styles/os.css` (bloc `@media (max-width: 767px)`) |
| changer le texte du post-it | `src/pages/index.astro` (élément `.note`) |
| ajouter une commande au terminal | `src/scripts/terminal/commands.ts` |
| modifier la version simple | `src/pages/simple.astro`, `src/styles/simple.css` |
| autoriser un service tiers | `astro.config.mjs` (`security.csp`) |
| modifier les en-têtes de sécurité | `public/_headers` |
| changer l'adresse publique du site | variable `SITE_URL` (GitHub et `.env`) |
| modifier l'infrastructure Cloudflare | `infra/terraform/` |
| modifier la chaîne de vérification ou de mise en ligne | `.github/workflows/` |

## Annexe D — Bibliographie et ressources

**Web (notions générales)**

- MDN Web Docs (Mozilla), *Apprendre le développement Web*. <https://developer.mozilla.org/fr/docs/Learn>
- MDN Web Docs, *Content Security Policy (CSP)*. <https://developer.mozilla.org/fr/docs/Web/HTTP/CSP>
- W3C, *Web Content Accessibility Guidelines (WCAG) 2.2*. <https://www.w3.org/TR/WCAG22/>

**Outils**

- Node.js, documentation officielle. <https://nodejs.org/docs>
- npm, documentation officielle. <https://docs.npmjs.com>
- TypeScript, *Handbook*. <https://www.typescriptlang.org/docs/handbook/>

**Astro**

- Astro, documentation officielle (disponible en français). <https://docs.astro.build/fr/>
- Astro, *Routage*. <https://docs.astro.build/fr/guides/routing/>
- Astro, *Composants*. <https://docs.astro.build/fr/basics/astro-components/>

**Git et GitHub**

- S. Chacon et B. Straub, *Pro Git*, 2ᵉ éd., Apress (disponible gratuitement en français). <https://git-scm.com/book/fr/v2>
- GitHub Docs, *GitHub Actions*. <https://docs.github.com/fr/actions>
- GitHub Docs, *Utilisation de secrets dans GitHub Actions*. <https://docs.github.com/fr/actions/security-guides/using-secrets-in-github-actions>
- GitHub Docs, *Dependabot*. <https://docs.github.com/fr/code-security/dependabot>

**Cloudflare**

- Cloudflare Docs, *Pages*. <https://developers.cloudflare.com/pages/>
- Cloudflare Docs, *Direct Upload with continuous integration*. <https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/>
- Cloudflare Docs, *Headers* (fichier `_headers`). <https://developers.cloudflare.com/pages/configuration/headers/>
- Cloudflare Docs, *Create API token*. <https://developers.cloudflare.com/fundamentals/api/get-started/create-token/>

**Terraform**

- HashiCorp, *Terraform documentation*. <https://developer.hashicorp.com/terraform/docs>
- HashiCorp, *Get started — Terraform tutorials*. <https://developer.hashicorp.com/terraform/tutorials>
- Terraform Registry, *Cloudflare provider* (sélectionner la version 4.x). <https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs>
- Y. Brikman, *Terraform: Up & Running*, 3ᵉ éd., O'Reilly, 2022.
