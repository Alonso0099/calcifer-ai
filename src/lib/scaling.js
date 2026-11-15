// Función pura que escribe un ingrediente para otro tamaño de receta (½, 1 o 2 veces).
import { formatAmount } from './quantity.js';

/**
 * Escribe un ingrediente. Con el tamaño normal (1) devuelve las palabras del manual tal cual;
 * con otro tamaño recalcula la cantidad y la escribe de nuevo. Si no hay unidad, escribe
 * "nombre: cantidad", porque no se puede poner un nombre en plural de forma segura. Solo cambia lo que se muestra:
 * los pasos, los tiempos y las temperaturas no se ajustan.
 *
 * @param {{text: string, name: string, amount: number|null, amountMax?: number, unit: string|null, optional?: boolean}} ingredient
 *   El ingrediente, como viene de la receta.
 * @param {number} factor - Cuántas veces la receta: 0.5, 1 o 2.
 * @param {(unit: string, amount: number) => string} unitLabel - Escribe la unidad en singular o plural.
 * @returns {string} El ingrediente listo para mostrar.
 */
export function describeIngredient(ingredient, factor, unitLabel) {
  if (factor === 1 || ingredient.amount === null) return ingredient.text;
  const scaledAmount = ingredient.amount * factor;
  const scaledMax = ingredient.amountMax ? ingredient.amountMax * factor : undefined;
  const amountText = formatAmount(scaledAmount, scaledMax);
  const optionalText = ingredient.optional ? ' (opcional)' : '';
  const sectionText = ingredient.section ? `${ingredient.section}: ` : '';
  if (!ingredient.unit) {
    // Sin unidad ("1 cebolla") no se intenta poner el nombre en plural: se escribe "cebolla: 2".
    return `${sectionText}${ingredient.name}: ${amountText}${optionalText}`;
  }
  const unitText = ` ${unitLabel(ingredient.unit, scaledMax ?? scaledAmount)} de`;
  return `${sectionText}${amountText}${unitText} ${ingredient.name}${optionalText}`;
}
