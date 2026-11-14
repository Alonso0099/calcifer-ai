// Funciones puras del inventario del congelador: qué bolsas hay, cuánto falta y hasta cuándo sirven.
import { EVENT_TYPES, USE_SOON_THRESHOLD_DAYS } from '../shared/constants.js';
import { addMonths, getDaysBetween } from './dates.js';
import { getActiveEvents } from './events.js';

/**
 * Arma la lista de bolsas que hay hoy en el congelador a partir del historial.
 * Una bolsa existe desde su último freezer_item_saved y deja de existir con un
 * freezer_item_removed. Como son eventos, sacar una bolsa por error se puede deshacer.
 *
 * @param {object[]} events - Todos los eventos, del más viejo al más nuevo.
 * @returns {Array<{id: string, cutId: string, marinated: boolean, units: number, prepDay: string}>} Las bolsas actuales.
 */
export function getFreezerItems(events) {
  const itemsById = new Map();
  for (const event of getActiveEvents(events)) {
    if (event.type === EVENT_TYPES.freezerItemRemoved) itemsById.delete(event.itemId);
    if (event.type === EVENT_TYPES.freezerItemSaved) {
      itemsById.set(event.itemId, { id: event.itemId, cutId: event.cutId, marinated: event.marinated, units: event.units, prepDay: event.prepDay });
    }
  }
  return [...itemsById.values()];
}

/**
 * Calcula la fecha límite de una bolsa con los tiempos máximos del manual.
 * Una proteína marinada usa el límite de marinadas si es más corto que el de su corte.
 *
 * @param {{prepDay: string, marinated: boolean}} item - La bolsa.
 * @param {{useByMonths: number}} cut - Su corte, del catálogo.
 * @param {number} marinatedUseByMonths - El límite del manual para proteína marinada.
 * @returns {string} El día límite ("usar antes de"), en formato año-mes-día.
 */
export function getUseByDay(item, cut, marinatedUseByMonths) {
  const months = item.marinated ? Math.min(cut.useByMonths, marinatedUseByMonths) : cut.useByMonths;
  return addMonths(item.prepDay, months);
}

/**
 * Arma el tablero del congelador: por cada proteína, cuántas unidades hay, cuántas
 * faltan para su meta y sus bolsas de la más vieja a la más nueva (lo viejo se usa primero).
 * La regla del manual: meta − existencia = unidades a comprar; nunca menos de cero.
 *
 * @param {object[]} items - Las bolsas actuales (de getFreezerItems).
 * @param {{proteins: object[], marinatedUseByMonths: number}} catalog - El contenido de freezer.json.
 * @param {string} today - El día de hoy, en formato año-mes-día.
 * @returns {{proteins: object[], totalUnits: number, totalTarget: number, totalMissing: number}}
 *   Cada proteína trae units, missing e items; cada bolsa trae cutName, useByDay y
 *   useStatus ("expired", "soon" u "ok").
 */
export function buildFreezerBoard(items, catalog, today) {
  const proteins = catalog.proteins.map((protein) => {
    const bags = [];
    for (const cut of protein.cuts) {
      for (const item of items.filter((candidate) => candidate.cutId === cut.id)) {
        const useByDay = getUseByDay(item, cut, catalog.marinatedUseByMonths);
        const daysLeft = getDaysBetween(today, useByDay);
        const useStatus = daysLeft < 0 ? 'expired' : daysLeft <= USE_SOON_THRESHOLD_DAYS ? 'soon' : 'ok';
        bags.push({ ...item, cutName: cut.name, useByDay, useStatus });
      }
    }
    bags.sort((first, second) => first.prepDay.localeCompare(second.prepDay));
    const units = bags.reduce((total, bag) => total + bag.units, 0);
    return { id: protein.id, name: protein.name, target: protein.target, units, missing: Math.max(0, protein.target - units), items: bags };
  });
  const sum = (field) => proteins.reduce((total, protein) => total + protein[field], 0);
  return { proteins, totalUnits: sum('units'), totalTarget: sum('target'), totalMissing: sum('missing') };
}

/**
 * Dice cuánto hay de una proteína en el congelador y cuál es su bolsa más vieja (la que se saca primero).
 * Sirve para el aviso de descongelar: el grupo de la receta ("pollo") es también el id de la proteína.
 *
 * @param {{proteins: Array<{id: string, name: string, units: number, items: object[]}>}} board - El tablero del congelador.
 * @param {string} proteinId - El id de la proteína: "pollo", "cerdo", "res" o "seafood".
 * @returns {{name: string, units: number, oldestBag: object|null}|null} Lo que hay, o null si ese id no existe.
 */
export function getProteinStock(board, proteinId) {
  const protein = board.proteins.find((candidate) => candidate.id === proteinId);
  return protein ? { name: protein.name, units: protein.units, oldestBag: protein.items[0] ?? null } : null;
}
