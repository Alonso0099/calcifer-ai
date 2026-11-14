// Función pura que arma la lista de tareas de "Hoy" a partir del menú, la semana tipo y lo ya hecho.
import {
  AFTER_COOKING_PROCESS_ID,
  DAILY_SERVICE_PROCESS_ID,
  MEAL_KINDS,
  NIGHT_CLOSE_PROCESS_ID,
  THAW_GROUPS,
} from '../shared/constants.js';
import { getHouseDayNumber } from './dates.js';

/**
 * Dice si un proceso ya se terminó hoy (en el día de la casa).
 *
 * @param {string|null|undefined} lastDoneIso - Última vez que se terminó, o null.
 * @param {Date} now - El momento actual.
 * @returns {boolean} true si la última vez fue hoy.
 */
function wasDoneToday(lastDoneIso, now) {
  return Boolean(lastDoneIso) && getHouseDayNumber(new Date(lastDoneIso)) === getHouseDayNumber(now);
}

/**
 * Arma las tareas de hoy, en el orden en que se hacen. No inventa nada: salen de lo
 * que se planeó en el menú, de la semana tipo y de las tareas de limpieza ya vencidas.
 * Una tarea aparece solo si toca hoy, y nunca dos veces.
 *
 * @param {object} input
 * @param {Record<string, {kind: string, processId: string|null}>} input.todayMeals - Lo planeado hoy, por momento.
 * @param {Array<{processId: string, everyWeeks?: number}>} input.todayBlocks - Los bloques de hoy en la semana tipo.
 * @param {string[]} input.overdueProcessIds - Tareas de limpieza y mantenimiento que vencen hoy o están atrasadas.
 * @param {Record<string, object>} input.processesById - Todos los procesos, por id.
 * @param {Record<string, string|null>} input.lastDoneByProcessId - La última vez de cada proceso.
 * @param {Date} input.now - El momento actual (se recibe para poder probarla).
 * @returns {Array<{processId: string, name: string, reason: 'meal'|'daily'|'week'|'overdue', isDone: boolean}>}
 */
export function buildTodayTasks({ todayMeals, todayBlocks, overdueProcessIds, processesById, lastDoneByProcessId, now }) {
  const tasks = [];
  /** Agrega una tarea si el proceso existe y todavía no está en la lista. */
  function addTask(processId, reason) {
    const process = processesById[processId];
    if (!process || tasks.some((task) => task.processId === processId)) return;
    tasks.push({ processId, name: process.name, reason, isDone: wasDoneToday(lastDoneByProcessId[processId], now) });
  }

  const recipeMeals = Object.values(todayMeals).filter((meal) => meal.kind === MEAL_KINDS.recipe);
  for (const meal of recipeMeals) addTask(meal.processId, 'meal');
  // Si hoy se cocina, también tocan limpiar después y cerrar la cocina.
  if (recipeMeals.length > 0) {
    addTask(AFTER_COOKING_PROCESS_ID, 'daily');
    addTask(NIGHT_CLOSE_PROCESS_ID, 'daily');
  }
  for (const block of todayBlocks) {
    // "Servicio diario" ya está cubierto por cocinar + limpiar + cerrar.
    if (block.processId !== DAILY_SERVICE_PROCESS_ID) addTask(block.processId, 'week');
  }
  for (const processId of overdueProcessIds) addTask(processId, 'overdue');
  return tasks;
}

/**
 * Busca la receta de la cena de mañana cuya proteína hay que pasar hoy del congelador al refri.
 * Solo avisa: no supone qué bolsa es ni cuánto tarda; eso lo decide quien cocina.
 *
 * @param {Record<string, {kind: string, processId: string|null}>} tomorrowMeals - Lo planeado mañana.
 * @param {Record<string, object>} processesById - Todos los procesos, por id.
 * @returns {object[]} Las recetas de mañana que llevan proteína del congelador.
 */
export function getRecipesToThaw(tomorrowMeals, processesById) {
  return Object.values(tomorrowMeals)
    .filter((meal) => meal.kind === MEAL_KINDS.recipe)
    .map((meal) => processesById[meal.processId])
    .filter((process) => process && THAW_GROUPS.includes(process.group));
}
