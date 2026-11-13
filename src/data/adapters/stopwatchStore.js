// Guarda y lee los cronómetros en curso en el almacenamiento del dispositivo.
// Van aparte del historial de eventos: un cronómetro corriendo no es algo que "ya pasó".
import { STOPWATCH_STORAGE_KEY } from '../../shared/constants.js';

/**
 * Crea las dos funciones de la capa de datos para el cronómetro.
 *
 * @param {{getItem: Function, setItem: Function}} storage - Dónde se guardan los datos.
 * @returns {{getStopwatch: Function, saveStopwatch: Function}} Funciones asíncronas.
 */
export function createStopwatchFunctions(storage) {
  /** Lee todos los cronómetros guardados, como un objeto { processId: cronómetro }. */
  function readAll() {
    const savedText = storage.getItem(STOPWATCH_STORAGE_KEY);
    return savedText === null ? {} : JSON.parse(savedText);
  }

  return {
    /**
     * @param {string} processId - El id del proceso.
     * @returns {Promise<{accumulatedMs: number, startedAt: number|null}|null>}
     *   El cronómetro guardado de ese proceso, o null si no hay ninguno.
     */
    async getStopwatch(processId) {
      return readAll()[processId] ?? null;
    },

    /**
     * Guarda el cronómetro de un proceso, o lo borra si se manda null (al reiniciar o terminar).
     *
     * @param {string} processId - El id del proceso.
     * @param {{accumulatedMs: number, startedAt: number|null}|null} stopwatch - El estado a guardar.
     * @returns {Promise<void>}
     */
    async saveStopwatch(processId, stopwatch) {
      const all = readAll();
      if (stopwatch === null) delete all[processId];
      else all[processId] = stopwatch;
      storage.setItem(STOPWATCH_STORAGE_KEY, JSON.stringify(all));
    },
  };
}
