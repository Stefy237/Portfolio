/**
 * Interpréteur du shell de démonstration. Fonctions pures (aucun accès au DOM) :
 * on peut donc les tester avec Vitest (voir tests/terminal.test.ts).
 *
 * Pour ajouter une commande : ajoute une entrée dans `commands` avec sa description
 * et sa fonction. Elle apparaîtra automatiquement dans « help » et dans l'autocomplétion.
 */
import { buildFs, displayPath, HOME, lookup, resolvePath, type FsNode } from './fs';
import type { Effect, Line, RunResult, ShellState, TerminalData } from './types';

interface Ctx {
  args: string[];
  state: ShellState;
  data: TerminalData;
  root: FsNode;
  out: Line[];
  effects: Effect[];
  cwd: string;
}

interface Command {
  description: string;
  usage?: string;
  run: (ctx: Ctx) => void;
}

const say = (ctx: Ctx, text: string, kind: Line['kind'] = 'out') => {
  for (const t of text.split('\n')) ctx.out.push({ text: t, kind });
};

const commands: Record<string, Command> = {
  help: {
    description: 'liste des commandes',
    run(ctx) {
      say(ctx, 'Commandes disponibles :', 'accent');
      const names = Object.keys(commands).sort();
      for (const name of names) {
        const c = commands[name]!;
        say(ctx, `  ${(c.usage ?? name).padEnd(20)} ${c.description}`);
      }
      say(ctx, 'Tab complète une commande ou un chemin, ↑ ↓ parcourent l’historique.', 'muted');
    },
  },
  whoami: {
    description: 'qui suis-je ?',
    run(ctx) {
      say(ctx, `${ctx.data.name} — ${ctx.data.title}`);
      say(ctx, `${ctx.data.location} · ${ctx.data.availability}`, 'muted');
    },
  },
  pwd: {
    description: 'dossier courant',
    run(ctx) {
      say(ctx, ctx.cwd);
    },
  },
  ls: {
    description: 'lister un dossier',
    usage: 'ls [chemin]',
    run(ctx) {
      const target = ctx.args.find((a) => !a.startsWith('-')) ?? '.';
      const path = resolvePath(ctx.cwd, target);
      const node = lookup(ctx.root, path);
      if (!node) return say(ctx, `ls: ${target} : aucun fichier ou dossier de ce nom`, 'error');
      if (node.type === 'file') return say(ctx, target);
      const entries = Object.entries(node.children).sort(([a], [b]) => a.localeCompare(b));
      for (const [name, child] of entries) {
        if (child.type === 'dir') say(ctx, `${name}/`, 'accent');
        else say(ctx, name);
      }
    },
  },
  cd: {
    description: 'changer de dossier',
    usage: 'cd [chemin]',
    run(ctx) {
      const target = ctx.args[0] ?? '~';
      const path = resolvePath(ctx.cwd, target);
      const node = lookup(ctx.root, path);
      if (!node) return say(ctx, `cd: ${target} : aucun fichier ou dossier de ce nom`, 'error');
      if (node.type !== 'dir') return say(ctx, `cd: ${target} : n'est pas un dossier`, 'error');
      ctx.cwd = path;
    },
  },
  cat: {
    description: 'afficher un fichier',
    usage: 'cat <fichier>',
    run(ctx) {
      if (ctx.args.length === 0) return say(ctx, 'cat : indiquez un fichier, par exemple « cat visite.md »', 'error');
      for (const target of ctx.args) {
        const node = lookup(ctx.root, resolvePath(ctx.cwd, target));
        if (!node) say(ctx, `cat: ${target} : aucun fichier ou dossier de ce nom`, 'error');
        else if (node.type === 'dir') say(ctx, `cat: ${target} : est un dossier`, 'error');
        else say(ctx, node.content);
      }
    },
  },
  open: {
    description: 'ouvrir une fenêtre du bureau',
    usage: 'open <app>',
    run(ctx) {
      const id = ctx.args[0]?.toLowerCase();
      const app = ctx.data.apps.find((a) => a.id === id || a.label.toLowerCase() === id);
      if (!app) {
        if (id) say(ctx, `open : application inconnue « ${id} »`, 'error');
        say(ctx, `Applications : ${ctx.data.apps.map((a) => a.id).join(', ')}`, 'muted');
        return;
      }
      say(ctx, `Ouverture de ${app.label}…`, 'muted');
      ctx.effects.push({ type: 'open', app: app.id });
    },
  },
  projets: {
    description: 'mes projets',
    run(ctx) {
      for (const p of ctx.data.projects) {
        say(ctx, p.name, 'accent');
        say(ctx, `  ${p.summary}`);
      }
      say(ctx, 'Détail : cat ~/projets/<nom>.md · fenêtre : open projets', 'muted');
    },
  },
  certifs: {
    description: 'mes certifications',
    run(ctx) {
      const node = lookup(ctx.root, `${HOME}/certifications.txt`);
      if (node?.type === 'file') say(ctx, node.content);
    },
  },
  contact: {
    description: 'me contacter',
    run(ctx) {
      const node = lookup(ctx.root, `${HOME}/contact.txt`);
      if (node?.type === 'file') say(ctx, node.content);
      if (ctx.data.apps.some((a) => a.id === 'mail')) say(ctx, 'Écrire directement : open mail', 'muted');
    },
  },
  cv: {
    description: 'télécharger mon CV',
    run(ctx) {
      if (ctx.data.cv) {
        say(ctx, 'Téléchargement du CV…', 'muted');
        ctx.effects.push({ type: 'download', url: ctx.data.cv });
      } else {
        say(ctx, 'Le CV arrive bientôt. En attendant : open dossier', 'muted');
        ctx.effects.push({ type: 'open', app: 'dossier' });
      }
    },
  },
  theme: {
    description: 'changer de thème',
    usage: 'theme clair|sombre',
    run(ctx) {
      const v = ctx.args[0]?.toLowerCase();
      const value = v === 'clair' || v === 'light' ? 'light' : v === 'sombre' || v === 'dark' ? 'dark' : null;
      if (!value) return say(ctx, 'Usage : theme clair | theme sombre', 'error');
      ctx.effects.push({ type: 'theme', value });
      say(ctx, `Thème ${value === 'light' ? 'clair' : 'sombre'} appliqué.`, 'muted');
    },
  },
  fastfetch: {
    description: 'résumé du système',
    run(ctx) {
      const d = ctx.data;
      const logo = [' ██      ', ' ██      ', ' ██      ', ' ██      ', ' ███████ ', '         '];
      const info = [
        `${d.firstName.toLowerCase()}@laura-os`,
        '────────────────',
        `OS      ${d.osName} 1.0 (navigateur)`,
        `Rôle    ${d.title}`,
        `Lieu    ${d.location}`,
        `Statut  ${d.availability}`,
        `Projets ${d.projects.map((p) => p.name).join(', ')}`,
        `Shell   démo, aucun accès réel`,
      ];
      // Écran étroit (téléphone) : pas de logo, pour que chaque ligne tienne.
      if ((ctx.state.columns ?? 80) < 64) {
        info.forEach((text, i) => ctx.out.push({ text, kind: i === 0 ? 'accent' : 'out' }));
        return;
      }
      const rows = Math.max(logo.length, info.length);
      for (let i = 0; i < rows; i++) {
        ctx.out.push({ lead: (logo[i] ?? '').padEnd(10), text: info[i] ?? '' });
      }
    },
  },
  history: {
    description: 'commandes déjà tapées',
    run(ctx) {
      ctx.state.history.forEach((h, i) => say(ctx, `${String(i + 1).padStart(4)}  ${h}`));
    },
  },
  date: {
    description: 'date et heure',
    run(ctx) {
      say(ctx, new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'short' }).format(new Date()));
    },
  },
  echo: {
    description: 'afficher un texte',
    usage: 'echo <texte>',
    run(ctx) {
      say(ctx, ctx.args.join(' '));
    },
  },
  uname: {
    description: 'informations système',
    run(ctx) {
      say(ctx, ctx.args.includes('-a') ? `${ctx.data.osName} 1.0 navigateur (shell de démonstration)` : ctx.data.osName);
    },
  },
  man: {
    description: "aide d'une commande",
    usage: 'man <commande>',
    run(ctx) {
      const c = ctx.args[0] ? commands[ctx.args[0]] : undefined;
      if (!c) return say(ctx, 'Usage : man <commande> (voir help)', 'error');
      say(ctx, `${c.usage ?? ctx.args[0]} — ${c.description}`);
    },
  },
  clear: {
    description: "effacer l'écran (Ctrl+L)",
    run(ctx) {
      ctx.effects.push({ type: 'clear' });
    },
  },
  exit: {
    description: 'fermer le terminal',
    run(ctx) {
      ctx.effects.push({ type: 'close' });
    },
  },
  sudo: {
    description: 'devenir administratrice',
    run(ctx) {
      say(ctx, "laura n'est pas dans le fichier sudoers. Cet incident ne sera pas signalé.", 'error');
      say(ctx, 'En revanche, une proposition de CDI serait accueillie avec plaisir : contact', 'muted');
    },
  },
  rm: {
    description: 'supprimer (désactivé)',
    run(ctx) {
      say(ctx, 'rm : système de fichiers en lecture seule. Rien ne sera supprimé ici.', 'error');
    },
  },
  ssh: {
    description: 'se connecter à distance (désactivé)',
    run(ctx) {
      say(ctx, "ssh : connexion refusée. Mon vrai homelab n'est pas exposé sur Internet, et c'est voulu.", 'error');
      say(ctx, 'Pourquoi : open homelab', 'muted');
    },
  },
  make: {
    description: 'rejouer le Makefile du homelab',
    usage: 'make [cible]',
    run(ctx) {
      const targets = ctx.data.makeTargets;
      const goal = ctx.args[0]?.toLowerCase();
      if (!goal) {
        say(ctx, 'Cibles du Makefile du homelab :', 'accent');
        say(ctx, `  ${'all'.padEnd(10)} enchaîne toutes les étapes ci-dessous`);
        for (const t of targets) say(ctx, `  ${t.name.padEnd(10)} ${t.role}`);
        say(ctx, `  ${'destroy'.padEnd(10)} supprime tout le cluster`);
        return;
      }
      if (goal === 'destroy') {
        say(ctx, 'make destroy : refusé. On ne détruit pas une infrastructure depuis un portfolio.', 'error');
        say(ctx, `Sur le vrai homelab : ${ctx.data.destroyLog.join(' ')}`, 'muted');
        return;
      }
      const selected = goal === 'all' ? targets : targets.filter((t) => t.name === goal);
      if (selected.length === 0) return say(ctx, `make: *** Aucune règle pour fabriquer la cible « ${goal} ».`, 'error');
      for (const t of selected) {
        say(ctx, `make ${t.name} (${t.tool})`, 'accent');
        say(ctx, `  ${t.role}`);
        for (const l of t.log) say(ctx, `  ${l}`, 'muted');
      }
      say(ctx, 'Extraits de journaux réels : rien n’est exécuté ici.', 'muted');
    },
  },
};

