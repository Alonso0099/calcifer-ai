// Adaptador "local": implementa las funciones de la capa de datos leyendo el contenido
// de los JSON y guardando los eventos en el propio dispositivo.
import { DONE_BY_OPTIONS, EVENT_TYPES } from '../../shared/constants.js';
import { getCheckedStepIds, getLastDoneIso, getLastUndoableEvent } from '../../lib/events.js';
import { getCurrentNotes } from '../../lib/notes.js';
import { processMatchesSearch } from '../../lib/searchText.js';
import { buildBackup, parseBackup } from '../../lib/backup.js';
import { createEventStore } from './eventStore.js';
import { createStopwatchFunctions } from './stopwatchStore.js';

/**
 * Crea el adaptador local. Todas sus funciones son "async" (regresan una promesa)
 * aunque aquí no haría falta: una base de datos futura sí responde con promesas, y
 * así los componentes ya usan "await" y no tendrán que cambiar ese día.
 *
 * @param {object} options
 * @param {{getItem: Function, setItem: Function}} options.storage - Dónde se guardan los
 *   eventos (localStorage en la app; uno falso en las pruebas).
 * @param {{processes: object[], week: object}} options.content - El contenido de los JSON.
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

  return {
    // getStopwatch y saveStopwatch viven en su propio archivo porque no usan eventos.
    ...createStopwatchFunctions(storage),

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
     * @returns {Promise<object[]>} Los procesos activos cuyo nombre o pasos coinciden.
     */
    async searchProcesses(text) {
      return activeProcesses.filter((process) => processMatchesSearch(process, text));
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

    /**
     * @param {string} [processId] - Si se da, solo las notas ligadas a ese proceso.
     * @returns {Promise<object[]>} Las notas, la más reciente primero.
     */
    async getNotes(processId) {
      return getCurrentNotes(store.readEvents(), processId);
    },

    /**
     * Crea una nota (si no trae id) o guarda una versión nueva de una existente.
     *
     * @param {{id?: string, processId?: string|null, title: string, body: string}} note
     * @returns {Promise<object>} La nota como quedó guardada.
     */
    async saveNote(note) {
      const noteId = note.id ?? crypto.randomUUID();
      const processId = note.processId ?? null;
      if (processId !== null) requireProcess(processId);
      store.appendEvent(EVENT_TYPES.noteSaved, { noteId, processId, title: note.title, body: note.body });
      return getCurrentNotes(store.readEvents()).find((savedNote) => savedNote.id === noteId);
    },

    /**
     * @param {string} noteId - El id de la nota. Se puede recuperar con Deshacer.
     * @returns {Promise<void>}
     */
    async deleteNote(noteId) {
      store.appendEvent(EVENT_TYPES.noteDeleted, { noteId });
    },

    /** @returns {Promise<object|null>} El evento que se anuló, o null si no había nada. */
    async undoLastEvent() {
      const lastEvent = getLastUndoableEvent(store.readEvents());
      if (lastEvent) store.appendEvent(EVENT_TYPES.eventUndone, { targetEventId: lastEvent.id });
      return lastEvent;
    },

    /** @returns {Promise<string>} El texto JSON del respaldo, con todo el historial. */
    async exportBackup() {
      return buildBackup(store.readEvents(), new Date().toISOString());
    },

    /**
     * Reemplaza todo el historial con el de un archivo de respaldo, si es válido.
     *
     * @param {{text: Function}} file - El archivo elegido (un File del navegador).
     * @returns {Promise<number>} Cuántos eventos se restauraron.
     */
    async importBackup(file) {
      const events = parseBackup(await file.text());
      store.replaceEvents(events);
      return events.length;
    },
  };
}
