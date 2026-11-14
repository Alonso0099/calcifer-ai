// Convierte una comida planeada en el texto que se muestra en "Hoy" y en el menú.
import { MEAL_KINDS } from './constants.js';
import { text } from './text.js';

/**
 * Escribe el nombre de una comida planeada: el de su receta, o "Sobras", "Comer afuera"...
 *
 * @param {{kind: string, processId: string|null}|undefined} meal - Lo planeado, o undefined si no hay nada.
 * @param {Record<string, {name: string}>} processNamesById - Los procesos, por id.
 * @returns {string|null} El nombre para mostrar, o null si no hay nada planeado.
 */
export function getMealName(meal, processNamesById) {
  if (!meal) return null;
  if (meal.kind === MEAL_KINDS.recipe) return processNamesById[meal.processId]?.name ?? null;
  return text.mealKinds[meal.kind] ?? null;
}
