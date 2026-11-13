// Funciones puras para la búsqueda: comparar textos sin distinguir mayúsculas ni acentos.

/**
 * Deja un texto listo para comparar: minúsculas, sin acentos y sin espacios sobrantes.
 * normalize('NFD') separa cada letra de su acento ("á" → "a" + "´") y el replace
 * quita los acentos sueltos. La ñ también pierde su tilde, así "nino" encuentra "niño".
 *
 * @param {string} value - El texto original.
 * @returns {string} El texto simplificado.
 */
export function normalizeText(value) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Dice si un proceso coincide con una búsqueda, por su nombre o por el texto de sus pasos.
 *
 * @param {{name: string, steps: Array<{text: string}>}} process - El proceso a revisar.
 * @param {string} query - Lo que escribió el usuario.
 * @returns {boolean} true si el proceso coincide. Una búsqueda vacía no coincide con nada.
 */
export function processMatchesSearch(process, query) {
  const normalizedQuery = normalizeText(query);
  if (normalizedQuery === '') return false;
  const searchableTexts = [process.name, ...process.steps.map((step) => step.text)];
  return searchableTexts.some((value) => normalizeText(value).includes(normalizedQuery));
}

/**
 * Busca el paso que hizo que un proceso apareciera en los resultados, para mostrarlo.
 * Si el nombre del proceso ya coincide, no hace falta explicar nada y regresa null.
 *
 * @param {{name: string, steps: Array<{text: string}>}} process - Un proceso de los resultados.
 * @param {string} query - Lo que escribió el usuario.
 * @returns {string|null} El texto del primer paso que coincide, o null.
 */
export function findMatchingStepText(process, query) {
  const normalizedQuery = normalizeText(query);
  if (normalizedQuery === '' || normalizeText(process.name).includes(normalizedQuery)) return null;
  const matchingStep = process.steps.find((step) => normalizeText(step.text).includes(normalizedQuery));
  return matchingStep ? matchingStep.text : null;
}
