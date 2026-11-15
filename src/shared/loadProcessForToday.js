// Carga un proceso con solo los pasos que tocan hoy. La usan la pantalla de la receta y el modo paso a paso.
import { getProcess, getWeekPlan } from '../data/index.js';
import { getHouseDayText, getWeekdayId } from '../lib/dates.js';
import { getStepsForToday, packsLunchOn } from '../lib/stepByStep.js';

/**
 * Pide el proceso y la semana tipo, y quita los pasos que hoy no aplican (por ejemplo, empacar
 * el almuerzo de mañana un viernes). Así las dos pantallas muestran lo mismo.
 *
 * @param {string} processId - El id del proceso.
 * @returns {Promise<{process: object|null, packsLunchToday: boolean}>} El proceso (null si no existe)
 *   y si hoy se empacan los almuerzos de mañana.
 */
export async function loadProcessForToday(processId) {
  const [process, weekPlan] = await Promise.all([getProcess(processId), getWeekPlan()]);
  const packsLunchToday = packsLunchOn(weekPlan, getWeekdayId(getHouseDayText(new Date())));
  if (!process) return { process: null, packsLunchToday };
  return { process: { ...process, steps: getStepsForToday(process.steps, packsLunchToday) }, packsLunchToday };
}
