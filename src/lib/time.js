// Funciones puras sobre tiempos: qué tiempo mostrar de un proceso y cuentas del cronómetro.
import { MS_PER_MINUTE, MS_PER_SECOND } from '../shared/constants.js';

/**
 * Decide qué tiempo se muestra de un proceso. Si todos sus pasos están medidos, es la
 * suma (tiempo real); si no, el rango estimado del manual; si tampoco existe, pendiente.
 *
 * @param {{steps: Array<{minutes: number|null}>, estimatedMinutes: {min: number, max: number}|null}} process
 * @returns {{kind: 'measured', minutes: number} | {kind: 'estimated', min: number, max: number} | {kind: 'pending'}}
 */
export function getProcessTime(process) {
  const allStepsMeasured = process.steps.length > 0 && process.steps.every((step) => step.minutes !== null);
  if (allStepsMeasured) {
    const minutes = process.steps.reduce((total, step) => total + step.minutes, 0);
    return { kind: 'measured', minutes };
  }
  if (process.estimatedMinutes !== null) return { kind: 'estimated', ...process.estimatedMinutes };
  return { kind: 'pending' };
}

/**
 * Convierte el tiempo del cronómetro en texto de reloj: "07:05", o "1:07:05" si pasa de una hora.
 *
 * @param {number} elapsedMs - Milisegundos transcurridos.
 * @returns {string} El tiempo listo para mostrarse.
 */
export function formatStopwatch(elapsedMs) {
  const totalSeconds = Math.floor(elapsedMs / MS_PER_SECOND);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const twoDigits = (value) => String(value).padStart(2, '0');
  const clock = `${twoDigits(minutes)}:${twoDigits(seconds)}`;
  return hours > 0 ? `${hours}:${clock}` : clock;
}

/**
 * Convierte el tiempo del cronómetro en los minutos que se registran al terminar.
 * Redondea al minuto más cercano y nunca regresa menos de 1: un proceso hecho
 * no puede quedar registrado con 0 minutos.
 *
 * @param {number} elapsedMs - Milisegundos transcurridos.
 * @returns {number} Minutos enteros, mínimo 1.
 */
export function getMinutesFromElapsed(elapsedMs) {
  return Math.max(1, Math.round(elapsedMs / MS_PER_MINUTE));
}
