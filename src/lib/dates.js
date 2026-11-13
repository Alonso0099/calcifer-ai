// Funciones puras sobre fechas. Las fechas se guardan en UTC y se muestran en la hora de la casa.
import { HOUSE_TIME_ZONE, MS_PER_DAY } from '../shared/constants.js';

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

/**
 * Convierte un momento en el número de su día en el calendario de la casa.
 * Sirve para restar fechas y obtener días completos: dos momentos del mismo día
 * en Denver dan el mismo número, sin importar la hora ni el cambio de horario.
 *
 * @param {Date} date - Un momento cualquiera.
 * @returns {number} El número del día (días desde el 1 de enero de 1970).
 */
export function getHouseDayNumber(date) {
  // formatToParts regresa la fecha en piezas (año, mes, día) ya en la hora de la casa.
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: HOUSE_TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);
  const getPart = (type) => Number(parts.find((part) => part.type === type).value);
  return Date.UTC(getPart('year'), getPart('month') - 1, getPart('day')) / MS_PER_DAY;
}

/**
 * Escribe el día de la casa como "2026-11-13". Se usa en el nombre del archivo de
 * respaldo: con ese formato, los archivos se ordenan solos por fecha.
 *
 * @param {Date} date - Un momento cualquiera.
 * @returns {string} El día en formato año-mes-día.
 */
export function getHouseDayText(date) {
  // El idioma "en-CA" (inglés de Canadá) escribe las fechas justo como año-mes-día.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: HOUSE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
