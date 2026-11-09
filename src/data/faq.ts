/**
 * Questions d'entretien et tes réponses.
 * Seules les questions qui ont une réponse sont publiées en production.
 */

export interface Question {
  question: string;
  answer: string;
}

export const faq: Question[] = [
  {
    question: 'Pourquoi le DevOps, après un stage en cybersécurité ?',
    answer:
      "Chez Alstom, je travaillais sur un produit de cybersécurité, mais mon quotidien, c'était la chaîne de livraison : refonte du build GitLab CI, plateforme de test sous ESXi, automatisation en Python et Bash. C'est là que j'ai eu le plus d'impact, avec des temps de livraison divisés par deux. La sécurité ne disparaît pas pour autant : je l'applique dans les pipelines et l'infrastructure. C'est pour ça que je vise aussi des postes DevSecOps.",
  },
  {
    question: 'Pourquoi avoir ajouté du monitoring dans Assista-Crise ?',
    answer:
      "C'est une plateforme de gestion de crise : elle doit être disponible au moment précis où tout le reste tombe. Sans supervision, on découvre une panne quand un utilisateur la signale. Avec Prometheus et Grafana, on a des métriques par service, des tableaux de bord et des alertes, ce qui permet de détecter un problème avant les utilisateurs.",
  },
  {
    question: 'Racontez-moi un problème technique que vous avez résolu.',
    answer:
      "Chez Alstom, le build du produit était long et ralentissait chaque livraison. J'ai d'abord mesuré la durée de chaque étape du pipeline GitLab CI : la reconstruction systématique des artefacts prenait l'essentiel du temps. J'ai alors rendu le build modulaire et incrémental, et stocké les artefacts dans Artifactory pour les réutiliser au lieu de les reconstruire. Résultat : des temps de livraison divisés par deux.",
  },
  {
    question: "Qu'est-ce que votre double diplôme vous a apporté ?",
    answer:
      "Deux systèmes d'enseignement, deux pays, deux façons de travailler. À l'ENSPY, des bases théoriques solides. À Polytech Grenoble, beaucoup de projets en équipe et une spécialisation en systèmes et réseaux. J'y ai surtout appris à m'adapter vite à un nouvel environnement, ce qui sert directement à chaque nouvelle infrastructure.",
  },
  {
    question: 'Quel poste et quel environnement recherchez-vous ?',
    answer:
      "Un premier poste DevOps, SRE ou DevSecOps, dans une équipe où je peux toucher à la CI/CD, à l'infrastructure as code et à la supervision, avec des pairs plus expérimentés auprès de qui apprendre. Je prépare la Terraform Associate, la CKAD et l'AWS SAA, donc un environnement cloud ou Kubernetes m'intéresse particulièrement.",
  },
  {
    question: 'Quand pouvez-vous commencer, et êtes-vous mobile ?',
    answer:
      'Je suis disponible immédiatement, pas de préavis ou de démarches initiales à prévoir. Je suis basée à Lyon et ouverte à toute la France, sur site, en hybride ou à distance.',
  },
];
