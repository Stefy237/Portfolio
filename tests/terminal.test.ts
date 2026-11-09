import { describe, expect, it } from 'vitest';
import { createShell, tokenize } from '../src/scripts/terminal/commands';
import { displayPath, HOME, resolvePath } from '../src/scripts/terminal/fs';
import type { ShellState, TerminalData } from '../src/scripts/terminal/types';

const data: TerminalData = {
  name: 'Laura Nguegang Kowo',
  firstName: 'Laura',
  title: 'Ingénieure Systèmes & Réseaux',
  location: 'Lyon',
  availability: 'Disponible',
  email: '',
  osName: 'laura·os',
  links: { github: 'https://github.com/Stefy237', linkedin: '', malt: '' },
  cv: null,
  projects: [{ slug: 'mysh', name: 'Mysh', summary: 'Configurateur de shell', description: 'Description', stack: [], links: [] }],
  certifications: [{ name: 'Terraform Associate', status: 'en préparation', targetDate: null }],
  apps: [
    { id: 'projets', label: 'Projets' },
    { id: 'homelab', label: 'Homelab' },
  ],
  makeTargets: [
    { name: 'infra', tool: 'Terraform', role: 'crée les VM', log: ['Apply complete!'] },
    { name: 'test', tool: 'Smoke test', role: 'vérifie le cluster', log: [] },
  ],
  destroyLog: ['Destroy complete!'],
};

const fresh = (): ShellState => ({ cwd: HOME, history: [] });
const texts = (lines: { text: string }[]) => lines.map((l) => l.text).join('\n');

describe('chemins', () => {
  it('résout ~, . et ..', () => {
    expect(resolvePath(HOME, '~')).toBe(HOME);
    expect(resolvePath(HOME, 'projets')).toBe(`${HOME}/projets`);
    expect(resolvePath(`${HOME}/projets`, '..')).toBe(HOME);
    expect(resolvePath(HOME, '~/projets/./mysh.md')).toBe(`${HOME}/projets/mysh.md`);
  });

  it('ne remonte jamais au-dessus de la racine', () => {
    expect(resolvePath(HOME, '../../../../..')).toBe('/');
  });

  it('abrège le dossier personnel en ~', () => {
    expect(displayPath(`${HOME}/projets`)).toBe('~/projets');
    expect(displayPath('/etc')).toBe('/etc');
  });
});

describe('tokenize', () => {
  it('respecte les guillemets', () => {
    expect(tokenize('echo "bonjour le monde" test')).toEqual(['echo', 'bonjour le monde', 'test']);
  });
});

describe('commandes', () => {
  const shell = createShell(data);

  it('liste les commandes avec help', () => {
    const out = texts(shell.run('help', fresh()).lines);
    expect(out).toContain('whoami');
    expect(out).toContain('open <app>');
  });

  it('signale une commande inconnue', () => {
    const r = shell.run('vim', fresh());
    expect(r.lines[0]?.kind).toBe('error');
    expect(r.lines[0]?.text).toContain('commande introuvable');
  });

  it('refuse les tubes et redirections', () => {
    expect(shell.run('ls | grep a', fresh()).lines[0]?.kind).toBe('error');
  });

  it('se déplace avec cd et lit un fichier avec cat', () => {
    const state = fresh();
    const r1 = shell.run('cd projets', state);
    expect(r1.cwd).toBe(`${HOME}/projets`);
    state.cwd = r1.cwd;
    expect(texts(shell.run('cat mysh.md', state).lines)).toContain('# Mysh');
  });

  it('refuse cd vers un fichier', () => {
    expect(shell.run('cd visite.md', fresh()).lines[0]?.kind).toBe('error');
  });

  it('open émet un effet pour une application connue', () => {
    expect(shell.run('open homelab', fresh()).effects).toEqual([{ type: 'open', app: 'homelab' }]);
    expect(shell.run('open inconnue', fresh()).effects).toEqual([]);
  });

  it('theme accepte clair et sombre', () => {
    expect(shell.run('theme sombre', fresh()).effects).toEqual([{ type: 'theme', value: 'dark' }]);
    expect(shell.run('theme clair', fresh()).effects).toEqual([{ type: 'theme', value: 'light' }]);
    expect(shell.run('theme violet', fresh()).effects).toEqual([]);
  });

  it('cv ouvre le dossier quand le PDF est absent', () => {
    expect(shell.run('cv', fresh()).effects).toEqual([{ type: 'open', app: 'dossier' }]);
  });

  it('autocomplète commandes, chemins et applications', () => {
    expect(shell.complete('who', fresh())).toEqual(['whoami']);
    expect(shell.complete('cat vi', fresh())).toEqual(['visite.md']);
    expect(shell.complete('cd pro', fresh())).toEqual(['projets/']);
    expect(shell.complete('open ho', fresh())).toEqual(['homelab']);
  });

  it('fastfetch retire le logo sur un écran étroit', () => {
    const wide = shell.run('fastfetch', { ...fresh(), columns: 100 }).lines;
    const narrow = shell.run('fastfetch', { ...fresh(), columns: 40 }).lines;
    expect(wide.some((l) => l.lead)).toBe(true);
    expect(narrow.some((l) => l.lead)).toBe(false);
  });

  it('affiche une invite avec le dossier courant', () => {
    expect(shell.prompt(`${HOME}/projets`)).toBe('laura@laura-os:~/projets$');
  });
});

describe('make', () => {
  const shell = createShell(data);

  it('liste les cibles sans argument', () => {
    const out = texts(shell.run('make', fresh()).lines);
    expect(out).toContain('infra');
    expect(out).toContain('destroy');
  });

  it('rejoue toutes les étapes avec make all', () => {
    const out = texts(shell.run('make all', fresh()).lines);
    expect(out).toContain('make infra (Terraform)');
    expect(out).toContain('Apply complete!');
    expect(out).toContain('make test (Smoke test)');
  });

  it('refuse make destroy et signale une cible inconnue', () => {
    const destroy = shell.run('make destroy', fresh()).lines;
    expect(destroy[0]?.kind).toBe('error');
    expect(texts(destroy)).toContain('Destroy complete!');
    expect(shell.run('make deploy', fresh()).lines[0]?.kind).toBe('error');
  });

  it('complète les cibles', () => {
    expect(shell.complete('make de', fresh())).toEqual(['destroy']);
  });
});
