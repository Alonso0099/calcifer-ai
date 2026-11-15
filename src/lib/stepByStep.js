// Funciones puras del modo paso a paso: qué tipo de actividad es un proceso y qué pasos tocan hoy.
import { MENU_GROUPS } from '../shared/constants.js';

const KIND_BY_CATEGORY = { limpieza: 'cleaning', mantenimiento: 'cleaning', guardar: 'storing', compra: 'shopping' };
const PREP_GROUPS = ['prep-carnes', 'prep-verduras'];

/**
 * Dice qué tipo de actividad es un proceso, para que el botón diga "Cocinar", "Limpiar",
 * "Guardar"... en vez de "Cocinar" para todo.
 *
 * @param {{category: string, group?: string}} process - El proceso.
 * @returns {'recipe'|'prep'|'cleaning'|'storing'|'shopping'|'other'} El tipo (la llave de text.cooking.stepByStep).
 */
export function getStepByStepKind(process) {
  if (process.category === 'preparar') {
    if (MENU_GROUPS.includes(process.group)) return 'recipe';
    if (PREP_GROUPS.includes(process.group)) return 'prep';
    return 'other';
  }
  return KIND_BY_CATEGORY[process.category] ?? 'other';
}

/**
 * Dice si hoy se empacan los almuerzos de mañana, según la semana tipo del manual
 * (de domingo a jueves sí; viernes y sábado no, porque el fin de semana no se empaca).
 *
 * @param {{days: Array<{id: string, packLunchForTomorrow: boolean}>}} weekPlan - La semana tipo.
 * @param {string} weekdayId - El día de hoy: "domingo", "lunes"...
 * @returns {boolean} true si hoy toca empacar.
 */
export function packsLunchOn(weekPlan, weekdayId) {
  return weekPlan.days.find((day) => day.id === weekdayId)?.packLunchForTomorrow ?? false;
}

/**
 * Deja solo los pasos que tocan hoy: un paso marcado con onlyIfPackingLunch no aparece
 * los días en que no se empaca almuerzo.
 *
 * @param {Array<{onlyIfPackingLunch?: boolean}>} steps - Los pasos del proceso.
 * @param {boolean} packsLunchToday - Si hoy se empacan los almuerzos de mañana.
 * @returns {object[]} Los pasos que se muestran hoy.
 */
export function getStepsForToday(steps, packsLunchToday) {
  return steps.filter((step) => !step.onlyIfPackingLunch || packsLunchToday);
}
