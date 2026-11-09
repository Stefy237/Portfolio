/**
 * Système de fichiers virtuel, en lecture seule, construit à partir des données du site.
 */
import type { TerminalData } from './types';

export type FsNode = { type: 'dir'; children: Record<string, FsNode> } | { type: 'file'; content: string };

export const HOME = '/home/laura';

const file = (content: string): FsNode => ({ type: 'file', content });
const dir = (children: Record<string, FsNode>): FsNode => ({ type: 'dir', children });

export function buildFs(d: TerminalData): FsNode {
  const projects: Record<string, FsNode> = {};
  for (const p of d.projects) {
    const lines = [`# ${p.name}`, '', p.description];
    if (p.stack.length) lines.push('', `Stack : ${p.stack.join(', ')}`);
    for (const l of p.links) lines.push(`${l.label} : ${l.url}`);
    projects[`${p.slug}.md`] = file(lines.join('\n'));
  }

  const contact = [
    `${d.name}`,
    d.title,
    `${d.location} · ${d.availability}`,
    '',
    d.email ? `E-mail   : ${d.email}` : null,
    d.links.linkedin ? `LinkedIn : ${d.links.linkedin}` : null,
    `GitHub   : ${d.links.github}`,
    d.links.malt ? `Malt     : ${d.links.malt}` : null,
  ]
    .filter((l): l is string => l !== null)
    .join('\n');

  const certifs = d.certifications
    .map((c) => `- ${c.name} : ${c.status}${c.targetDate ? ` (examen visé ${c.targetDate})` : ''}`)
    .join('\n');

  const visite = [
    `# Bienvenue sur ${d.osName}`,
    '',
    'Ce terminal est un shell de démonstration : il tourne entièrement dans',
    'votre navigateur et ne touche aucune infrastructure réelle.',
    '',
    'Pour commencer :',
    '  help         liste des commandes',
    '  projets      mes projets',
    '  fastfetch    le résumé du système',
    '  open <app>   ouvrir une fenêtre (ex. open homelab)',
  ].join('\n');

  return dir({
    home: dir({
      laura: dir({
        'visite.md': file(visite),
        'contact.txt': file(contact),
        'certifications.txt': file(certifs),
        projets: dir(projects),
      }),
    }),
    etc: dir({
      'os-release': file(`NAME="${d.osName}"\nVERSION="1.0"\nPRETTY_NAME="${d.osName} 1.0 (navigateur)"`),
      motd: file(`Bienvenue sur ${d.osName}. Tapez « help ».`),
    }),
  });
}

/** Normalise un chemin (absolu ou relatif, avec ~, . et ..) en chemin absolu. On ne peut pas remonter au-dessus de /. */
export function resolvePath(cwd: string, input: string): string {
  let raw = input.trim();
  if (raw === '' || raw === '~') return HOME;
  if (raw.startsWith('~/')) raw = HOME + raw.slice(1);
  const base = raw.startsWith('/') ? [] : cwd.split('/').filter(Boolean);
  for (const part of raw.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') base.pop();
    else base.push(part);
  }
  return '/' + base.join('/');
}

export function lookup(root: FsNode, absPath: string): FsNode | null {
  let node: FsNode = root;
  for (const part of absPath.split('/').filter(Boolean)) {
    if (node.type !== 'dir') return null;
    const next: FsNode | undefined = node.children[part];
    if (!next) return null;
    node = next;
  }
  return node;
}

/** Affichage court d'un chemin : /home/laura/projets → ~/projets */
export function displayPath(absPath: string): string {
  if (absPath === HOME) return '~';
  if (absPath.startsWith(HOME + '/')) return '~' + absPath.slice(HOME.length);
  return absPath;
}
