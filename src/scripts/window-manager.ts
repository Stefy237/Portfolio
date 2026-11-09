/**
 * Gestionnaire de fenêtres du bureau.
 *
 * - Tout élément [data-open="<id>"] ouvre la fenêtre correspondante (icônes, dock, liens internes).
 *   Ces éléments sont des liens vers la version simple : sans JavaScript, ils restent utilisables.
 * - Fenêtres : premier plan au clic, déplacement par la barre de titre, redimensionnement par le coin,
 *   agrandissement (bouton ou double-clic sur la barre), fermeture (bouton ou Échap).
 * - Lien direct : /#projets ouvre la fenêtre Projets.
 * - Sous 768 px de large : pas de déplacement, les fenêtres s'ouvrent en cartes empilées (léger décalage),
 *   et « agrandir » les passe en plein écran.
 * - Événements écoutés (envoyés par le terminal) : os:open et os:close, avec { detail: { id } }.
 */

const MOBILE = window.matchMedia('(max-width: 767px)');
const MARGIN = 8;
const MENUBAR = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--menubar-h'), 10);
const DOCK_SPACE = 104;
/** Sur téléphone, décalage maximal (en crans) de la pile de fenêtres. */
const MAX_CASCADE = 3;

type Win = {
  id: string;
  el: HTMLElement;
  bar: HTMLElement;
  placed: boolean;
  opener: HTMLElement | null;
};

const windows = new Map<string, Win>();
let zTop = 20;

function viewport() {
  return { w: window.innerWidth, h: window.innerHeight };
}

/** Place une fenêtre selon sa géométrie par défaut, réduite si l'écran est plus petit que prévu. */
function place(win: Win): void {
  const { w: vw, h: vh } = viewport();
  const d = win.el.dataset;
  const maxW = vw - 2 * MARGIN;
  const maxH = vh - MENUBAR - DOCK_SPACE - MARGIN;
  // Les positions par défaut sont pensées pour 1440×900 : on les met à l'échelle de l'écran réel.
  const sx = Math.min(1, vw / 1440);
  const sy = Math.min(1, vh / 900);
  const w = Math.min(Number(d.w) || 560, maxW);
  const h = Math.min(Number(d.h) || 460, maxH);
  const x = clamp(Math.round((Number(d.x) || 200) * sx), MARGIN, vw - w - MARGIN);
  // La fenêtre ne recouvre pas le dock à l'ouverture.
  const y = clamp(Math.round((Number(d.y) || 80) * sy), MENUBAR + MARGIN, vh - DOCK_SPACE - h);
  Object.assign(win.el.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
  win.placed = true;
}

/** Garde la barre de titre atteignable après un redimensionnement de l'écran. */
function keepInside(win: Win): void {
  if (!win.placed) return;
  const { w: vw, h: vh } = viewport();
  const rect = win.el.getBoundingClientRect();
  const width = Math.min(rect.width, vw - 2 * MARGIN);
  const left = clamp(rect.left, MARGIN - width + 120, vw - 120);
  const top = clamp(rect.top, MENUBAR, vh - 48);
  Object.assign(win.el.style, { left: `${left}px`, top: `${top}px`, width: `${width}px` });
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(v, Math.max(min, max)));
}

function focusWin(win: Win): void {
  zTop += 1;
  if (zTop > 8000) normalizeZ();
  win.el.style.zIndex = String(zTop);
  windows.forEach((w) => w.el.classList.toggle('is-focused', w === win));
}

/** Évite que les z-index dépassent le dock après de très nombreux clics. */
function normalizeZ(): void {
  const sorted = [...windows.values()].sort((a, b) => Number(a.el.style.zIndex) - Number(b.el.style.zIndex));
  zTop = 20;
  sorted.forEach((w) => {
    zTop += 1;
    w.el.style.zIndex = String(zTop);
  });
}

function syncLaunchers(): void {
  document.querySelectorAll<HTMLElement>('[data-open]').forEach((el) => {
    const win = windows.get(el.dataset.open ?? '');
    el.classList.toggle('is-open', !!win && !win.el.hidden);
  });
}

function topmostOpen(): Win | null {
  let best: Win | null = null;
  windows.forEach((w) => {
    if (w.el.hidden) return;
    if (!best || Number(w.el.style.zIndex) > Number(best.el.style.zIndex)) best = w;
  });
  return best;
}

export function openWindow(id: string, opener: HTMLElement | null = null, moveFocus = true): void {
  const win = windows.get(id);
  if (!win) return;
  const wasHidden = win.el.hidden;
  if (wasHidden) {
    win.el.hidden = false;
    if (!MOBILE.matches && !win.placed) place(win);
    // Sur téléphone, chaque fenêtre ouverte par-dessus une autre est un peu plus basse.
    const others = [...windows.values()].filter((w) => w !== win && !w.el.hidden).length;
    win.el.style.setProperty('--cascade', String(Math.min(others, MAX_CASCADE)));
    win.el.classList.add('is-opening');
    win.el.addEventListener('animationend', () => win.el.classList.remove('is-opening'), { once: true });
    if (opener) win.opener = opener;
  }
  focusWin(win);
  if (moveFocus) {
    const field = win.el.querySelector<HTMLElement>('[data-term-input]');
    (field ?? win.el).focus({ preventScroll: true });
  }
  if (MOBILE.matches) document.body.classList.add('has-open-window');
  history.replaceState(null, '', `#${id}`);
  syncLaunchers();
}

