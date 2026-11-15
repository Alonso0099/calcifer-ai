// Pide a la capa de datos todo lo que necesita la pantalla "Hoy" y lo deja listo para dibujar.
import { getFreezer, getFreezerCatalog, getLastDone, getMealPlan, getProcesses, getWeekPlan, getZones } from '../../data/index.js';
import { addDays, getHouseDayText, getWeekdayId } from '../../lib/dates.js';
import { buildFreezerBoard, getProteinStock } from '../../lib/freezer.js';
import { buildZoneBoards } from '../../lib/maintenance.js';
import { buildTodayTasks, getRecipesToThaw } from '../../lib/today.js';
import { AFTER_COOKING_PROCESS_ID, MAINTENANCE_CATEGORIES, NIGHT_CLOSE_PROCESS_ID } from '../../shared/constants.js';

/**
 * Junta el menú de hoy, las tareas del día y el aviso de descongelar para mañana.
 * Nada de esto se guarda: se calcula cada vez con el menú, la semana tipo y el historial.
 *
 * @returns {Promise<object>} today (día), todayMeals, usualMeal, tasks, processesById y recipesToThaw
 *   (cada receta con su `stock`: cuánto hay de su proteína en el congelador y cuál bolsa se saca primero).
 */
export async function loadToday() {
  const now = new Date();
  const today = getHouseDayText(now);
  const [processes, mealPlan, weekPlan, zones, freezerItems, freezerCatalog] = await Promise.all([
    getProcesses(),
    getMealPlan(),
    getWeekPlan(),
    getZones(),
    getFreezer(),
    getFreezerCatalog(),
  ]);
  const processesById = Object.fromEntries(processes.map((process) => [process.id, process]));
  const todayMeals = mealPlan[today] ?? {};
  const weekDay = weekPlan.days.find((day) => day.id === getWeekdayId(today));

  // Solo se pide la "última vez" de los procesos que pueden aparecer hoy.
  const maintenanceIds = processes.filter((process) => MAINTENANCE_CATEGORIES.includes(process.category)).map((process) => process.id);
  const mealIds = Object.values(todayMeals).map((meal) => meal.processId).filter(Boolean);
  const blockIds = weekDay.blocks.map((block) => block.processId);
  const neededIds = [...new Set([...maintenanceIds, ...mealIds, ...blockIds, AFTER_COOKING_PROCESS_ID, NIGHT_CLOSE_PROCESS_ID])];
  const lastDoneDates = await Promise.all(neededIds.map((processId) => getLastDone(processId)));
  const lastDoneByProcessId = Object.fromEntries(neededIds.map((processId, index) => [processId, lastDoneDates[index]]));

  // Tareas de limpieza y mantenimiento que vencen hoy o ya están atrasadas.
  const overdueProcessIds = buildZoneBoards(zones, processes, lastDoneByProcessId, now)
    .flatMap((board) => board.tasks)
    .filter((task) => task.status === 'late' || task.status === 'today')
    .map((task) => task.process.id);

  const freezerBoard = buildFreezerBoard(freezerItems, freezerCatalog, today);
  return {
    today,
    todayMeals,
    usualMeal: weekDay.meal,
    packsLunchToday: weekDay.packLunchForTomorrow,
    processesById,
    tasks: buildTodayTasks({ todayMeals, todayBlocks: weekDay.blocks, overdueProcessIds, processesById, lastDoneByProcessId, now }),
    recipesToThaw: getRecipesToThaw(mealPlan[addDays(today, 1)] ?? {}, processesById).map((recipe) => ({
      ...recipe,
      stock: getProteinStock(freezerBoard, recipe.group),
    })),
  };
}
