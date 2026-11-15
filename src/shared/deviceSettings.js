// Aplica los ajustes del dispositivo a la página: colores, tamaño de letra y movimiento.
// Lo hace poniendo atributos en <html> (data-theme, data-text-size, data-motion) que el CSS lee;
// así ningún componente tiene que saber de ajustes, y el aviso del temporizador sabe si debe sonar.
import { DEFAULT_SETTINGS } from './constants.js';

const DARK_QUERY = '(prefers-color-scheme: dark)';

let currentSettings = DEFAULT_SETTINGS;
let stopFollowingDevice = null; // quita el "escuchar" al dispositivo cuando el tema deja de ser automático

/**
 * Decide qué colores usar. "auto" pregunta al dispositivo si está en modo oscuro.
 *
 * @param {string} theme - 'dark', 'light' o 'auto'.
 * @returns {'dark'|'light'} El tema que de verdad se pinta.
 */
function resolveTheme(theme) {
  if (theme !== 'auto') return theme;
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

/**
 * Pinta el tema y le pasa al navegador el color de la barra de arriba (theme-color),
 * leído de la variable --color-surface para no repetir colores fuera del CSS.
 *
 * @param {string} theme - 'dark', 'light' o 'auto'.
 */
function paintTheme(theme) {
  const root = document.documentElement;
  root.dataset.theme = resolveTheme(theme);
  const surfaceColor = getComputedStyle(root).getPropertyValue('--color-surface').trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', surfaceColor);
}

/**
 * Aplica los ajustes a la página y los recuerda.
 *
 * @param {{theme: string, textSize: string, timerSound: boolean, motion: boolean}} settings - Los ajustes.
 */
export function applySettings(settings) {
  currentSettings = settings;
  const root = document.documentElement;
  root.dataset.textSize = settings.textSize;
  root.dataset.motion = settings.motion ? 'on' : 'off';
  paintTheme(settings.theme);

  // Con "auto", si el teléfono cambia a modo oscuro (por ejemplo, al anochecer) la app cambia con él.
  stopFollowingDevice?.();
  stopFollowingDevice = null;
  if (settings.theme === 'auto') {
    const query = window.matchMedia(DARK_QUERY);
    const repaint = () => paintTheme('auto');
    query.addEventListener('change', repaint);
    stopFollowingDevice = () => query.removeEventListener('change', repaint);
  }
}

/** @returns {boolean} Si el aviso de los temporizadores debe sonar. */
export function isTimerSoundOn() {
  return currentSettings.timerSound;
}
