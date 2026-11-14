// Funciones puras para escribir cantidades como se leen en una receta: "1½", "1–1½".

const FRACTIONS = [[0.25, '¼'], [1 / 3, '⅓'], [0.375, '⅜'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾']];
// Qué tan cerca debe estar un decimal de una fracción para escribirlo como fracción
// (sumar 1/3 + 1/3 da 0.666…, que debe verse como ⅔).
const FRACTION_TOLERANCE = 0.01;

/**
 * Escribe un número usando fracciones cuando corresponde: 1.5 → "1½", 0.25 → "¼", 3 → "3".
 *
 * @param {number} value - El número a escribir.
 * @returns {string} El número con fracción, o redondeado a 2 decimales si no es una fracción conocida.
 */
export function formatNumber(value) {
  const whole = Math.floor(value + FRACTION_TOLERANCE);
  const rest = value - whole;
  if (Math.abs(rest) < FRACTION_TOLERANCE || Math.abs(rest - 1) < FRACTION_TOLERANCE) return String(Math.round(value));
  const match = FRACTIONS.find(([fraction]) => Math.abs(rest - fraction) < FRACTION_TOLERANCE);
  if (match) return whole > 0 ? `${whole}${match[1]}` : match[1];
  return String(Math.round(value * 100) / 100);
}

/**
 * Escribe una cantidad, con rango si el manual da uno.
 *
 * @param {number} amount - La cantidad (o el mínimo del rango).
 * @param {number} [amountMax] - El máximo del rango, si lo hay.
 * @returns {string} "2", "1½" o "1–1½".
 */
export function formatAmount(amount, amountMax) {
  return amountMax && amountMax > amount ? `${formatNumber(amount)}–${formatNumber(amountMax)}` : formatNumber(amount);
}
