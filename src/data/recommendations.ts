/**
 * Recommandations reprises de LinkedIn, AVEC l'accord de leurs auteurs.
 * Tant que la liste est vide, la fenêtre Recommandations n'apparaît pas en production.
 *
 * Exemple :
 * {
 *   quote: 'Texte exact de la recommandation.',
 *   author: 'Prénom Nom',
 *   role: 'Poste, Entreprise',
 *   relation: 'Tuteur de stage',
 *   url: 'https://www.linkedin.com/in/…',
 * },
 */

export interface Recommendation {
  quote: string;
  author: string;
  role: string;
  relation: string;
  url: string | null;
}

export const recommendations: Recommendation[] = [];
