// Las reglas que debe cumplir cada proceso del contenido (src/content/processes/).
// Son funciones puras: reciben un proceso y regresan la lista de errores encontrados.

export const CATEGORIES = ['compra', 'guardar', 'preparar', 'limpieza', 'mantenimiento', 'seguridad'];
const GROUPS = ['prep-carnes', 'prep-verduras', 'pollo', 'cerdo', 'res', 'seafood', 'sopas', 'flex', 'desayunos', 'marinadas'];
const REQUIRED_FIELDS = [
  'id', 'name', 'category', 'zone', 'frequencyDays', 'frequencyLabel',
  'estimatedMinutes', 'active', 'source', 'steps', 'pending',
];
const OPTIONAL_FIELDS = ['ingredients', 'notes', 'group'];
// Un slug: minúsculas y números separados por guiones, sin acentos ni ñ.
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const STEP_ID_PATTERN = /^paso-[1-9][0-9]*$/;

/**
 * Dice si un texto es un id válido en formato slug.
 *
 * @param {unknown} value - El valor a revisar.
 * @returns {boolean} true si es un slug.
 */
export function isSlug(value) {
  return typeof value === 'string' && SLUG_PATTERN.test(value);
}

/**
 * Revisa un tiempo estimado: debe ser null o { min, max } con min <= max.
 *
 * @param {unknown} estimate - El valor de estimatedMinutes.
 * @returns {boolean} true si tiene una forma válida.
 */
export function isValidEstimate(estimate) {
  if (estimate === null) return true;
  if (typeof estimate !== 'object') return false;
  const { min, max } = estimate;
  return Number.isFinite(min) && Number.isFinite(max) && min > 0 && min <= max;
}

/**
 * Dice si un valor es una lista de textos no vacíos (así son ingredients y notes).
 *
 * @param {unknown} value - El valor a revisar.
 * @returns {boolean} true si es una lista de textos.
 */
function isTextList(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim() !== '');
}

/**
 * Calcula qué debe decir "pending" sobre los minutos de los pasos.
 * Mientras ningún paso esté medido basta una sola entrada; cuando ya hay
 * alguno medido, se nombra cada paso que todavía falta.
 *
 * @param {Array<{id: string, minutes: number|null}>} steps - Los pasos del proceso.
 * @returns {string[]} Las entradas de pending que corresponden a los pasos.
 */
function getPendingForSteps(steps) {
  if (steps.length === 0) return ['steps'];
  const unmeasured = steps.filter((step) => step.minutes === null);
  if (unmeasured.length === steps.length) return ['steps.minutes'];
  return unmeasured.map((step) => `steps.${step.id}.minutes`);
}

/**
 * Compara el "pending" escrito en el JSON con lo que de verdad falta.
 * "zone" y "frequencyDays" solo pueden estar en pending si valen null,
 * pero no son obligatorios: a veces null es correcto (una receta no tiene zona).
 *
 * @param {object} process - El proceso a revisar.
 * @returns {string[]} Errores encontrados (lista vacía si pending es correcto).
 */
function checkPending(process) {
  const expected = [...getPendingForSteps(process.steps)];
  if (process.estimatedMinutes === null) expected.push('estimatedMinutes');
  const allowed = [...expected];
  if (process.zone === null) allowed.push('zone');
  if (process.frequencyDays === null) allowed.push('frequencyDays');

  const errors = [];
  for (const field of expected) {
    if (!process.pending.includes(field)) errors.push(`falta "${field}" en pending`);
  }
  for (const field of process.pending) {
    if (!allowed.includes(field)) errors.push(`"${field}" está en pending pero no falta`);
  }
  return errors;
}

/**
 * Revisa los pasos de un proceso: forma, ids y minutos.
 *
 * @param {unknown} steps - El valor del campo steps.
 * @returns {string[]} Errores encontrados.
 */
function checkSteps(steps) {
  if (!Array.isArray(steps)) return ['steps debe ser una lista'];
  const errors = [];
  const seenIds = new Set();
  for (const step of steps) {
    if (!STEP_ID_PATTERN.test(step.id)) errors.push(`id de paso inválido: "${step.id}"`);
    if (seenIds.has(step.id)) errors.push(`id de paso repetido: "${step.id}"`);
    seenIds.add(step.id);
    if (typeof step.text !== 'string' || step.text.trim() === '') errors.push(`${step.id}: falta el texto`);
    const isMeasured = Number.isFinite(step.minutes) && step.minutes > 0;
    if (step.minutes !== null && !isMeasured) errors.push(`${step.id}: minutes debe ser un número o null`);
  }
  return errors;
}

/**
 * Revisa un proceso completo contra las reglas de CLAUDE.md.
 *
 * @param {object} process - El proceso tal como viene del JSON.
 * @param {string} fileCategory - La categoría del archivo donde está (su nombre sin .json).
 * @param {Set<string>} zoneIds - Los ids de zona que existen en zones.json.
 * @returns {string[]} Errores encontrados (lista vacía si todo está bien).
 */
export function checkProcess(process, fileCategory, zoneIds) {
  const errors = [];
  for (const field of REQUIRED_FIELDS) {
    if (!(field in process)) errors.push(`falta el campo "${field}"`);
  }
  // Si faltan campos no tiene caso seguir: las demás revisiones darían errores confusos.
  if (errors.length > 0) return errors;

  for (const field of Object.keys(process)) {
    if (field === 'owner') errors.push('no debe existir el campo "owner" (ver "Sin dueños")');
    else if (!REQUIRED_FIELDS.includes(field) && !OPTIONAL_FIELDS.includes(field)) {
      errors.push(`campo desconocido: "${field}"`);
    }
  }
  if (!isSlug(process.id)) errors.push('el id no es un slug válido');
  if (process.category !== fileCategory) errors.push(`category "${process.category}" no coincide con su archivo`);
  if (process.zone !== null && !zoneIds.has(process.zone)) errors.push(`la zona "${process.zone}" no existe`);
  if ('group' in process && (fileCategory !== 'preparar' || !GROUPS.includes(process.group))) {
    errors.push(`group inválido: "${process.group}"`);
  }
  const hasValidFrequency = process.frequencyDays === null || (Number.isInteger(process.frequencyDays) && process.frequencyDays > 0);
  if (!hasValidFrequency) errors.push('frequencyDays debe ser un número entero de días o null');
  if (process.frequencyLabel !== null && typeof process.frequencyLabel !== 'string') errors.push('frequencyLabel debe ser texto o null');
  if (!isValidEstimate(process.estimatedMinutes)) errors.push('estimatedMinutes debe ser null o { min, max } con min <= max');
  if (typeof process.active !== 'boolean') errors.push('active debe ser true o false');
  for (const field of ['ingredients', 'notes']) {
    if (field in process && !isTextList(process[field])) errors.push(`${field} debe ser una lista de textos`);
  }

  const stepErrors = checkSteps(process.steps);
  errors.push(...stepErrors);
  if (stepErrors.length === 0 && Array.isArray(process.pending)) errors.push(...checkPending(process));
  return errors;
}
