# laura·os

[![Déploiement](https://github.com/Stefy237/Portfolio/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/Stefy237/Portfolio/actions/workflows/deploy.yml)

**Site en ligne : [laura-nguegang.pages.dev](https://laura-nguegang.pages.dev)**

![Le bureau laura·os, avec le terminal ouvert](docs/screenshot.png)

Portfolio personnel présenté comme un **bureau de système d'exploitation dans le navigateur**. Les projets, le parcours, le homelab, les certifications et le dossier de candidature s'ouvrent dans des fenêtres. Un terminal, ouvert au démarrage sur ordinateur, permet d'explorer le site en ligne de commande.

- **Des fenêtres qu'on reconnaît tout de suite.** Projets est organisé comme un profil GitHub, Parcours comme un profil LinkedIn, Freelance comme un profil Malt et Mail comme un « Nouveau message » de webmail. La structure est la même, mais avec les couleurs du site et sans logo de ces services.

- **Thème clair et sombre** : il suit le réglage du système, et un bouton permet de basculer.
- **Sur téléphone**, le bureau devient un écran d'accueil et les fenêtres gardent leur cadre.
- **Une version simple** (`/simple`) présente tout le contenu sur une seule page éditoriale, avec photo et sans encadrés. Elle sert aux recruteurs pressés, aux lecteurs d'écran et à l'impression, et fonctionne sans JavaScript.
- **Site statique** généré par [Astro](https://astro.build), sans framework côté navigateur : le bureau est en TypeScript natif.

> Fonctionnement détaillé du code : **[DOCUMENTATION.md](./DOCUMENTATION.md)**. Guide pas à pas pour débutant : **[docs/GUIDE.md](./docs/GUIDE.md)**.

## Démarrage rapide

Prérequis : **Node.js 24** (version LTS) et npm. La version attendue est inscrite dans `.nvmrc`.

```bash
nvm use            # ou installe Node 24 d'une autre manière
npm ci             # installe les versions exactes du package-lock.json
cp .env.example .env   # facultatif : ajoute un GITHUB_TOKEN pour le graphe de contributions
npm run dev        # http://localhost:4321
```

## Scripts

| Commande          | Rôle                                                           |
| ----------------- | -------------------------------------------------------------- |
| `npm run dev`     | serveur de développement avec rechargement automatique         |
| `npm run build`   | construit le site de production dans `dist/`                   |
| `npm run preview` | sert `dist/` en local, pour tester le résultat de production   |
| `npm run check`   | vérifie les types TypeScript et les composants Astro           |
| `npm run format`  | met le code en forme (Prettier)                                |
| `npm test`        | lance les tests unitaires (Vitest)                             |

## Où modifier quoi

| Je veux changer…                                          | Fichier                                   |
| --------------------------------------------------------- | ----------------------------------------- |
| Mon nom, mon titre, mes liens, mon e-mail, ma vidéo       | `src/config/site.ts`                      |
| Mes expériences, ma formation, mes compétences            | `src/data/career.ts`                    |
| Mes projets                                               | `src/data/projects.ts`                     |
| Mes certifications                                        | `src/data/certifications.ts`              |
| Les recommandations                                       | `src/data/recommendations.ts`             |
| Mes réponses aux questions d'entretien                    | `src/data/faq.ts`                         |
| Le homelab (phases, services, liens)                      | `src/data/homelab.ts`                     |
| Les salaires par région                                   | `src/data/market.ts`                      |
| L'offre freelance                                         | `src/data/freelance.ts`                   |
| Mon CV, ma lettre, ma photo, ma bannière                  | `public/documents/`, `public/images/`     |
| Les modèles de messages de la fenêtre Mail                | `src/data/mail.ts`                        |
| Les fenêtres (ordre, taille, icône, dock)                 | `src/apps/registry.ts`                    |
| Les couleurs des deux thèmes                              | `src/styles/tokens.css`                   |
| Les commandes du terminal                                 | `src/scripts/terminal/commands.ts`        |

## Structure

```
.
├── astro.config.mjs          configuration Astro (dont la politique de sécurité CSP)
├── public/                   fichiers servis tels quels
│   ├── _headers              en-têtes HTTP de sécurité (Cloudflare Pages)
│   ├── documents/            CV et lettre en PDF
│   ├── images/               photo de profil, bannière
│   └── scripts/theme-init.js applique le thème avant l'affichage
├── src/
│   ├── config/site.ts        identité, liens, documents
│   ├── data/                 contenu du site, un fichier par rubrique
│   ├── apps/registry.ts      liste des fenêtres du bureau
│   ├── components/
│   │   ├── os/               barre de menu, fenêtre, dock, bouton de thème
│   │   ├── apps/             contenu de chaque fenêtre
│   │   ├── simple/           titres de section de la version simple
│   │   ├── embeds/           graphe GitHub, post LinkedIn
│   │   └── ui/               icônes, encadré « À compléter »
│   ├── lib/                  API GitHub (au build), contrôle du contenu manquant
│   ├── scripts/              gestionnaire de fenêtres, thème, terminal, mail
│   ├── styles/               jetons, bureau, contenu, fenêtres « plateforme », version simple
│   └── pages/                index (bureau), simple, 404
├── tests/                    tests unitaires du terminal et de la fenêtre Mail
├── docs/                     guide détaillé, capture d'écran
├── infra/terraform/          projet Cloudflare Pages + nom de domaine + DNS
└── .github/                  CI, déploiement, Dependabot
```

## Mise en ligne

À chaque push sur `main`, GitHub Actions vérifie le code (types, mise en forme, tests, audit des dépendances, liens internes), construit le site, publie sur **Cloudflare Pages** le build validé, puis contrôle la production. Si une vérification échoue, rien n'est publié.

## Choix techniques

- **Astro, sans framework côté navigateur.** Le contenu est statique : tout est généré au build, et seul le bureau a besoin d'un peu de TypeScript.
- **Cloudflare Pages plutôt que GitHub Pages.** Il permet de définir de vrais en-têtes HTTP de sécurité (`public/_headers`), en complément de la CSP à empreintes générée par Astro.
- **Terraform pour l'hébergement.** Le projet Pages et l'éventuel nom de domaine sont décrits dans `infra/terraform/`. Le fournisseur Cloudflare reste en 4.x, car la 5.x renomme plusieurs ressources.
- **État Terraform local, assumé.** Une seule personne administre ce projet ; un backend distant deviendrait utile en travaillant à plusieurs.

## Licence

Code sous licence [MIT](./LICENSE). Contenu (textes, CV, photo) : © Laura Nguegang Kowo, tous droits réservés.
