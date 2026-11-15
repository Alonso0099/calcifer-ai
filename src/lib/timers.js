// Funciones puras de los temporizadores del modo de cocina.
// Un temporizador guarda la hora en que termina (no cuánto le falta): así sigue bien aunque se cierre la app.

/**
 * Crea un temporizador que termina dentro de cierta cantidad de minutos.
 *
 * @param {string} id - Un id único.
 * @param {string} label - Para qué es ("Paso 3", "Arroz").
 * @param {number} minutes - Cuántos minutos dura.
 * @param {number} now - La hora actual, en milisegundos.
 * @returns {{id: string, label: string, durationMs: number, endsAt: number}} El temporizador.
 */
export function createTimer(id, label, minutes, now) {
  const durationMs = minutes * 60000;
  return { id, label, durationMs, endsAt: now + durationMs };
}

/**
 * Calcula cuánto le falta a un temporizador. Nunca regresa menos de cero.
 *
 * @param {{endsAt: number}} timer - El temporizador.
 * @param {number} now - La hora actual, en milisegundos.
 * @returns {number} Milisegundos que faltan.
 */
export function getRemainingMs(timer, now) {
  return Math.max(0, timer.endsAt - now);
}

/**
 * Dice si un temporizador ya terminó. Terminar no significa que la comida esté cocida:
 * eso lo confirma la persona.
 *
 * @param {{endsAt: number}} timer - El temporizador.
 * @param {number} now - La hora actual, en milisegundos.
 * @returns {boolean} true si ya pasó la hora de término.
 */
export function isTimerDone(timer, now) {
  return getRemainingMs(timer, now) === 0;
}

/**
 * Ordena los temporizadores: los que terminan antes van primero.
 *
 * @param {Array<{endsAt: number}>} timers - Los temporizadores.
 * @returns {Array<{endsAt: number}>} Una copia ordenada.
 */
export function sortTimers(timers) {
  return [...timers].sort((first, second) => first.endsAt - second.endsAt);
}
