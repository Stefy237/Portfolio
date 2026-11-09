/**
 * Indicateurs calculés à partir de la configuration et des données :
 * qu'est-ce qui est prêt à être publié, qu'est-ce qui manque encore ?
 */
import { site } from '../config/site';
import { experiences, skills } from '../data/career';
import { projects } from '../data/projects';
import { certifications } from '../data/certifications';
import { recommendations } from '../data/recommendations';
import { faq } from '../data/faq';
import { phases, services, homelabLinks } from '../data/homelab';
import { regions, methodology } from '../data/market';
import { freelance } from '../data/freelance';
import { publicFileExists } from './files';

export const ready = {
  cv: publicFileExists(site.documents.cv),
  lettre: publicFileExists(site.documents.lettre),
  photo: publicFileExists(site.photo),
  banner: publicFileExists(site.banner),
  mail: Boolean(site.email),
  video: site.videoYoutubeId !== '',
  linkedinPost: site.linkedinPostEmbedUrl.startsWith('https://www.linkedin.com/embed/'),
  recommendations: recommendations.length > 0,
  faq: faq.some((q) => q.answer.trim() !== ''),
  market: regions.some((r) => r.min !== null && r.max !== null && r.source),
};

/** Liste lisible de tout ce qui reste à renseigner (affichée à chaque build). */
export function missingItems(): string[] {
  const m: string[] = [];
  if (!site.email) m.push('E-mail pro → src/config/site.ts (email) — fenêtre Mail masquée en attendant');
  if (!site.links.linkedin) m.push('URL LinkedIn → src/config/site.ts (links.linkedin)');
  if (!site.links.malt) m.push('URL Malt → src/config/site.ts (links.malt)');
  if (!site.links.siteRepo) m.push('Dépôt du site → src/config/site.ts (links.siteRepo)');
  if (!site.mobility) m.push('Mobilité → src/config/site.ts (mobility)');
  if (!site.lookingFor) m.push('Poste recherché → src/config/site.ts (lookingFor)');
  if (site.linkedinPostEmbedUrl && !ready.linkedinPost) m.push('linkedinPostEmbedUrl doit commencer par https://www.linkedin.com/embed/');
  if (!site.linkedinPostEmbedUrl) m.push('Post LinkedIn intégré → src/config/site.ts (linkedinPostEmbedUrl)');
  if (!ready.cv) m.push(`CV → déposer le PDF dans public${site.documents.cv}`);
  if (!ready.lettre) m.push(`Lettre → déposer le PDF dans public${site.documents.lettre}`);
  if (!ready.photo) m.push(`Photo → déposer l'image dans public${site.photo}`);
  if (!ready.video) m.push('Vidéo → src/config/site.ts (videoYoutubeId)');
  experiences.filter((e) => e.period === null).forEach((e) => m.push(`Période « ${e.org} » → src/data/career.ts`));
  experiences
    .filter((e) => e.main && e.highlights.length === 0)
    .forEach((e) => m.push(`Réalisations « ${e.org} » → src/data/career.ts (highlights)`));
  const noContext = skills.filter((s) => s.context === null).map((s) => s.name);
  if (noContext.length) m.push(`Contexte des compétences (${noContext.join(', ')}) → src/data/career.ts`);
  projects.filter((p) => p.stack.length === 0).forEach((p) => m.push(`Stack « ${p.name} » → src/data/projects.ts`));
  projects
    .filter((p) => !p.repo && !p.prod && !p.demo)
    .forEach((p) => m.push(`Lien « ${p.name} » (repo, démo ou prod) → src/data/projects.ts`));
  certifications
    .filter((c) => c.status === 'en préparation' && !c.targetDate)
    .forEach((c) => m.push(`Date visée « ${c.name} » → src/data/certifications.ts`));
  if (!ready.recommendations) m.push('Recommandations → src/data/recommendations.ts (fenêtre masquée en attendant)');
  const unanswered = faq.filter((q) => !q.answer.trim()).length;
  if (unanswered) m.push(`${unanswered} réponse(s) d'entretien → src/data/faq.ts`);
  if (phases.some((p) => !p.content)) m.push('Contenu des phases du homelab → src/data/homelab.ts');
  if (services.length === 0) m.push('Services du homelab → src/data/homelab.ts');
  if (!homelabLinks.repo) m.push("Dépôt de l'infra du homelab → src/data/homelab.ts");
  if (!ready.market) m.push('Salaires par région → src/data/market.ts (fenêtre masquée en attendant)');
  if (ready.market && !methodology) m.push('Méthode des salaires → src/data/market.ts');
  if (freelance.services.length === 0) m.push('Prestations freelance → src/data/freelance.ts');
  if (freelance.skills.length === 0) m.push('Compétences freelance → src/data/freelance.ts (skills)');
  return m;
}

let reported = false;

/** Affiche une fois par build la liste de ce qui manque. */
export function reportMissing(): void {
  if (reported) return;
  reported = true;
  const items = missingItems();
  if (items.length === 0) {
    console.info('\n[contenu] Tout est renseigné.\n');
    return;
  }
  console.info(`\n[contenu] ${items.length} élément(s) à compléter (masqués en production) :`);
  for (const item of items) console.info(`  - ${item}`);
  console.info('');
}
