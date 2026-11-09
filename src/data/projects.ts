/**
 * Projets mis en avant. L'ordre de la liste est l'ordre d'affichage.
 *
 * Si `repo` est renseigné (format « propriétaire/nom »), le build va chercher sur GitHub
 * le langage principal, le nombre d'étoiles et la date du dernier push.
 */

export interface Project {
  slug: string;
  name: string;
  /** Une ligne. */
  summary: string;
  /** Deux à quatre phrases : le problème, ce que tu as fait, le résultat. */
  description: string;
  stack: string[];
  /** Dépôt GitHub « propriétaire/nom ». null = pas de dépôt public (ou à compléter). */
  repo: string | null;
  demo: string | null;
  prod: string | null;
  /** Langage principal, utilisé quand GitHub ne le fournit pas (pastille de couleur). null = non affiché. */
  language: string | null;
  /** Affiché en grand dans la fenêtre Projets. */
  featured: boolean;
}

export const projects: Project[] = [
  {
    slug: 'assista-crise',
    name: 'Assista-Crise',
    summary: 'Plateforme de gestion de crise avec IoT.',
    description:
      "J'ai migré son architecture multi-services vers Docker Compose, " +
      'et mis en place la supervision avec Prometheus et Grafana : métriques, tableaux de bord et alertes.',
    stack: ['Angular 19', 'Django 5', 'PostGIS', 'Redis', 'Docker', 'MQTT', 'Meshtastic LoRa'],
    repo: 'sylvain-hazera/assista-crise-code-bis',
    demo: null,
    prod: 'https://assista-crise.fr',
    language: 'Python',
    featured: true,
  },
  {
    slug: 'mysh',
    name: 'Mysh',
    summary: 'Configurateur web pour personnaliser son shell Linux.',
    description:
      "On choisit ses options et son gestionnaire de paquets, et l'outil génère un script d'installation sécurisé, " +
      'avec la marche à suivre pour annuler les changements.',
    stack: ['Bash', 'GitHub Actions'],
    repo: 'Stefy237/Mysh',
    demo: 'https://stefy237.github.io/Mysh',
    prod: null,
    language: 'Bash',
    featured: true,
  },
  {
    slug: 'jdr-cli',
    name: 'JDR CLI',
    summary: 'Application en ligne de commande qui met en œuvre six design patterns.',
    description: 'Application en ligne de commande qui met en œuvre six design patterns.',
    stack: ['Java 17', 'Maven', 'SQLite', 'JUnit 5'],
    repo: 'Stefy237/projet-gl',
    demo: null,
    prod: null,
    language: 'Java',
    featured: false,
  },
];
