// Avisa que algo terminó con un pitido y una vibración, cuando el dispositivo lo permite.
import { BEEP, VIBRATION_PATTERN_MS } from './constants.js';

/**
 * Reproduce un pitido corto y hace vibrar el dispositivo. Todo es "si se puede": muchos
 * dispositivos bloquean el sonido o no vibran, y la pantalla siempre muestra el aviso por escrito.
 */
export function alertTimerDone() {
  try {
    navigator.vibrate?.(VIBRATION_PATTERN_MS);
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = BEEP.frequencyHz;
    gain.gain.value = BEEP.volume;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + BEEP.seconds);
    oscillator.onended = () => context.close();
  } catch {
    // Sin sonido: no pasa nada, el aviso escrito sigue en pantalla.
  }
}
