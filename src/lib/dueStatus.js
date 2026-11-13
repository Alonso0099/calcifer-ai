// Funciones puras de vencimiento: cuántos días faltan, en qué estado está una tarea
// y cuánto se llena su barra. Todo se calcula; nada de esto se guarda.
import { DUE_SOON_THRESHOLD_DAYS } from '../shared/constants.js';
import { getHouseDayNumber } from './dates.js';

/** Los estados posibles, del más urgente al menos urgente. El orden sirve para comparar. */
const STATUSES_BY_URGENCY = ['late', 'today', 'soon', 'none', 'ok'];

/**
 * Calcula cuántos días faltan para que una tarea venza.
 * Un número negativo significa que la tarea está atrasada.
 *
 * @param {string|null} lastDoneIso - Fecha ISO (UTC) de la última vez que se hizo, o null si nunca.
 * @param {number} frequencyDays - Cada cuántos días se repite la tarea.
 * @param {Date} today - El momento actual; se convierte al día de America/Denver (se recibe como parámetro para poder probarla).
 * @returns {number|null} Días restantes, o null si nunca se ha hecho.
 */
export function getDaysUntilDue(lastDoneIso, frequencyDays, today) {
  if (lastDoneIso === null) return null;
  const lastDoneDay = getHouseDayNumber(new Date(lastDoneIso));
  return lastDoneDay + frequencyDays - getHouseDayNumber(today);
}

/**
 * Clasifica una tarea según los días que le faltan.
 *
 * @param {number|null} daysUntilDue - Lo que regresa getDaysUntilDue.
 * @returns {'none'|'late'|'today'|'soon'|'ok'} "none" es sin registro; "soon", vence pronto.
 */
export function getDueStatus(daysUntilDue) {
  if (daysUntilDue === null) return 'none';
  if (daysUntilDue < 0) return 'late';
  if (daysUntilDue === 0) return 'today';
  return daysUntilDue <= DUE_SOON_THRESHOLD_DAYS ? 'soon' : 'ok';
}

/**
 * Calcula qué parte de la barra se llena: la fracción del plazo que ya pasó.
 * Recién hecha está vacía (0); al vencer o atrasarse está llena (1).
 *
 * @param {number|null} daysUntilDue - Lo que regresa getDaysUntilDue.
 * @param {number} frequencyDays - Cada cuántos días se repite la tarea.
 * @returns {number} Un número entre 0 y 1. Sin registro es 0.
 */
export function getDueProgress(daysUntilDue, frequencyDays) {
  if (daysUntilDue === null) return 0;
  const elapsedFraction = (frequencyDays - daysUntilDue) / frequencyDays;
  return Math.min(1, Math.max(0, elapsedFraction));
}

/**
 * Compara dos tareas para ordenarlas de la más urgente a la menos urgente.
 * Primero por estado; entre dos del mismo estado, va antes la que vence antes.
 * "Sin registro" va antes que "al día": no se sabe cuándo se hizo, así que conviene revisarla.
 *
 * @param {{status: string, daysUntilDue: number|null}} first - Una tarea.
 * @param {{status: string, daysUntilDue: number|null}} second - Otra tarea.
 * @returns {number} Negativo si la primera es más urgente (como pide Array.sort).
 */
export function compareByUrgency(first, second) {
  const statusDifference = STATUSES_BY_URGENCY.indexOf(first.status) - STATUSES_BY_URGENCY.indexOf(second.status);
  if (statusDifference !== 0) return statusDifference;
  return (first.daysUntilDue ?? 0) - (second.daysUntilDue ?? 0);
}
