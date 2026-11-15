// Guarda y lee los temporizadores en curso en el almacenamiento del dispositivo.
// Van aparte del historial de eventos, igual que el cronómetro: un temporizador corriendo no es algo que "ya pasó".
import { TIMERS_STORAGE_KEY } from '../../shared/constants.js';

/**
 * Crea las dos funciones de la capa de datos para los temporizadores.
 *
 * @param {{getItem: Function, setItem: Function}} storage - Dónde se guardan los datos.
 * @returns {{getTimers: Function, saveTimers: Function}} Funciones asíncronas.
 */
export function createTimerFunctions(storage) {
  return {
    /** @returns {Promise<Array<{id: string, label: string, durationMs: number, endsAt: number}>>} Los temporizadores guardados. */
    async getTimers() {
      const savedText = storage.getItem(TIMERS_STORAGE_KEY);
      return savedText === null ? [] : JSON.parse(savedText);
    },

    /**
     * Guarda la lista completa de temporizadores (reemplaza la anterior).
     *
     * @param {Array<{id: string, label: string, durationMs: number, endsAt: number}>} timers - La lista nueva.
     * @returns {Promise<void>}
     */
    async saveTimers(timers) {
      storage.setItem(TIMERS_STORAGE_KEY, JSON.stringify(timers));
    },
  };
}
