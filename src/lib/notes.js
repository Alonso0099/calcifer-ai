// Función pura que arma las notas actuales a partir del historial de eventos.
import { EVENT_TYPES } from '../shared/constants.js';
import { getActiveEvents } from './events.js';

/**
 * Arma la lista de notas como se ven hoy. Cada nota se muestra en su versión más
 * reciente (su último note_saved), y desaparece si después hubo un note_deleted.
 * Si ese borrado se anula con Deshacer, la nota vuelve a aparecer sola.
 *
 * @param {object[]} events - Todos los eventos, del más viejo al más nuevo.
 * @param {string} [processId] - Si se da, solo regresa las notas ligadas a ese proceso.
 * @returns {Array<{id: string, processId: string|null, title: string, body: string, updatedAt: string}>}
 *   Las notas, de la más reciente a la más antigua.
 */
export function getCurrentNotes(events, processId) {
  // Un Map guarda pares clave → valor y recuerda el orden en que se agregaron.
  const notesById = new Map();
  for (const event of getActiveEvents(events)) {
    if (event.type === EVENT_TYPES.noteDeleted) notesById.delete(event.noteId);
    if (event.type === EVENT_TYPES.noteSaved) {
      // Se borra antes de agregar para que la nota editada quede al final (la más reciente).
      notesById.delete(event.noteId);
      notesById.set(event.noteId, {
        id: event.noteId,
        processId: event.processId ?? null,
        title: event.title,
        body: event.body,
        updatedAt: event.createdAt,
      });
    }
  }
  const notes = [...notesById.values()].reverse();
  return processId ? notes.filter((note) => note.processId === processId) : notes;
}
