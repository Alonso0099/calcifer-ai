// Funciones puras del respaldo: armar el archivo y revisar uno antes de restaurarlo.
import { BACKUP_APP_NAME, BACKUP_ERRORS, BACKUP_SCHEMA_VERSION, EVENT_TYPES } from '../shared/constants.js';

/**
 * Arma el texto del archivo de respaldo con todo el historial.
 *
 * @param {object[]} events - Todos los eventos guardados (incluidas las notas).
 * @param {string} exportedAt - Fecha ISO del momento del respaldo.
 * @returns {string} Texto JSON listo para descargarse.
 */
export function buildBackup(events, exportedAt) {
  const backup = { app: BACKUP_APP_NAME, schemaVersion: BACKUP_SCHEMA_VERSION, exportedAt, events };
  return JSON.stringify(backup, null, 2);
}

/**
 * Lee el texto de un archivo de respaldo y revisa que de verdad sea de esta app.
 * Existe para no reemplazar el historial con un archivo equivocado o dañado.
 *
 * @param {string} fileText - El contenido del archivo elegido por el usuario.
 * @returns {object[]} Los eventos del respaldo.
 * @throws {Error} Si el archivo no es un respaldo válido. El mensaje es un código de
 *   BACKUP_ERRORS; la pantalla lo traduce a un texto de text.js.
 */
export function parseBackup(fileText) {
  let backup;
  try {
    backup = JSON.parse(fileText);
  } catch {
    throw new Error(BACKUP_ERRORS.notJson);
  }
  if (backup === null || backup.app !== BACKUP_APP_NAME) throw new Error(BACKUP_ERRORS.wrongApp);
  if (backup.schemaVersion !== BACKUP_SCHEMA_VERSION) throw new Error(BACKUP_ERRORS.unknownVersion);
  if (!Array.isArray(backup.events)) throw new Error(BACKUP_ERRORS.invalidEvents);

  const knownTypes = Object.values(EVENT_TYPES);
  const allEventsAreValid = backup.events.every(
    (event) =>
      event !== null &&
      typeof event.id === 'string' &&
      typeof event.createdAt === 'string' &&
      knownTypes.includes(event.type),
  );
  if (!allEventsAreValid) throw new Error(BACKUP_ERRORS.invalidEvents);
  return backup.events;
}
