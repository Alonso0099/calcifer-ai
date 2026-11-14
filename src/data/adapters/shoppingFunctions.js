// Las funciones de la capa de datos para la lista de compras: lo anotado a mano y las casillas marcadas.
import { EVENT_TYPES } from '../../shared/constants.js';
import { getShoppingState } from '../../lib/shopping.js';

/**
 * Crea las funciones de compras. Van en su propio archivo para no alargar el adaptador.
 *
 * @param {{readEvents: Function, appendEvent: Function}} store - El almacén de eventos.
 * @returns {object} getShoppingState, addShoppingItem, removeShoppingItem, setShoppingItemChecked y completeShopping.
 */
export function createShoppingFunctions(store) {
  return {
    /**
     * @returns {Promise<{manualItems: object[], checkedKeys: Set<string>, lastCompletedAt: string|null}>}
     *   Lo anotado a mano, las casillas marcadas y cuándo se terminó la última compra.
     */
    async getShoppingState() {
      return getShoppingState(store.readEvents());
    },

    /**
     * Anota algo a mano en la lista. Se puede deshacer.
     *
     * @param {string} name - Qué comprar, con las palabras que se quiera.
     * @returns {Promise<string>} El id del renglón.
     */
    async addShoppingItem(name) {
      const cleanName = name.trim();
      if (cleanName === '') throw new Error('Falta escribir qué comprar');
      const itemId = crypto.randomUUID();
      store.appendEvent(EVENT_TYPES.shoppingItemAdded, { itemId, name: cleanName });
      return itemId;
    },

    /**
     * Quita un renglón anotado a mano. Se puede deshacer.
     *
     * @param {string} itemId - El id del renglón.
     * @returns {Promise<void>}
     */
    async removeShoppingItem(itemId) {
      store.appendEvent(EVENT_TYPES.shoppingItemRemoved, { itemId });
    },

    /**
     * Marca o desmarca un renglón. Si ya está en ese estado no guarda nada (marcar dos veces no duplica).
     *
     * @param {string} key - La llave del renglón ("protein:pollo", "menu:cebolla|", "manual:id").
     * @param {boolean} isChecked - Si debe quedar marcado.
     * @returns {Promise<void>}
     */
    async setShoppingItemChecked(key, isChecked) {
      if (getShoppingState(store.readEvents()).checkedKeys.has(key) === isChecked) return;
      store.appendEvent(isChecked ? EVENT_TYPES.shoppingItemChecked : EVENT_TYPES.shoppingItemUnchecked, { key });
    },

    /**
     * Termina la compra: las casillas vuelven a estar vacías y lo anotado a mano que se compró sale
     * de la lista. No cambia el congelador: la proteína entra al inventario cuando se porciona y se
     * registran sus bolsas. Se puede deshacer.
     *
     * @returns {Promise<number>} Cuántos renglones estaban marcados.
     */
    async completeShopping() {
      const checkedCount = getShoppingState(store.readEvents()).checkedKeys.size;
      store.appendEvent(EVENT_TYPES.shoppingCompleted, { checkedCount });
      return checkedCount;
    },
  };
}
