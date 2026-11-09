/**
 * Registre des « applications » du bureau.
 *
 * Chaque application = une fenêtre. Pour en ajouter une :
 *  1. crée son contenu dans src/components/apps/MonApp.astro ;
 *  2. ajoute son entrée ci-dessous ;
 *  3. associe l'id au composant dans src/pages/index.astro (objet `views`).
 * La version simple (src/pages/simple.astro) a sa propre mise en page et lit directement les données.
 */
import type { IconName } from '../components/ui/icons';
import { site, shortUrl } from '../config/site';
import { ready } from '../lib/content';

export type AppId =
  | 'apropos'
  | 'parcours'
  | 'projets'
  | 'terminal'
  | 'mail'
  | 'homelab'
  | 'certifications'
  | 'recommandations'
  | 'freelance'
  | 'dossier'
  | 'marche'
  | 'faq';

export interface Geometry {
  /** Position et taille par défaut, en px, pour un écran de 1440×900. Recadrées si l'écran est plus petit. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AppMeta {
  id: AppId;
  /** Nom court (icône, dock, commande open). */
  label: string;
  /** Titre de la barre de fenêtre. */
  windowTitle: string;
  icon: IconName;
  /** Icône sur le bureau. */
  desktop: boolean;
  /** Bouton dans le dock (les 4 premiers restent visibles sur téléphone). */
  dock: boolean;
  /** Fenêtre ouverte au chargement, sur ordinateur uniquement (le téléphone affiche l'écran d'accueil). */
  openOnStart: boolean;
  /** Contenu sans marge intérieure (les fenêtres « plateforme » gèrent leur propre mise en page). */
  flush: boolean;
  geometry: Geometry;
  /** Publiée en production ? (false tant que le contenu n'existe pas). */
  publish: boolean;
}

export const apps: AppMeta[] = [
  {
    id: 'apropos',
    label: 'À propos',
    windowTitle: 'À propos de Laura',
    icon: 'user',
    desktop: false,
    dock: false,
    openOnStart: false,
    flush: false,
    geometry: { x: 300, y: 80, w: 520, h: 480 },
    publish: true,
  },
  {
    id: 'projets',
    label: 'Projets',
    windowTitle: shortUrl(site.links.github),
    icon: 'code',
    desktop: true,
    dock: true,
    openOnStart: false,
    flush: true,
    geometry: { x: 250, y: 60, w: 820, h: 640 },
    publish: true,
  },
  {
    id: 'parcours',
    label: 'Parcours',
    windowTitle: site.links.linkedin ? shortUrl(site.links.linkedin) : 'Parcours · profil LinkedIn',
    icon: 'briefcase',
    desktop: true,
    dock: true,
    openOnStart: false,
    flush: true,
    geometry: { x: 420, y: 56, w: 720, h: 660 },
    publish: true,
  },
  {
    id: 'terminal',
    label: 'Terminal',
    windowTitle: 'Terminal — shell de démonstration',
    icon: 'terminal',
    desktop: true,
    dock: true,
    openOnStart: true,
    flush: true,
    geometry: { x: 360, y: 120, w: 720, h: 460 },
    publish: true,
  },
  {
    id: 'mail',
    label: 'Mail',
    windowTitle: 'Nouveau message',
    icon: 'mail',
    desktop: true,
    dock: true,
    openOnStart: false,
    flush: true,
    geometry: { x: 760, y: 200, w: 560, h: 520 },
    publish: ready.mail,
  },
  {
    id: 'homelab',
    label: 'Homelab',
    windowTitle: 'Homelab',
    icon: 'server',
    desktop: true,
    dock: true,
    openOnStart: false,
    flush: false,
    geometry: { x: 330, y: 96, w: 640, h: 560 },
    publish: true,
  },
  {
    id: 'freelance',
    label: 'Freelance',
    windowTitle: site.links.malt ? shortUrl(site.links.malt) : 'Freelance · profil Malt',
    icon: 'tools',
    desktop: true,
    dock: true,
    openOnStart: false,
    flush: true,
    geometry: { x: 440, y: 110, w: 640, h: 560 },
    publish: true,
  },
  {
    id: 'dossier',
    label: 'Dossier',
    windowTitle: '~/dossier-de-candidature',
    icon: 'folder',
    desktop: true,
    dock: true,
    openOnStart: false,
    flush: false,
    geometry: { x: 780, y: 120, w: 520, h: 520 },
    publish: true,
  },
  {
    id: 'certifications',
    label: 'Certifications',
    windowTitle: 'Certifications',
    icon: 'badge',
    desktop: true,
    dock: false,
    openOnStart: false,
    flush: false,
    geometry: { x: 380, y: 120, w: 540, h: 460 },
    publish: true,
  },
  {
    id: 'recommandations',
    label: 'Recommandations',
    windowTitle: 'Recommandations',
    icon: 'quote',
    desktop: true,
    dock: false,
    openOnStart: false,
    flush: false,
    geometry: { x: 410, y: 140, w: 560, h: 460 },
    publish: ready.recommendations,
  },
  {
    id: 'marche',
    label: 'Marché',
    windowTitle: 'Marché DevOps junior',
    icon: 'map',
    desktop: true,
    dock: false,
    openOnStart: false,
    flush: false,
    geometry: { x: 300, y: 70, w: 760, h: 600 },
    publish: ready.market,
  },
  {
    id: 'faq',
    label: 'Questions',
    windowTitle: "Questions d'entretien",
    icon: 'help',
    desktop: true,
    dock: false,
    openOnStart: false,
    flush: false,
    geometry: { x: 470, y: 110, w: 580, h: 520 },
    publish: ready.faq,
  },
];

/**
 * Lien de repli des lanceurs [data-open] : utilisé sans JavaScript, ou depuis la version simple.
 */
export function fallbackHref(id: AppId): string {
  const special: Partial<Record<AppId, string>> = {
    terminal: '/#terminal',
    mail: site.email ? `mailto:${site.email}` : '/simple#contact',
    dossier: '/simple#contact',
    apropos: '/simple',
  };
  return special[id] ?? `/simple#${id}`;
}

/** Applications affichées : toutes en développement, seulement celles qui ont du contenu en production. */
export function visibleApps(): AppMeta[] {
  return import.meta.env.DEV ? apps : apps.filter((a) => a.publish);
}
