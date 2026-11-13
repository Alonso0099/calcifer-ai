// Funciones puras que calculan el estado de la app a partir del historial de eventos.
// Nada se guarda "ya calculado": cada respuesta se obtiene leyendo los eventos.
import { EVENT_TYPES } from '../shared/constants.js';

/**
 * Quita del historial los eventos anulados con Deshacer y los propios eventos de
 * anulación. Lo que queda es lo que "sí pasó" y es la base de todos los demás cálculos.
 *
 * @param {object[]} events - Todos los eventos, del más viejo al más nuevo.
 * @returns {object[]} Los eventos vigentes, en el mismo orden.
 */
export function getActiveEvents(events) {
  const undoneIds = new Set(
    events.filter((event) => event.type === EVENT_TYPES.eventUndone).map((event) => event.targetEventId),
  );
  return events.filter((event) => event.type !== EVENT_TYPES.eventUndone && !undoneIds.has(event.id));
}

/**
 * Encuentra el evento que anularía el botón Deshacer: el último que sigue vigente.
 *
 * @param {object[]} events - Todos los eventos, del más viejo al más nuevo.
 * @returns {object|null} El último evento vigente, o null si no hay nada que deshacer.
 */
export function getLastUndoableEvent(events) {
  const activeEvents = getActiveEvents(events);
  return activeEvents.length > 0 ? activeEvents[activeEvents.length - 1] : null;
}

/**
 * Busca la última vez que se terminó un proceso.
 *
 * @param {object[]} events - Todos los eventos, del más viejo al más nuevo.
 * @param {string} processId - El id del proceso.
 * @returns {string|null} Fecha ISO (UTC) de la última vez, o null si nunca se ha terminado.
 */
export function getLastDoneIso(events, processId) {
  const finishEvents = getActiveEvents(events).filter(
    (event) => event.type === EVENT_TYPES.processFinished && event.processId === processId,
  );
  return finishEvents.length > 0 ? finishEvents[finishEvents.length - 1].createdAt : null;
}

/**
 * Calcula qué pasos de un proceso están marcados en este momento.
 * Solo cuentan los eventos posteriores a la última vez que se terminó el proceso:
 * así, al terminar, el checklist queda limpio para la siguiente vez sin borrar nada.
 *
 * @param {object[]} events - Todos los eventos, del más viejo al más nuevo.
 * @param {string} processId - El id del proceso.
 * @returns {Set<string>} Los ids de los pasos marcados.
 */
export function getCheckedStepIds(events, processId) {
  const checkedStepIds = new Set();
  for (const event of getActiveEvents(events)) {
    if (event.processId !== processId) continue;
    if (event.type === EVENT_TYPES.processFinished) checkedStepIds.clear();
    if (event.type === EVENT_TYPES.stepChecked) checkedStepIds.add(event.stepId);
    if (event.type === EVENT_TYPES.stepUnchecked) checkedStepIds.delete(event.stepId);
  }
  return checkedStepIds;
}
