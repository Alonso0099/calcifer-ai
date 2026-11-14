// Funciones puras del menú: qué comida está planeada en cada día, a partir de los eventos.
import { EVENT_TYPES, MEAL_KINDS } from '../shared/constants.js';
import { getActiveEvents } from './events.js';

/**
 * Arma el menú como está hoy. Cada momento de comida (día + desayuno/almuerzo/cena)
 * muestra lo último que se planeó ahí; elegir "quitar" lo deja vacío.
 * Como todo son eventos, cambiar el menú se puede deshacer.
 *
 * @param {object[]} events - Todos los eventos, del más viejo al más nuevo.
 * @returns {Record<string, Record<string, {kind: string, processId: string|null}>>}
 *   Un objeto por día ("2026-11-13") con sus momentos planeados: { dinner: { kind, processId } }.
 */
export function getMealPlanByDay(events) {
  const planByDay = {};
  for (const event of getActiveEvents(events)) {
    if (event.type !== EVENT_TYPES.mealPlanned) continue;
    const dayPlan = planByDay[event.day] ?? {};
    if (event.kind === MEAL_KINDS.none) delete dayPlan[event.slot];
    else dayPlan[event.slot] = { kind: event.kind, processId: event.processId ?? null };
    planByDay[event.day] = dayPlan;
  }
  return planByDay;
}
