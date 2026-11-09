/**
 * Marché DevOps junior : salaires d'embauche bruts annuels par région.
 *
 * Chaque chiffre doit avoir une source et une date. Tant qu'aucune région n'a de chiffre,
 * la fenêtre Marché n'apparaît pas en production.
 */

export interface RegionSalaire {
  region: string;
  /** En euros bruts annuels. null = pas de donnée. */
  min: number | null;
  max: number | null;
  source: string | null;
  /** Date de la source, ex. « 2026 ». */
  date: string | null;
}

export const regions: RegionSalaire[] = [
  'Auvergne-Rhône-Alpes',
  'Bourgogne-Franche-Comté',
  'Bretagne',
  'Centre-Val de Loire',
  'Corse',
  'Grand Est',
  'Hauts-de-France',
  'Île-de-France',
  'Normandie',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Pays de la Loire',
  "Provence-Alpes-Côte d'Azur",
].map((region) => ({ region, min: null, max: null, source: null, date: null }));

/** Méthode : sources utilisées, définition de « junior », limites. Vide = à compléter. */
export const methodology = '';

/** Région mise en avant (la tienne). */
export const homeRegion = 'Auvergne-Rhône-Alpes';
