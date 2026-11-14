// Regla de lenguaje del contenido: los textos dicen qué es cada cosa, sin marcas de
// aparatos o muebles ni nombres propios. La usa el validador de contenido.

/**
 * Marcas de aparatos y muebles, y nombres propios, que no deben aparecer en los textos:
 * el contenido dice qué es cada cosa ("la campana", "la encimera de madera"). Las marcas
 * de productos de limpieza sí se permiten. Los ids no se revisan: nunca se renombran.
 */
const FORBIDDEN_TERMS = [
  'samsung', 'thor', 'soebiz', 'ravinte', 'art3d', 'lifeproof', 'badger', 'ikea', 'karlby',
  'ninja', 'fireavert', 'king chang', 'bespoke', 'havsen', 'reminders', 'google sheets',
];

/**
 * Busca marcas o nombres prohibidos en una lista de textos.
 *
 * @param {string[]} texts - Los textos que ve el usuario (nombre, pasos, notas...).
 * @returns {string[]} Los términos prohibidos que aparecen (lista vacía si no hay ninguno).
 */
export function findForbiddenTerms(texts) {
  const allText = texts.join(' ').toLowerCase();
  return FORBIDDEN_TERMS.filter((term) => new RegExp(`\\b${term}\\b`).test(allText));
}
