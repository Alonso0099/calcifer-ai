// Las reglas que debe cumplir cada ingrediente de una receta o marinada.

/** Las unidades de medida permitidas. Un ingrediente sin unidad ("2 cebollas") lleva null. */
export const INGREDIENT_UNITS = ['cda', 'cdta', 'taza', 'lb', 'oz', 'lata', 'diente', 'pizca', 'tallo', 'unidad'];
const ALLOWED_FIELDS = ['text', 'name', 'amount', 'amountMax', 'unit', 'optional', 'section'];

/**
 * Revisa un ingrediente. "text" son las palabras del manual y es lo que se muestra;
 * los demás campos lo parten en piezas para poder sumar cantidades y armar compras.
 *
 * @param {object} ingredient - El ingrediente tal como viene del JSON.
 * @returns {string[]} Errores encontrados (lista vacía si todo está bien).
 */
export function checkIngredient(ingredient) {
  if (ingredient === null || typeof ingredient !== 'object') return ['cada ingrediente debe ser un objeto'];
  const errors = [];
  const label = `ingrediente "${ingredient.text}"`;
  const isText = (value) => typeof value === 'string' && value.trim() !== '';
  if (!isText(ingredient.text)) errors.push('un ingrediente no tiene "text"');
  if (!isText(ingredient.name)) errors.push(`${label}: falta "name"`);
  for (const field of Object.keys(ingredient)) {
    if (!ALLOWED_FIELDS.includes(field)) errors.push(`${label}: campo desconocido "${field}"`);
  }
  const hasAmount = Number.isFinite(ingredient.amount) && ingredient.amount > 0;
  // amount es null cuando el manual no da cantidad ("Sal"); nunca se inventa una.
  if (ingredient.amount !== null && !hasAmount) errors.push(`${label}: amount debe ser un número o null`);
  if ('amountMax' in ingredient && !(hasAmount && ingredient.amountMax > ingredient.amount)) {
    errors.push(`${label}: amountMax debe ser mayor que amount`);
  }
  if (ingredient.unit !== null && !INGREDIENT_UNITS.includes(ingredient.unit)) errors.push(`${label}: unidad desconocida "${ingredient.unit}"`);
  if (ingredient.unit !== null && !hasAmount) errors.push(`${label}: una unidad necesita una cantidad`);
  if ('optional' in ingredient && ingredient.optional !== true) errors.push(`${label}: optional solo se escribe cuando es true`);
  if ('section' in ingredient && !isText(ingredient.section)) errors.push(`${label}: section debe ser texto`);
  return errors;
}
