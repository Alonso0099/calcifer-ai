// Las funciones de la capa de datos para el menú: leer lo planeado y planear una comida.
import { EVENT_TYPES, MEAL_KINDS, MEAL_SLOTS } from '../../shared/constants.js';
import { getMealPlanByDay } from '../../lib/mealPlan.js';

/**
 * Crea las funciones del menú. Van en su propio archivo para no alargar el adaptador.
 *
 * @param {{readEvents: Function, appendEvent: Function}} store - El almacén de eventos.
 * @param {(processId: string) => object} requireProcess - Busca un proceso o lanza un error si no existe.
 * @returns {{getMealPlan: Function, planMeal: Function}} Funciones asíncronas.
 */
export function createMealPlanFunctions(store, requireProcess) {
  return {
    /**
     * @returns {Promise<Record<string, Record<string, {kind: string, processId: string|null}>>>}
     *   El menú por día ("2026-11-13") y momento (breakfast, lunch, dinner).
     */
    async getMealPlan() {
      return getMealPlanByDay(store.readEvents());
    },

    /**
     * Planea (o cambia, o quita) la comida de un momento del día. Se puede deshacer.
     *
     * @param {string} day - El día, en formato año-mes-día.
     * @param {string} slot - "breakfast", "lunch" o "dinner".
     * @param {{kind: string, processId?: string|null}} meal - Qué va ahí: una receta (kind "recipe" y su
     *   processId), "leftovers", "eat_out", "quick", o "none" para quitar lo planeado.
     * @returns {Promise<object>} El evento guardado.
     */
    async planMeal(day, slot, meal) {
      if (!MEAL_SLOTS.includes(slot)) throw new Error(`Momento de comida inválido: "${slot}"`);
      if (!Object.values(MEAL_KINDS).includes(meal.kind)) throw new Error(`Tipo de comida inválido: "${meal.kind}"`);
      const processId = meal.kind === MEAL_KINDS.recipe ? requireProcess(meal.processId).id : null;
      return store.appendEvent(EVENT_TYPES.mealPlanned, { day, slot, kind: meal.kind, processId });
    },
  };
}
