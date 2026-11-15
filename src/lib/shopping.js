// Funciones puras de la lista de compras: qué hay en la lista y cómo se arma a partir del congelador,
// el menú y lo que se anota a mano. Nada de esto se guarda ya armado: se calcula de los eventos.
import { EVENT_TYPES, MEAL_KINDS, PROTEIN_UNIT_PATTERN, REFERENCE_INGREDIENT_PATTERN, SHOPPING_MENU_DAYS } from '../shared/constants.js';
import { addDays } from './dates.js';
import { getActiveEvents } from './events.js';
import { normalizeText } from './searchText.js';

/**
 * Lee del historial lo que se anotó a mano y qué casillas están marcadas.
 * Las casillas se limpian al terminar la compra, y lo anotado a mano que ya se marcó sale de la lista.
 * Marcar o desmarcar es un evento, así que se puede deshacer.
 *
 * @param {object[]} events - Todos los eventos, del más viejo al más nuevo.
 * @returns {{manualItems: Array<{id: string, name: string}>, checkedKeys: Set<string>, lastCompletedAt: string|null}}
 */
export function getShoppingState(events) {
  const manualItems = new Map();
  let checkedKeys = new Set();
  let lastCompletedAt = null;
  for (const event of getActiveEvents(events)) {
    if (event.type === EVENT_TYPES.shoppingItemAdded) manualItems.set(event.itemId, { id: event.itemId, name: event.name });
    if (event.type === EVENT_TYPES.shoppingItemRemoved) manualItems.delete(event.itemId);
    if (event.type === EVENT_TYPES.shoppingItemChecked) checkedKeys.add(event.key);
    if (event.type === EVENT_TYPES.shoppingItemUnchecked) checkedKeys.delete(event.key);
    if (event.type === EVENT_TYPES.shoppingCompleted) {
      for (const id of manualItems.keys()) if (checkedKeys.has(`manual:${id}`)) manualItems.delete(id);
      checkedKeys = new Set();
      lastCompletedAt = event.createdAt;
    }
  }
  return { manualItems: [...manualItems.values()], checkedKeys, lastCompletedAt };
}

/**
 * Suma los ingredientes de las recetas planeadas en los próximos días. Una receta planeada
 * dos veces cuenta doble. No se incluyen los opcionales, las unidades de proteína (esas salen
 * del congelador) ni las líneas que solo remiten a otra receta.
 *
 * @param {Record<string, Record<string, {kind: string, processId: string|null}>>} mealPlan - El menú.
 * @param {Record<string, object>} processesById - Todos los procesos, por id.
 * @param {string} today - El día de hoy (año-mes-día).
 * @returns {Array<{key: string, name: string, amount: number|null, amountMax: number|null, unit: string|null, recipes: string[]}>}
 *   Un renglón por ingrediente, en orden alfabético.
 */
export function collectMenuIngredients(mealPlan, processesById, today) {
  const totals = new Map();
  for (let offset = 0; offset < SHOPPING_MENU_DAYS; offset += 1) {
    const dayPlan = mealPlan[addDays(today, offset)] ?? {};
    for (const meal of Object.values(dayPlan)) {
      const recipe = meal.kind === MEAL_KINDS.recipe ? processesById[meal.processId] : null;
      for (const ingredient of recipe?.ingredients ?? []) {
        if (ingredient.optional || PROTEIN_UNIT_PATTERN.test(ingredient.text) || REFERENCE_INGREDIENT_PATTERN.test(ingredient.text)) continue;
        const key = `menu:${normalizeText(ingredient.name)}|${ingredient.unit ?? ''}`;
        const total = totals.get(key) ?? { key, name: ingredient.name, amount: null, amountMax: null, unit: ingredient.unit, recipes: [] };
        if (ingredient.amount !== null) {
          total.amount = (total.amount ?? 0) + ingredient.amount;
          total.amountMax = (total.amountMax ?? 0) + (ingredient.amountMax ?? ingredient.amount);
        }
        if (!total.recipes.includes(recipe.name)) total.recipes.push(recipe.name);
        totals.set(key, total);
      }
    }
  }
  return [...totals.values()].sort((first, second) => first.name.localeCompare(second.name, 'es'));
}

/**
 * Arma la lista de compras completa en tres partes: la proteína que falta en el congelador,
 * los ingredientes del menú de la semana y lo anotado a mano. Cada renglón sabe si ya está marcado.
 * No resta lo que ya hay en la despensa (no hay inventario de despensa): la persona marca lo que ya tiene.
 *
 * @param {object} input
 * @param {{proteins: Array<{id: string, name: string, missing: number}>}} input.board - El tablero del congelador.
 * @param {object} input.mealPlan - El menú, por día y momento.
 * @param {Record<string, object>} input.processesById - Todos los procesos, por id.
 * @param {{manualItems: object[], checkedKeys: Set<string>}} input.state - De getShoppingState.
 * @param {string} input.today - El día de hoy (año-mes-día).
 * @returns {{protein: object[], menu: object[], manual: object[], checkedCount: number, totalCount: number}}
 */
export function buildShoppingList({ board, mealPlan, processesById, state, today }) {
  const withChecked = (item) => ({ ...item, checked: state.checkedKeys.has(item.key) });
  const protein = board.proteins
    .filter((entry) => entry.missing > 0)
    .map((entry) => withChecked({ key: `protein:${entry.id}`, name: entry.name, amount: entry.missing, amountMax: null, unit: 'unidad', recipes: [] }));
  const menu = collectMenuIngredients(mealPlan, processesById, today).map(withChecked);
  const manual = state.manualItems.map((item) => withChecked({ key: `manual:${item.id}`, itemId: item.id, name: item.name, amount: null, amountMax: null, unit: null, recipes: [] }));
  const all = [...protein, ...menu, ...manual];
  return { protein, menu, manual, checkedCount: all.filter((item) => item.checked).length, totalCount: all.length };
}
