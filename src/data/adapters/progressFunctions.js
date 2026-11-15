// Las funciones de la capa de datos para lo que está "en curso": verlo todo junto y descartarlo.
import { EVENT_TYPES } from '../../shared/constants.js';
import { getInProgressSessions } from '../../lib/inProgress.js';

/**
 * Crea las funciones de "en curso". Usan el historial, los cronómetros y los temporizadores juntos.
 *
 * @param {object} deps
 * @param {{readEvents: Function, appendEvent: Function}} deps.store - El almacén de eventos.
 * @param {{getAllStopwatches: Function, saveStopwatch: Function}} deps.stopwatches - Las funciones del cronómetro.
 * @param {{getTimers: Function, saveTimers: Function}} deps.timers - Las funciones de los temporizadores.
 * @param {object[]} deps.processes - Los procesos del contenido.
 * @param {(processId: string) => object} deps.requireProcess - Busca un proceso o lanza un error.
 * @returns {{getInProgress: Function, discardProgress: Function}} Funciones asíncronas.
 */
export function createProgressFunctions({ store, stopwatches, timers, processes, requireProcess }) {
  return {
    /**
     * @returns {Promise<object[]>} Los procesos empezados y no terminados (ver getInProgressSessions).
     */
    async getInProgress() {
      return getInProgressSessions({
        events: store.readEvents(),
        stopwatches: await stopwatches.getAllStopwatches(),
        timers: await timers.getTimers(),
        processes,
        now: Date.now(),
      });
    },

    /**
     * Descarta lo empezado de un proceso: desmarca sus pasos (un solo evento, que Deshacer revierte
     * de un toque), pone su cronómetro en cero y quita sus temporizadores. Nunca borra el proceso,
     * sus pasos ni el historial.
     *
     * @param {string} processId - El id del proceso.
     * @returns {Promise<void>}
     */
    async discardProgress(processId) {
      requireProcess(processId);
      store.appendEvent(EVENT_TYPES.processDiscarded, { processId });
      await stopwatches.saveStopwatch(processId, null);
      const remaining = (await timers.getTimers()).filter((timer) => timer.processId !== processId);
      await timers.saveTimers(remaining);
    },
  };
}
