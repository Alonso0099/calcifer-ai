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
 * Dice si un texto contiene la búsqueda, ya simplificada.
 *
 * @param {string} value - El texto donde se busca.
 * @param {string} normalizedQuery - La búsqueda, ya pasada por normalizeText.
 * @returns {boolean} true si la contiene.
 */
function includesQuery(value, normalizedQuery) {
  return normalizeText(value).includes(normalizedQuery);
}

/**
 * Explica por qué un proceso coincide con una búsqueda: por su nombre, por un paso
 * o por un ingrediente. Se revisa en ese orden y se regresa la primera coincidencia.
 *
 * @param {{name: string, steps: Array<{text: string}>, ingredients?: string[]}} process - El proceso a revisar.
 * @param {string} query - Lo que escribió el usuario.
 * @returns {{kind: 'name'|'step'|'ingredient', text: string}|null} Dónde coincidió y con qué
 *   texto, o null si no coincide. Una búsqueda vacía no coincide con nada.
 */
export function findSearchMatch(process, query) {
  const normalizedQuery = normalizeText(query);
  if (normalizedQuery === '') return null;
  if (includesQuery(process.name, normalizedQuery)) return { kind: 'name', text: process.name };
  const step = process.steps.find((candidate) => includesQuery(candidate.text, normalizedQuery));
  if (step) return { kind: 'step', text: step.text };
  const ingredient = (process.ingredients ?? []).find((candidate) => includesQuery(candidate, normalizedQuery));
  if (ingredient) return { kind: 'ingredient', text: ingredient };
  return null;
}

/**
 * Dice si un proceso coincide con una búsqueda (por nombre, pasos o ingredientes).
 *
 * @param {object} process - El proceso a revisar.
 * @param {string} query - Lo que escribió el usuario.
 * @returns {boolean} true si el proceso coincide.
 */
export function processMatchesSearch(process, query) {
  return findSearchMatch(process, query) !== null;
}
