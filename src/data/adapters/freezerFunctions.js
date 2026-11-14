// Las funciones de la capa de datos para el inventario del congelador.
import { EVENT_TYPES, FREEZER_REMOVE_REASONS } from '../../shared/constants.js';
import { getFreezerItems } from '../../lib/freezer.js';

/**
 * Crea las funciones del congelador. Van en su propio archivo para no alargar el adaptador.
 *
 * @param {{readEvents: Function, appendEvent: Function}} store - El almacén de eventos.
 * @param {{proteins: object[]}} catalog - El contenido de freezer.json (metas, cortes y tiempos).
 * @returns {object} getFreezerCatalog, getFreezer, saveFreezerItem y removeFreezerItem.
 */
export function createFreezerFunctions(store, catalog) {
  const cutIds = catalog.proteins.flatMap((protein) => protein.cuts.map((cut) => cut.id));
  return {
    /** @returns {Promise<object>} Metas por proteína, cortes y tiempos máximos del manual. */
    async getFreezerCatalog() {
      return catalog;
    },

    /** @returns {Promise<object[]>} Las bolsas que hay hoy en el congelador. */
    async getFreezer() {
      return getFreezerItems(store.readEvents());
    },

    /**
     * Registra una bolsa nueva (sin id) o corrige una existente (con id). Se puede deshacer.
     *
     * @param {{id?: string, cutId: string, marinated: boolean, units: number, prepDay: string}} item
     *   El corte, si va marinada, cuántas unidades trae (normalmente 1) y su día de preparación.
     * @returns {Promise<string>} El id de la bolsa.
     */
    async saveFreezerItem(item) {
      if (!cutIds.includes(item.cutId)) throw new Error(`No existe el corte "${item.cutId}"`);
      if (!(Number.isFinite(item.units) && item.units > 0)) throw new Error('Las unidades deben ser un número mayor que cero');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(item.prepDay)) throw new Error('El día de preparación no es válido');
      const itemId = item.id ?? crypto.randomUUID();
      store.appendEvent(EVENT_TYPES.freezerItemSaved, {
        itemId,
        cutId: item.cutId,
        marinated: Boolean(item.marinated),
        units: item.units,
        prepDay: item.prepDay,
      });
      return itemId;
    },

    /**
     * Saca una bolsa del inventario. Se puede deshacer.
     *
     * @param {string} itemId - El id de la bolsa.
     * @param {string} reason - "cooked" (se usó), "discarded" (se tiró) o "correction" (estaba mal registrada).
     * @returns {Promise<void>}
     */
    async removeFreezerItem(itemId, reason) {
      if (!FREEZER_REMOVE_REASONS.includes(reason)) throw new Error(`Motivo inválido: "${reason}"`);
      store.appendEvent(EVENT_TYPES.freezerItemRemoved, { itemId, reason });
    },
  };
}
