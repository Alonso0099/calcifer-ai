// Guarda y lee el historial de eventos en el almacenamiento del dispositivo.
// Es el único archivo de la app que toca el almacenamiento directamente.
import { STORAGE_KEY } from '../../shared/constants.js';

/**
 * Crea el "almacén" de eventos. Recibe el almacenamiento como parámetro (en la app
 * es localStorage) para que las pruebas puedan pasar uno falso que vive en memoria.
 *
 * @param {{getItem: Function, setItem: Function}} storage - Dónde se guardan los datos.
 * @returns {{readEvents: Function, appendEvent: Function, replaceEvents: Function}}
 *   Funciones para leer el historial, agregar un evento y reemplazar todo (restaurar).
 */
export function createEventStore(storage) {
  /**
   * Lee todos los eventos guardados.
   *
   * @returns {object[]} Los eventos, del más viejo al más nuevo.
   */
  function readEvents() {
    const savedText = storage.getItem(STORAGE_KEY);
    // Si lo guardado estuviera dañado, JSON.parse lanza un error. Es a propósito:
    // regresar una lista vacía haría que el siguiente guardado borrara el historial.
    return savedText === null ? [] : JSON.parse(savedText);
  }

  /**
   * Reemplaza todo el historial. Solo se usa al restaurar un respaldo.
   *
   * @param {object[]} events - El historial nuevo.
   */
  function replaceEvents(events) {
    storage.setItem(STORAGE_KEY, JSON.stringify(events));
  }

  /**
   * Agrega un evento nuevo al final del historial, con su id y su fecha.
   * Los eventos anteriores nunca se editan ni se borran (Regla 3).
   *
   * @param {string} type - El tipo de evento (uno de EVENT_TYPES).
   * @param {object} fields - Los datos propios de ese tipo (processId, stepId, minutes...).
   * @returns {object} El evento ya guardado.
   */
  function appendEvent(type, fields) {
    const event = { id: crypto.randomUUID(), type, ...fields, createdAt: new Date().toISOString() };
    replaceEvents([...readEvents(), event]);
    return event;
  }

  return { readEvents, appendEvent, replaceEvents };
}
