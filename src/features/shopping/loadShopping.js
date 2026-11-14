// Pide a la capa de datos todo lo que necesita la pantalla de compras y arma la lista.
import { getFreezer, getFreezerCatalog, getMealPlan, getProcesses, getShoppingState } from '../../data/index.js';
import { getHouseDayText } from '../../lib/dates.js';
import { buildFreezerBoard } from '../../lib/freezer.js';
import { buildShoppingList } from '../../lib/shopping.js';

/**
 * Junta el congelador, el menú, los ingredientes de las recetas y lo anotado a mano.
 * La lista no se guarda: se vuelve a armar cada vez, así siempre refleja el menú y el inventario de hoy.
 *
 * @returns {Promise<{list: object, lastCompletedAt: string|null}>} La lista y cuándo se terminó la última compra.
 */
export async function loadShopping() {
  const today = getHouseDayText(new Date());
  const [items, catalog, mealPlan, processes, state] = await Promise.all([
    getFreezer(),
    getFreezerCatalog(),
    getMealPlan(),
    getProcesses(),
    getShoppingState(),
  ]);
  const processesById = Object.fromEntries(processes.map((process) => [process.id, process]));
  const list = buildShoppingList({ board: buildFreezerBoard(items, catalog, today), mealPlan, processesById, state, today });
  return { list, lastCompletedAt: state.lastCompletedAt };
}
