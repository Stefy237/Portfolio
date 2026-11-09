/**
 * Configuration générale du site : identité, liens, documents.
 *
 * Règle : une chaîne vide ('') signifie « pas encore renseigné ».
 * Les éléments non renseignés s'affichent en pointillés pendant le développement
 * (npm run dev) et disparaissent complètement du site en production (npm run build).
 * La liste de ce qui manque s'affiche dans le terminal à chaque build.
 */
export const site = {
  /** Nom complet, utilisé dans les titres et métadonnées. */
  name: 'Laura Nguegang Kowo',
  firstName: 'Laura',
  /** Titre professionnel court. */
  title: 'Ingénieure DevOps junior — Systèmes & Réseaux',
  /** Titre détaillé, repris de LinkedIn (fenêtre Parcours, version simple). */
  headline: 'Ingénieure DevOps junior | GitLab CI · Docker · Linux/FreeBSD · Ansible · Python | Systèmes & Réseaux',
  /** Thèmes affichés sur la bannière du profil. */
  bannerTags: 'CI/CD · Linux · Automatisation',
  /** Présentation de deux ou trois phrases (fenêtre « À propos » et version simple). */
  intro:
    "Je viens de terminer mon stage de fin d'études chez Alstom, sur un produit de cybersécurité. " +
    'Je construis, je déploie et je supervise des infrastructures, et je cherche un premier poste pour en faire mon métier.',
  /** Trois faits marquants, affichés en grand en haut de la version simple. */
  keyFacts: [
    { title: "Stage de fin d'études chez Alstom", detail: 'Security Gateway, un produit de cybersécurité' },
    { title: 'Docker Compose et supervision', detail: "Conteneurisation et supervision Prometheus / Grafana d'Assista-Crise" },
    { title: '3 certifications en préparation', detail: 'Terraform Associate · CKAD · AWS Solutions Architect' },
  ],
  /** Une phrase sur le poste recherché. */
  lookingFor: 'Un premier poste DevOps, DevSecOps ou SRE',
  location: 'Lyon / Villeurbanne',
  availability: 'Disponible en CDI · Immédiatement',
  /** Mobilité et modes de travail acceptés. */
  mobility: 'France — sur site, hybride ou à distance',
  /** Affiché sous le nom dans la fenêtre Parcours, comme sur LinkedIn. */
  linkedinConnections: 'Plus de 500 relations',

  /** Adresse e-mail professionnelle : destinataire de la fenêtre Mail et des liens « M'écrire ». */
  email: 'ngueganglaura@gmail.com',

  links: {
    github: 'https://github.com/Stefy237',
    linkedin: 'https://www.linkedin.com/in/laura-nguegang-ab0a2b266/',
    malt: 'https://www.malt.fr/profile/lauranguegang',
    siteRepo: 'https://github.com/Stefy237/Portfolio',
  },

  /** Compte GitHub dont on lit les dépôts et les contributions au build. */
  githubUser: 'Stefy237',

  /**
   * URL d'intégration d'un post LinkedIn public.
   * Sur LinkedIn : « … » sur le post > « Intégrer ce post » > copier l'adresse du src de l'iframe.
   * Elle doit commencer par https://www.linkedin.com/embed/feed/update/
   */
  linkedinPostEmbedUrl: 'https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7516218784840359936?collapsed=1',

  /** Fichiers à déposer dans public/ (le site vérifie au build qu'ils existent). */
  documents: {
    cv: '/documents/CV_Laura_Nguegang.pdf',
    lettre: '/documents/lettre-de-motivation.pdf',
  },
  /** Photo de profil, à déposer dans public/images/ (portrait, au moins 800 px de large). */
  photo: '/images/photo.webp',
  /** Bannière du profil (facultatif, format 4:1), à déposer dans public/images/. */
  banner: '/images/banniere.webp',

  /** Vidéo de présentation : identifiant YouTube (la partie après v= dans l'URL). */
  videoYoutubeId: '',

  /** Nom affiché du « système d'exploitation ». */
  osName: 'laura·os',
} as const;

export type Site = typeof site;

/** « https://www.linkedin.com/in/x/ » → « linkedin.com/in/x » (titres de fenêtres). */
export function shortUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}
