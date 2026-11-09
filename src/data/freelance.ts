/**
 * Activité freelance (fenêtre organisée comme un profil Malt).
 */

export const freelance = {
  /** Titre du profil freelance. */
  headline: 'DevOps freelance · CI/CD, infrastructure, supervision',
  pitch:
    "J'aide les startups et les PME à automatiser leurs déploiements et à fiabiliser leur infrastructure cloud : " +
    'pipelines CI/CD, conteneurisation, HTTPS, supervision et maintenance.',
  note: 'Ouverte aux missions freelance comme au CDI : une mission peut tout à fait se poursuivre par une embauche.',
  /** Tarif journalier indicatif en euros (TJM). null = non affiché. */
  dailyRate: 450 as number | null,
  /** Disponibilité pour des missions, ex. « Disponible pour des missions courtes ». Vide = non affiché. */
  availability: 'Disponible pour des missions',
  /** Prestations proposées, une ligne chacune. */
  services: [
    'Pack CI/CD : automatisation des tests, des builds et des déploiements (GitLab CI ou GitHub Actions). À partir de 700 €.',
    'Pack Infrastructure : conteneurisation Docker, reverse proxy, HTTPS, supervision Prometheus / Grafana. À partir de 1 200 €.',
    'Pack Maintenance DevOps : supervision, mises à jour, améliorations et interventions planifiées. De 250 à 600 € par mois.',
    'Refonte de site vitrine, avec son hébergement et son déploiement automatique. Sur devis.',
  ] as string[],
  /** Compétences affichées en étiquettes, comme sur Malt. */
  skills: [
    'GitLab CI',
    'GitHub Actions',
    'Docker',
    'Docker Compose',
    'Terraform',
    'Ansible',
    'Linux',
    'Prometheus',
    'Grafana',
    'Bash',
    'Python',
    'Cloudflare',
  ] as string[],
  /** Exemple de réalisation (lien vers un avant / après). */
  example: '',
};
