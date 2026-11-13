// Función pura que arma la pantalla de limpieza y mantenimiento: zonas con sus tareas y estados.
import { MAINTENANCE_CATEGORIES } from '../shared/constants.js';
import { compareByUrgency, getDaysUntilDue, getDueProgress, getDueStatus } from './dueStatus.js';

/**
 * Agrupa las tareas de limpieza y mantenimiento por zona y calcula su vencimiento.
 * Solo entran los procesos de esas categorías que tienen zona y se repiten por
 * calendario (frequencyDays); las tareas diarias no llevan registro de "última vez".
 *
 * @param {Array<{id: string, name: string}>} zones - Las zonas de la cocina.
 * @param {object[]} processes - Todos los procesos activos.
 * @param {Record<string, string|null>} lastDoneByProcessId - La última vez de cada proceso (fecha ISO o null).
 * @param {Date} today - El momento actual (se recibe como parámetro para poder probarla).
 * @returns {Array<{zone: object, tasks: object[], worstTask: object}>} Las zonas que tienen tareas,
 *   de la más urgente a la menos urgente. Cada tarea trae: process, lastDoneIso,
 *   daysUntilDue, status y progress. worstTask es la tarea más atrasada de la zona.
 */
export function buildZoneBoards(zones, processes, lastDoneByProcessId, today) {
  const boards = [];
  for (const zone of zones) {
    const tasks = processes
      .filter(
        (process) =>
          process.zone === zone.id && process.frequencyDays !== null && MAINTENANCE_CATEGORIES.includes(process.category),
      )
      .map((process) => {
        const lastDoneIso = lastDoneByProcessId[process.id] ?? null;
        const daysUntilDue = getDaysUntilDue(lastDoneIso, process.frequencyDays, today);
        return {
          process,
          lastDoneIso,
          daysUntilDue,
          status: getDueStatus(daysUntilDue),
          progress: getDueProgress(daysUntilDue, process.frequencyDays),
        };
      })
      .sort(compareByUrgency);
    if (tasks.length > 0) boards.push({ zone, tasks, worstTask: tasks[0] });
  }
  // sort es estable: dos zonas igual de urgentes conservan el orden de zones.json.
  return boards.sort((first, second) => compareByUrgency(first.worstTask, second.worstTask));
}
