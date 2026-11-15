// El aviso de un temporizador: sonido, vibración (donde se pueda) y una prueba de sonido.
// Safari y Chrome solo dejan sonar audio que "nace" de un toque: por eso el sonido se prepara
// en el toque que pone el temporizador, y al terminar se reusa ese mismo audio ya permitido.
import { createBeepWav } from '../lib/wav.js';
import { BEEP, VIBRATION_PATTERN_MS } from './constants.js';

let alertAudio = null; // el reproductor de audio, creado una sola vez

/** Crea el reproductor con los pitidos generados en la app, si todavía no existe. */
function getAlertAudio() {
  if (!alertAudio) {
    const fileUrl = URL.createObjectURL(new Blob([createBeepWav(BEEP)], { type: 'audio/wav' }));
    alertAudio = new Audio(fileUrl);
  }
  return alertAudio;
}

/**
 * Prepara el sonido para que pueda sonar después sin un toque. Se llama dentro de un toque
 * (al poner un temporizador): reproduce el audio sin volumen un instante y lo detiene.
 */
export function unlockAlertSound() {
  try {
    const audio = getAlertAudio();
    audio.muted = true;
    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      })
      .catch(() => {
        audio.muted = false;
      });
  } catch {
    // Si el dispositivo no deja preparar el sonido, queda el aviso escrito.
  }
}

/** Reproduce los pitidos desde el principio. Si el dispositivo lo bloquea, no pasa nada. */
function playBeeps() {
  try {
    const audio = getAlertAudio();
    audio.muted = false;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {
    // Sin sonido: el aviso escrito sigue en pantalla.
  }
}

/**
 * Avisa que terminó un temporizador: pitidos y vibración. La vibración no existe en Safari
 * de iPhone y iPad (Apple no la permite a las páginas web), así que ahí solo suena.
 */
export function alertTimerDone() {
  navigator.vibrate?.(VIBRATION_PATTERN_MS);
  playBeeps();
}

/** Prueba de sonido para el botón "Probar sonido": al ser un toque, también deja el sonido listo. */
export function playTestSound() {
  playBeeps();
}
