// Guarda y lee los ajustes de este dispositivo (tema, tamaño de letra, sonido, movimiento).
// No son eventos: son preferencias del aparato, así que no entran al historial, al Deshacer ni al respaldo.
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '../../shared/constants.js';

/**
 * Crea las dos funciones de la capa de datos para los ajustes.
 *
 * @param {{getItem: Function, setItem: Function}} storage - Dónde se guardan los datos.
 * @returns {{getSettings: Function, saveSettings: Function}} Funciones asíncronas.
 */
export function createSettingsFunctions(storage) {
  return {
    /**
     * Lee los ajustes. Lo que nunca se ha cambiado toma el valor predeterminado, así que
     * un ajuste nuevo que se agregue después funciona también en un dispositivo viejo.
     *
     * @returns {Promise<{theme: string, textSize: string, timerSound: boolean, motion: boolean}>} Los ajustes completos.
     */
    async getSettings() {
      const savedText = storage.getItem(SETTINGS_STORAGE_KEY);
      return { ...DEFAULT_SETTINGS, ...(savedText === null ? {} : JSON.parse(savedText)) };
    },

    /**
     * Guarda los ajustes completos (reemplaza los anteriores).
     *
     * @param {{theme: string, textSize: string, timerSound: boolean, motion: boolean}} settings - Los ajustes nuevos.
     * @returns {Promise<void>}
     */
    async saveSettings(settings) {
      storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    },
  };
}