export const commandNames = Object.keys(commands);

/** Découpe une ligne en arguments, en respectant les guillemets simples et doubles. */
export function tokenize(line: string): string[] {
  const tokens: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) tokens.push(m[1] ?? m[2] ?? m[3] ?? '');
  return tokens;
}

export function createShell(data: TerminalData) {
  const root = buildFs(data);

  function run(line: string, state: ShellState): RunResult {
    const ctx: Ctx = { args: [], state, data, root, out: [], effects: [], cwd: state.cwd };
    const trimmed = line.trim();
    if (trimmed === '') return { lines: [], effects: [], cwd: state.cwd };

    if (/[|<>;&]/.test(trimmed)) {
      say(ctx, 'Ce shell de démonstration ne gère ni les tubes, ni les redirections, ni les enchaînements.', 'error');
      return { lines: ctx.out, effects: ctx.effects, cwd: ctx.cwd };
    }

    const [name, ...args] = tokenize(trimmed);
    const key = (name ?? '').toLowerCase();
    const cmd = key === 'neofetch' ? commands.fastfetch : commands[key];
    if (!cmd) {
      say(ctx, `${name} : commande introuvable. Tapez « help ».`, 'error');
    } else {
      ctx.args = args;
      cmd.run(ctx);
    }
    return { lines: ctx.out, effects: ctx.effects, cwd: ctx.cwd };
  }

  /** Propositions d'autocomplétion pour la ligne en cours. */
  function complete(line: string, state: ShellState): string[] {
    const endsWithSpace = /\s$/.test(line);
    const tokens = tokenize(line);
    if (tokens.length === 0) return [];
    if (tokens.length === 1 && !endsWithSpace) {
      return commandNames.filter((c) => c.startsWith(tokens[0]!.toLowerCase())).sort();
    }
    const cmd = tokens[0]!.toLowerCase();
    const current = endsWithSpace ? '' : tokens[tokens.length - 1]!;
    if (cmd === 'open') return data.apps.map((a) => a.id).filter((id) => id.startsWith(current));
    if (cmd === 'theme') return ['clair', 'sombre'].filter((v) => v.startsWith(current));
    if (cmd === 'make') return ['all', ...data.makeTargets.map((t) => t.name), 'destroy'].filter((v) => v.startsWith(current));
    if (cmd === 'man') return commandNames.filter((c) => c.startsWith(current));
    if (['cat', 'cd', 'ls'].includes(cmd)) {
      const slash = current.lastIndexOf('/');
      const dirPart = slash >= 0 ? current.slice(0, slash + 1) : '';
      const namePart = slash >= 0 ? current.slice(slash + 1) : current;
      const node = lookup(root, resolvePath(state.cwd, dirPart || '.'));
      if (!node || node.type !== 'dir') return [];
      return Object.entries(node.children)
        .filter(([n, child]) => n.startsWith(namePart) && (cmd !== 'cd' || child.type === 'dir'))
        .map(([n, child]) => dirPart + n + (child.type === 'dir' ? '/' : ''))
        .sort();
    }
    return [];
  }

  return { run, complete, prompt: (cwd: string) => `laura@laura-os:${displayPath(cwd)}$` };
}

export { HOME };
