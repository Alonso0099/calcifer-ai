// Las funciones de la capa de datos para las notas que escribe el usuario.
import { EVENT_TYPES } from '../../shared/constants.js';
import { getCurrentNotes } from '../../lib/notes.js';

/**
 * Crea las funciones de notas. Van en su propio archivo para no alargar el adaptador.
 *
 * @param {{readEvents: Function, appendEvent: Function}} store - El almacén de eventos.
 * @param {(processId: string) => object} requireProcess - Busca un proceso o lanza un error si no existe.
 * @returns {{getNotes: Function, saveNote: Function, deleteNote: Function}} Funciones asíncronas.
 */
export function createNoteFunctions(store, requireProcess) {
  return {
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
  };
}
