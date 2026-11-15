// Las funciones de la capa de datos para el respaldo: descargar el historial y restaurarlo.
import { buildBackup, parseBackup } from '../../lib/backup.js';

/**
 * Crea las funciones de respaldo. Van en su propio archivo para no alargar el adaptador.
 *
 * @param {{readEvents: Function, replaceEvents: Function}} store - El almacén de eventos.
 * @returns {{exportBackup: Function, importBackup: Function}} Funciones asíncronas.
 */
export function createBackupFunctions(store) {
  return {
    /** @returns {Promise<string>} El texto JSON del respaldo, con todo el historial. */
    async exportBackup() {
      return buildBackup(store.readEvents(), new Date().toISOString());
    },

    /**
     * Reemplaza todo el historial con el de un archivo de respaldo, si es válido.
     *
     * @param {{text: Function}} file - El archivo elegido (un File del navegador).
     * @returns {Promise<number>} Cuántos eventos se restauraron.
     */
    async importBackup(file) {
      const events = parseBackup(await file.text());
      store.replaceEvents(events);
      return events.length;
    },
  };
}
