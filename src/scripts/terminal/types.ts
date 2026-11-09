/** Données transmises au terminal (sérialisées en JSON dans la page au build). */
export interface TerminalData {
  name: string;
  firstName: string;
  title: string;
  location: string;
  availability: string;
  email: string;
  osName: string;
  links: { github: string; linkedin: string; malt: string };
  cv: string | null;
  projects: {
    slug: string;
    name: string;
    summary: string;
    description: string;
    stack: string[];
    links: { label: string; url: string }[];
  }[];
  certifications: { name: string; status: string; targetDate: string | null }[];
  /** Applications ouvrables avec la commande « open ». */
  apps: { id: string; label: string }[];
  /** Cibles du Makefile du homelab, rejouées par la commande « make ». */
  makeTargets: { name: string; tool: string; role: string; log: string[] }[];
  destroyLog: string[];
}

export type LineKind = 'out' | 'muted' | 'accent' | 'error' | 'command';

export interface Line {
  text: string;
  kind?: LineKind;
  /** Préfixe affiché en couleur d'accent avant le texte (logo de fastfetch). */
  lead?: string;
}

export type Effect =
  | { type: 'clear' }
  | { type: 'open'; app: string }
  | { type: 'theme'; value: 'light' | 'dark' }
  | { type: 'close' }
  | { type: 'download'; url: string };

export interface ShellState {
  cwd: string;
  history: string[];
  /** Largeur du terminal en caractères (adapte fastfetch aux petits écrans). */
  columns?: number;
}

export interface RunResult {
  lines: Line[];
  effects: Effect[];
  cwd: string;
}
