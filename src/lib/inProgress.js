// Función pura que encuentra lo que se empezó y no se terminó: para mostrarlo en "Hoy" y no perderlo.
import { getCheckedStepIds } from './events.js';
import { getElapsedMs } from './time.js';
import { isTimerDone } from './timers.js';

/**
 * Arma la lista de procesos "en curso": los que tienen pasos marcados sin terminar, un cronómetro
 * con tiempo, o un temporizador puesto desde su modo paso a paso. Los que tienen el cronómetro
 * corriendo van primero.
 *
 * @param {object} input
 * @param {object[]} input.events - Todos los eventos.
 * @param {Record<string, {accumulatedMs: number, startedAt: number|null}>} input.stopwatches - Los cronómetros guardados, por proceso.
 * @param {Array<{processId?: string|null, endsAt: number}>} input.timers - Los temporizadores guardados.
 * @param {object[]} input.processes - Los procesos del contenido.
 * @param {number} input.now - La hora actual, en milisegundos.
 * @returns {Array<{processId: string, name: string, checkedCount: number, totalSteps: number,
 *   stopwatch: object|null, elapsedMs: number, isRunning: boolean, timers: object[]}>} Lo que está en curso.
 */
export function getInProgressSessions({ events, stopwatches, timers, processes, now }) {
  const sessions = [];
  for (const process of processes) {
    const checkedCount = getCheckedStepIds(events, process.id).size;
    const stopwatch = stopwatches[process.id] ?? null;
    const elapsedMs = stopwatch ? getElapsedMs(stopwatch, now) : 0;
    const processTimers = timers.filter((timer) => timer.processId === process.id);
    if (checkedCount === 0 && elapsedMs === 0 && processTimers.length === 0) continue;
    sessions.push({
      processId: process.id,
      name: process.name,
      checkedCount,
      totalSteps: process.steps.length,
      stopwatch,
      elapsedMs,
      isRunning: Boolean(stopwatch?.startedAt),
      timers: processTimers.map((timer) => ({ ...timer, isDone: isTimerDone(timer, now) })),
    });
  }
  return sessions.sort((first, second) => Number(second.isRunning) - Number(first.isRunning) || first.name.localeCompare(second.name, 'es'));
}
