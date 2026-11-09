/**
 * Partie « navigateur » du terminal : affichage, saisie, historique, autocomplétion.
 * Toute la logique des commandes est dans commands.ts.
 *
 * Sécurité : le texte est toujours inséré avec textContent (jamais innerHTML),
 * donc rien de ce qui est tapé ne peut être interprété comme du HTML.
 */
import { createShell, HOME } from './commands';
import type { Effect, Line, ShellState, TerminalData } from './types';

const MAX_LINES = 400;

export function mountTerminal(root: HTMLElement): void {
  const dataEl = root.querySelector<HTMLScriptElement>('script[data-terminal-data]');
  const output = root.querySelector<HTMLElement>('[data-term-output]');
  const form = root.querySelector<HTMLFormElement>('[data-term-form]');
  const input = root.querySelector<HTMLInputElement>('[data-term-input]');
  const promptEl = root.querySelector<HTMLElement>('[data-term-prompt]');
  if (!dataEl || !output || !form || !input || !promptEl) return;

  const data = JSON.parse(dataEl.textContent ?? '{}') as TerminalData;
  const shell = createShell(data);
  const state: ShellState = { cwd: HOME, history: [] };
  let historyIndex = -1;

  const print = (lines: Line[]) => {
    const frag = document.createDocumentFragment();
    for (const line of lines) {
      const div = document.createElement('div');
      div.className = `term__l term__l--${line.kind ?? 'out'}`;
      if (line.lead) {
        const lead = document.createElement('span');
        lead.className = 'term__lead';
        lead.textContent = line.lead;
        div.append(lead);
      }
      div.append(document.createTextNode(line.text === '' && !line.lead ? ' ' : line.text));
      frag.append(div);
    }
    output.append(frag);
    while (output.childElementCount > MAX_LINES) output.firstElementChild?.remove();
    output.scrollTop = output.scrollHeight;
  };

  const updatePrompt = () => {
    promptEl.textContent = shell.prompt(state.cwd);
  };

  const apply = (effect: Effect) => {
    switch (effect.type) {
      case 'clear':
        output.replaceChildren();
        break;
      case 'open':
        window.dispatchEvent(new CustomEvent('os:open', { detail: { id: effect.app } }));
        break;
      case 'close':
        window.dispatchEvent(new CustomEvent('os:close', { detail: { id: 'terminal' } }));
        break;
      case 'theme':
        window.dispatchEvent(new CustomEvent('os:theme', { detail: { value: effect.value } }));
        break;
      case 'download': {
        const a = document.createElement('a');
        a.href = effect.url;
        a.download = '';
        a.click();
        break;
      }
    }
  };

  const execute = (line: string, echo = true) => {
    if (echo) print([{ text: `${shell.prompt(state.cwd)} ${line}`, kind: 'command' }]);
    if (line.trim()) {
      state.history.push(line);
      if (state.history.length > 100) state.history.shift();
    }
    historyIndex = -1;
    state.columns = Math.floor((output.clientWidth - 32) / 8.2) || 80;
    const result = shell.run(line, state);
    state.cwd = result.cwd;
    print(result.lines);
    result.effects.forEach(apply);
    updatePrompt();
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const line = input.value;
    input.value = '';
    execute(line);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      if (state.history.length === 0) return;
      event.preventDefault();
      if (event.key === 'ArrowUp') {
        historyIndex = historyIndex < 0 ? state.history.length - 1 : Math.max(0, historyIndex - 1);
      } else {
        historyIndex = historyIndex < 0 ? -1 : historyIndex + 1;
        if (historyIndex >= state.history.length) historyIndex = -1;
      }
      input.value = historyIndex < 0 ? '' : (state.history[historyIndex] ?? '');
      return;
    }
    if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault();
      output.replaceChildren();
      return;
    }
    // Tab complète seulement si la ligne n'est pas vide : sinon Tab sert à sortir du champ (accessibilité clavier).
    if (event.key === 'Tab' && !event.shiftKey && input.value.trim() !== '') {
      const candidates = shell.complete(input.value, state);
      if (candidates.length === 0) return;
      event.preventDefault();
      const prefix = commonPrefix(candidates);
      const base = input.value.replace(/\S*$/, '');
      if (candidates.length === 1) {
        const single = candidates[0]!;
        input.value = base + single + (single.endsWith('/') ? '' : ' ');
      } else if (prefix && base + prefix !== input.value) {
        input.value = base + prefix;
      } else {
        print([{ text: candidates.join('   '), kind: 'muted' }]);
      }
    }
  });

  // Boutons de commandes rapides
  root.querySelectorAll<HTMLButtonElement>('[data-cmd]').forEach((btn) => {
    btn.addEventListener('click', () => {
      execute(btn.dataset.cmd ?? '');
      input.focus();
    });
  });

  // Un clic dans la zone de sortie donne le focus à la saisie (sauf si on sélectionne du texte).
  output.addEventListener('click', () => {
    if (!window.getSelection()?.toString()) input.focus();
  });

  updatePrompt();
  intro();

  /**
   * Accueil : la commande « fastfetch » se tape toute seule, pour montrer l'idée sans rien demander au visiteur.
   * Si le système demande de réduire les animations, elle s'affiche directement.
   */
  function intro() {
    const command = 'fastfetch';
    const finish = () => {
      execute(command, false);
      print([{ text: '' }, { text: 'Shell de démonstration : tapez « help », ou touchez une commande ci-dessous.', kind: 'muted' }]);
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      print([{ text: `${shell.prompt(state.cwd)} ${command}`, kind: 'command' }]);
      finish();
      return;
    }
    const line = document.createElement('div');
    line.className = 'term__l term__l--command';
    line.textContent = `${shell.prompt(state.cwd)} `;
    output!.append(line);
    let i = 0;
    const tick = () => {
      if (i < command.length) {
        line.textContent += command[i++];
        window.setTimeout(tick, 70);
      } else {
        window.setTimeout(finish, 180);
      }
    };
    window.setTimeout(tick, 450);
  }
}

function commonPrefix(values: string[]): string {
  if (values.length === 0) return '';
  let prefix = values[0]!;
  for (const v of values.slice(1)) {
    while (!v.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}
