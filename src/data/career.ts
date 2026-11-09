/**
 * Parcours : expériences, formation et compétences.
 * Un champ à null ou une liste vide = « à compléter ».
 */

export interface Experience {
  role: string;
  org: string;
  /** Type de contrat, affiché comme sur LinkedIn : « Stage », « Service civique », « CDI »… */
  type: string;
  place: string;
  /** Période affichée, ex. « mars – oct. 2026 ». null = à compléter. */
  period: string | null;
  summary: string;
  /** Réalisations concrètes (uniquement ce qui est public / autorisé par ta confidentialité). */
  highlights: string[];
  /** Compétences mobilisées, affichées sous l'expérience. */
  skills: string[];
  /** true = expérience technique principale (mise en avant). */
  main: boolean;
}

export interface Formation {
  degree: string;
  school: string;
  /** Nom court affiché en tête du profil (ex. « Polytech Grenoble »). */
  short: string;
  period: string;
  detail: string;
}

/** Contexte dans lequel une compétence a été pratiquée : c'est ce qui la rend défendable en entretien. */
export type SkillContext = 'stage' | 'projet' | 'apprentissage' | null;

export interface Skill {
  name: string;
  context: SkillContext;
}

export const experiences: Experience[] = [
  {
    role: 'Stagiaire ingénieure',
    org: 'Alstom Digital & Integrated Systems',
    type: 'Stage de fin d’études',
    place: 'Villeurbanne',
    period: 'mars – sept. 2026',
    summary: 'Stage de fin d’études sur Security Gateway, un produit de cybersécurité.',
    highlights: [
      'Réduction de 50 % des temps de livraison : refonte du build en mode modulaire et incrémental sous GitLab CI',
      "Conception et déploiement d'une plateforme de test virtualisée sous VMware ESXi (Linux et FreeBSD), intégrée aux pipelines CI",
      'Automatisation du build, des tests et de la livraison en Python et Bash',
      'Provisioning de serveurs Debian avec Ansible (configuration réseau, utilisateurs, services)',
      "Gestion des artefacts avec Artifactory, recettes d'intégration automatisées avec Robot Framework",
      'Rédaction de la documentation technique conforme aux processus qualité Alstom',
    ],
    skills: ['GitLab CI', 'Linux', 'FreeBSD', 'Ansible', 'Python', 'Bash', 'VMware ESXi', 'Artifactory', 'Robot Framework', 'RTC'],
    main: true,
  },
  {
    role: 'Volontaire',
    org: 'GUC Tennis',
    type: 'Service civique',
    place: 'Gières',
    period: 'sept. 2025 – mars 2026',
    summary: 'Mission au sein du club : outils numériques pour sa gestion et vie associative.',
    highlights: [
      "Développement d'une application Python d'automatisation du processus annuel du club",
      'Macros VBA pour les statistiques du club',
      "Organisation d'activités et accueil des adhérents",
      'Formation aux premiers secours (PSC1)',
    ],
    skills: ['Python', 'VBA', 'Excel'],
    main: false,
  },
];

export const formations: Formation[] = [
  {
    degree: "Diplôme d'ingénieur — double diplôme",
    school: 'Grenoble INP – Polytech Grenoble et ENSPY Yaoundé',
    short: 'Polytech Grenoble',
    period: '2020 – 2026',
    detail: 'Spécialité Systèmes et Réseaux',
  },
];

export const skills: Skill[] = [
  { name: 'GitLab CI', context: 'stage' },
  { name: 'Docker', context: 'projet' },
  { name: 'Kubernetes', context: 'apprentissage' },
  { name: 'Prometheus / Grafana', context: 'projet' },
  { name: 'Linux / FreeBSD', context: 'stage' },
  { name: 'Ansible', context: 'stage' },
  { name: 'Python', context: 'projet' },
  { name: 'Terraform', context: 'apprentissage' },
  { name: 'Angular · Django · Spring Boot', context: 'projet' },
];

export const skillContextLabel: Record<Exclude<SkillContext, null>, string> = {
  stage: 'Pratiqué en stage',
  projet: 'Pratiqué en projet',
  apprentissage: 'En apprentissage',
};

/** Initiales d'une organisation, pour les vignettes façon logo. */
export function initials(name: string): string {
  return name
    .replace(/[–—&·-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 || /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}
