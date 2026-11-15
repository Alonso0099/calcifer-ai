// Adaptador "local": implementa las funciones de la capa de datos leyendo el contenido
// de los JSON y guardando los eventos en el propio dispositivo.
import { DONE_BY_OPTIONS, EVENT_TYPES } from '../../shared/constants.js';
import { getCheckedStepIds, getLastDoneIso, getLastUndoableEvent } from '../../lib/events.js';
import { processMatchesSearch } from '../../lib/searchText.js';
import { createBackupFunctions } from './backupFunctions.js';
import { createEventStore } from './eventStore.js';
import { createFreezerFunctions } from './freezerFunctions.js';
import { createMealPlanFunctions } from './mealPlanFunctions.js';
import { createNoteFunctions } from './noteFunctions.js';
import { createProgressFunctions } from './progressFunctions.js';
import { createShoppingFunctions } from './shoppingFunctions.js';
import { createStopwatchFunctions } from './stopwatchStore.js';
import { createTimerFunctions } from './timerStore.js';

/**
 * Crea el adaptador local. Todas sus funciones son "async" (regresan una promesa)
 * aunque aquí no haría falta: una base de datos futura sí responde con promesas, y
 * así los componentes ya usan "await" y no tendrán que cambiar ese día.
 *
 * @param {object} options
 * @param {{getItem: Function, setItem: Function}} options.storage - Dónde se guardan los
 *   eventos (localStorage en la app; uno falso en las pruebas).
 * @param {{processes: object[], week: object, zones: object[], freezer: object}} options.content - El contenido de los JSON.
 * @returns {object} Las funciones de la tabla "Regla 2" de CLAUDE.md.
 */
export function createLocalAdapter({ storage, content }) {
  const store = createEventStore(storage);
  const activeProcesses = content.processes.filter((process) => process.active);

  /** Busca un proceso por id y avisa con un error si no existe. */
  function requireProcess(processId) {
    const process = content.processes.find((candidate) => candidate.id === processId);
    if (!process) throw new Error(`No existe el proceso "${processId}"`);
    return process;
  }

  const stopwatchFunctions = createStopwatchFunctions(storage);
  const timerFunctions = createTimerFunctions(storage);

  return {
    // getStopwatch y saveStopwatch viven en su propio archivo porque no usan eventos.
    ...stopwatchFunctions,
    // getTimers y saveTimers (temporizadores del modo paso a paso) tampoco usan eventos.
    ...timerFunctions,
    // Notas (getNotes, saveNote, deleteNote) y respaldo (exportBackup, importBackup), cada uno en su archivo.
    ...createNoteFunctions(store, requireProcess),
    ...createBackupFunctions(store),
    // getInProgress y discardProgress juntan historial, cronómetros y temporizadores.
    ...createProgressFunctions({ store, stopwatches: stopwatchFunctions, timers: timerFunctions, processes: activeProcesses, requireProcess }),
    // getMealPlan y planMeal (el menú) también viven aparte.
    ...createMealPlanFunctions(store, requireProcess),
    // Las funciones del congelador (getFreezer, saveFreezerItem...) también viven aparte.
    ...createFreezerFunctions(store, content.freezer),
    // Las funciones de compras (getShoppingState, addShoppingItem...) también viven aparte.
    ...createShoppingFunctions(store),

    /** @returns {Promise<object[]>} Todos los procesos activos. */
    async getProcesses() {
      return activeProcesses;
    },

    /**
     * @param {string} id - El id del proceso.
     * @returns {Promise<object|null>} El proceso con sus pasos, cada uno con "checked"
     *   (si está marcado ahora), o null si el id no existe.
     */
    async getProcess(id) {
      const process = content.processes.find((candidate) => candidate.id === id);
      if (!process) return null;
      const checkedStepIds = getCheckedStepIds(store.readEvents(), id);
      const steps = process.steps.map((step) => ({ ...step, checked: checkedStepIds.has(step.id) }));
      return { ...process, steps };
    },

    /**
     * @param {string} text - Lo que escribió el usuario.
     * @returns {Promise<object[]>} Los procesos activos cuyo nombre, pasos o ingredientes coinciden.
     */
    async searchProcesses(text) {
      return activeProcesses.filter((process) => processMatchesSearch(process, text));
    },

    /** @returns {Promise<Array<{id: string, name: string}>>} Las zonas de la cocina. */
    async getZones() {
      return content.zones;
    },

    /** @returns {Promise<object>} La semana tipo; cada bloque incluye el nombre de su proceso. */
    async getWeekPlan() {
      const days = content.week.days.map((day) => ({
        ...day,
        blocks: day.blocks.map((block) => ({ ...block, processName: requireProcess(block.processId).name })),
      }));
      return { ...content.week, days };
    },

    /**
     * Marca un paso si estaba sin marcar, o lo desmarca si estaba marcado.
     *
     * @param {string} processId - El id del proceso.
     * @param {string} stepId - El id del paso.
     * @returns {Promise<boolean>} true si el paso quedó marcado.
     */
    async toggleStep(processId, stepId) {
      const process = requireProcess(processId);
      if (!process.steps.some((step) => step.id === stepId)) throw new Error(`No existe el paso "${stepId}"`);
      const wasChecked = getCheckedStepIds(store.readEvents(), processId).has(stepId);
      store.appendEvent(wasChecked ? EVENT_TYPES.stepUnchecked : EVENT_TYPES.stepChecked, { processId, stepId });
      return !wasChecked;
    },

    /**
     * @param {string} processId - El id del proceso.
     * @param {number} minutes - Los minutos reales que tardó.
     * @param {string|null} [doneBy] - "Nano", "Tita" o "Ambos". Solo es una nota de historial.
     * @returns {Promise<object>} El evento guardado.
     */
    async finishProcess(processId, minutes, doneBy = null) {
      requireProcess(processId);
      if (doneBy !== null && !DONE_BY_OPTIONS.includes(doneBy)) throw new Error(`doneBy inválido: "${doneBy}"`);
      return store.appendEvent(EVENT_TYPES.processFinished, { processId, minutes, doneBy });
    },

    /**
     * @param {string} processId - El id del proceso.
     * @returns {Promise<string|null>} Fecha ISO de la última vez que se terminó, o null.
     */
    async getLastDone(processId) {
      return getLastDoneIso(store.readEvents(), processId);
    },

    /** @returns {Promise<object|null>} El evento que se anuló, o null si no había nada. */
    async undoLastEvent() {
      const lastEvent = getLastUndoableEvent(store.readEvents());
      if (lastEvent) store.appendEvent(EVENT_TYPES.eventUndone, { targetEventId: lastEvent.id });
      return lastEvent;
    },

  };
}
