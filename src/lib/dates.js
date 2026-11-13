// Funciones puras sobre fechas. Las fechas se guardan en UTC y se muestran en la hora de la casa.
import { HOUSE_TIME_ZONE } from '../shared/constants.js';

/**
 * Convierte una fecha guardada (ISO, UTC) en un texto corto en la hora de la casa.
 * Importa la zona horaria: algo hecho a las 8 pm en Denver ya es "mañana" en UTC.
 *
 * @param {string} isoDate - Fecha en formato ISO 8601, por ejemplo "2026-11-14T03:15:00.000Z".
 * @returns {string} La fecha como "13 nov 2026".
 */
export function formatHouseDate(isoDate) {
  const formatter = new Intl.DateTimeFormat('es', {
    timeZone: HOUSE_TIME_ZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return formatter.format(new Date(isoDate));
}