export function closeWindow(id: string): void {
  const win = windows.get(id);
  if (!win || win.el.hidden) return;
  win.el.hidden = true;
  win.el.classList.remove('is-focused');
  const next = topmostOpen();
  if (next) focusWin(next);
  else {
    document.body.classList.remove('has-open-window');
    history.replaceState(null, '', location.pathname + location.search);
  }
  const back = win.opener && document.contains(win.opener) ? win.opener : null;
  (back ?? (next?.el as HTMLElement | undefined) ?? document.querySelector<HTMLElement>('.desktop__icons a'))?.focus({
    preventScroll: true,
  });
  syncLaunchers();
}

function toggleMaximize(win: Win): void {
  const on = win.el.classList.toggle('is-maximized');
  win.el.querySelector('[data-action="maximize"]')?.setAttribute('aria-pressed', String(on));
}

function enableDrag(win: Win): void {
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;
  let dragging = false;

  win.bar.addEventListener('pointerdown', (e) => {
    if (MOBILE.matches || e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button')) return;
    if (win.el.classList.contains('is-maximized')) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = win.el.getBoundingClientRect();
    originX = rect.left;
    originY = rect.top;
    win.bar.setPointerCapture(e.pointerId);
    win.el.classList.add('is-dragging');
  });

  win.bar.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const { w: vw, h: vh } = viewport();
    const width = win.el.offsetWidth;
    // La barre de titre reste toujours au moins partiellement visible.
    const left = clamp(originX + e.clientX - startX, 120 - width, vw - 120);
    const top = clamp(originY + e.clientY - startY, MENUBAR, vh - 48);
    win.el.style.left = `${left}px`;
    win.el.style.top = `${top}px`;
  });

  const stop = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    win.el.classList.remove('is-dragging');
    if (win.bar.hasPointerCapture(e.pointerId)) win.bar.releasePointerCapture(e.pointerId);
  };
  win.bar.addEventListener('pointerup', stop);
  win.bar.addEventListener('pointercancel', stop);

  win.bar.addEventListener('dblclick', (e) => {
    if ((e.target as HTMLElement).closest('button')) return;
    toggleMaximize(win);
  });
}

export function initWindowManager(): void {
  document.querySelectorAll<HTMLElement>('[data-window]').forEach((el) => {
    const bar = el.querySelector<HTMLElement>('[data-drag]');
    if (!bar) return;
    const win: Win = { id: el.dataset.window!, el, bar, placed: false, opener: null };
    windows.set(win.id, win);

    el.addEventListener('pointerdown', () => focusWin(win));
    el.addEventListener('focusin', () => {
      if (!el.classList.contains('is-focused')) focusWin(win);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeWindow(win.id);
      }
    });
    el.querySelectorAll<HTMLElement>('[data-action="close"]').forEach((b) => b.addEventListener('click', () => closeWindow(win.id)));
    el.querySelector<HTMLElement>('[data-action="maximize"]')?.addEventListener('click', () => toggleMaximize(win));
    enableDrag(win);
  });

  // Délégation : n'importe quel [data-open] ouvre sa fenêtre (si elle existe sur la page).
  document.addEventListener('click', (e) => {
    const launcher = (e.target as HTMLElement).closest<HTMLElement>('[data-open]');
    if (!launcher) return;
    const id = launcher.dataset.open ?? '';
    if (!windows.has(id)) return; // pas de fenêtre : le lien vers la version simple s'applique
    e.preventDefault();
    openWindow(id, launcher);
  });

  window.addEventListener('os:open', (e) => {
    const id = (e as CustomEvent<{ id: string }>).detail?.id;
    if (id) openWindow(id);
  });
  window.addEventListener('os:close', (e) => {
    const id = (e as CustomEvent<{ id: string }>).detail?.id;
    if (id) closeWindow(id);
  });

  // Un lien interne du type <a href="#projets"> ouvre aussi la fenêtre.
  window.addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    if (windows.has(id)) openWindow(id);
  });

  window.addEventListener('resize', () => windows.forEach(keepInside));
  MOBILE.addEventListener('change', () => {
    windows.forEach((w) => {
      if (!MOBILE.matches && !w.el.hidden && !w.placed) place(w);
    });
    if (!MOBILE.matches) document.body.classList.remove('has-open-window');
  });

  // Fenêtres à ouvrir au démarrage
  const fromHash = location.hash.slice(1);
  if (fromHash && windows.has(fromHash)) {
    openWindow(fromHash, null, false);
  } else if (!MOBILE.matches) {
    // Ouvert au démarrage sur ordinateur (le terminal), pour comprendre l'idée tout de suite.
    // Sur téléphone, l'écran d'accueil reste visible : carte de présentation, post-it et icônes.
    document
      .querySelectorAll<HTMLElement>('[data-window][data-open-on-start]')
      .forEach((el) => openWindow(el.dataset.window!, null, false));
    history.replaceState(null, '', location.pathname + location.search);
  }
}
