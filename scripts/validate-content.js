// Revisa que el contenido de src/content/ cumpla las reglas de CLAUDE.md e imprime
// cuántos procesos hay y qué datos siguen pendientes. Se corre con "npm run validate".
import { readFileSync } from 'node:fs';
import { CATEGORIES, checkProcess, isSlug, isValidEstimate } from './content-rules.js';

const CONTENT_FOLDER = new URL('../src/content/', import.meta.url);

/**
 * Lee un archivo JSON de la carpeta de contenido.
 *
 * @param {string} relativePath - Ruta dentro de src/content/ (por ejemplo, "zones.json").
 * @returns {object} El contenido del archivo ya convertido a objeto.
 */
function readContent(relativePath) {
  return JSON.parse(readFileSync(new URL(relativePath, CONTENT_FOLDER), 'utf8'));
}

/**
 * Revisa las zonas y regresa sus ids para poder validar los procesos.
 *
 * @param {string[]} errors - Lista donde se agregan los errores encontrados.
 * @returns {Set<string>} Los ids de zona que existen.
 */
function validateZones(errors) {
  const zoneIds = new Set();
  for (const zone of readContent('zones.json').zones) {
    if (!isSlug(zone.id)) errors.push(`zones.json: id inválido "${zone.id}"`);
    if (zoneIds.has(zone.id)) errors.push(`zones.json: id repetido "${zone.id}"`);
    if (typeof zone.name !== 'string' || zone.name === '') errors.push(`zones.json: "${zone.id}" no tiene nombre`);
    zoneIds.add(zone.id);
  }
  return zoneIds;
}

/**
 * Revisa los seis archivos de procesos.
 *
 * @param {Set<string>} zoneIds - Los ids de zona que existen.
 * @param {string[]} errors - Lista donde se agregan los errores encontrados.
 * @returns {object[]} Todos los procesos, de todas las categorías.
 */
function validateProcesses(zoneIds, errors) {
  const allProcesses = [];
  const seenIds = new Set();
  for (const category of CATEGORIES) {
    for (const process of readContent(`processes/${category}.json`).processes) {
      if (seenIds.has(process.id)) errors.push(`${category}.json: id repetido "${process.id}"`);
      seenIds.add(process.id);
      for (const error of checkProcess(process, category, zoneIds)) {
        errors.push(`${category}.json → ${process.id}: ${error}`);
      }
      allProcesses.push(process);
    }
  }
  return allProcesses;
}

/**
 * Revisa la semana tipo: cada bloque debe apuntar a un proceso que existe.
 *
 * @param {object[]} processes - Todos los procesos.
 * @param {string[]} errors - Lista donde se agregan los errores encontrados.
 */
function validateWeek(processes, errors) {
  const processIds = new Set(processes.map((process) => process.id));
  for (const day of readContent('week.json').days) {
    if (!isSlug(day.id)) errors.push(`week.json: id de día inválido "${day.id}"`);
    for (const block of day.blocks) {
      const where = `week.json → ${day.id} → ${block.processId}`;
      if (!processIds.has(block.processId)) errors.push(`${where}: ese proceso no existe`);
      if (!isValidEstimate(block.estimatedMinutes)) errors.push(`${where}: estimatedMinutes inválido`);
      if ('owner' in block) errors.push(`${where}: no debe existir el campo "owner"`);
      const hasValidEveryWeeks = !('everyWeeks' in block) || (Number.isInteger(block.everyWeeks) && block.everyWeeks > 1);
      if (!hasValidEveryWeeks) errors.push(`${where}: everyWeeks debe ser un entero mayor que 1`);
    }
  }
}

/**
 * Imprime el resumen: procesos por categoría y la lista de pendientes.
 *
 * @param {object[]} processes - Todos los procesos ya validados.
 */
function printSummary(processes) {
  console.log(`Procesos: ${processes.length}`);
  for (const category of CATEGORIES) {
    const count = processes.filter((process) => process.category === category).length;
    console.log(`  ${category}: ${count}`);
  }
  const withPending = processes.filter((process) => process.pending.length > 0);
  console.log(`\nProcesos con pendientes: ${withPending.length}`);
  for (const field of ['steps', 'steps.minutes', 'estimatedMinutes', 'zone', 'frequencyDays']) {
    const count = processes.filter((process) => process.pending.includes(field)).length;
    if (count > 0) console.log(`  ${field}: ${count}`);
  }
  console.log('\nPendientes por proceso:');
  for (const process of withPending) {
    console.log(`  ${process.id}: ${process.pending.join(', ')}`);
  }
}

const errors = [];
const zoneIds = validateZones(errors);
const processes = validateProcesses(zoneIds, errors);
validateWeek(processes, errors);

if (errors.length > 0) {
  console.error(`El contenido tiene ${errors.length} error(es):`);
  for (const error of errors) console.error(`  ✗ ${error}`);
  // Un código de salida distinto de 0 detiene "npm run build": no se publica contenido roto.
  process.exit(1);
}
printSummary(processes);
console.log('\n✓ Contenido válido');
