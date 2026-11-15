// Decide qué registros puede anular cada botón Deshacer.
// Cada Deshacer solo alcanza lo de su propio lugar: una tarea, el menú, el congelador...
// Así, deshacer de más en una tarea nunca toca otra tarea ni el plan de hoy.
import { PROCESS_UNDO_EVENT_TYPES, UNDO_AREA_EVENT_TYPES } from '../shared/constants.js';
import { getHouseDayText } from './dates.js';

/**
 * Dice si un evento pertenece al lugar desde donde se tocó Deshacer.
 *
 * Hay dos clases de lugar ("scope"):
 * - { processId }: una tarea o receta. Solo alcanza sus pasos y su "terminado" o "descartado",
 *   y solo los de hoy: así no se borra por accidente el registro de la semana pasada.
 * - { area }: una sección ('planner', 'freezer', 'shopping' o 'notes'). Solo alcanza los registros de esa sección.
 *
 * @param {object} event - Un evento del historial.
 * @param {{processId?: string, area?: string}} scope - El lugar desde donde se deshace.
 * @param {Date} now - El momento actual (se recibe como parámetro para poder probar la función).
 * @returns {boolean} true si ese Deshacer puede anular el evento.
 */
export function isEventInUndoScope(event, scope, now) {
  if (scope.processId) {
    const isFromThisProcess = event.processId === scope.processId && PROCESS_UNDO_EVENT_TYPES.includes(event.type);
    const isFromToday = getHouseDayText(new Date(event.createdAt)) === getHouseDayText(now);
    return isFromThisProcess && isFromToday;
  }
  return (UNDO_AREA_EVENT_TYPES[scope.area] ?? []).includes(event.type);
}
