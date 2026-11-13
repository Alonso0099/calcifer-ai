// Valores fijos con nombre, para que el código no tenga textos ni números "mágicos".

/** Clave con la que se guarda el historial de eventos en el dispositivo. */
export const STORAGE_KEY = 'calcifer.events';

/** Los tipos de evento que existen (ver "Regla 3" en CLAUDE.md). */
export const EVENT_TYPES = {
  stepChecked: 'step_checked',
  stepUnchecked: 'step_unchecked',
  processFinished: 'process_finished',
  noteSaved: 'note_saved',
  noteDeleted: 'note_deleted',
  eventUndone: 'event_undone',
};

/** Nombres que se pueden anotar en "¿Quién lo hizo?". Es solo una nota de historial. */
export const DONE_BY_OPTIONS = ['Alonso', 'Tita'];

/** Datos que identifican un archivo de respaldo de esta app. */
export const BACKUP_APP_NAME = 'calcifer';
export const BACKUP_SCHEMA_VERSION = 1;

/**
 * Códigos de error al leer un respaldo. Son códigos y no frases porque los textos
 * que ve el usuario viven en text.js; la pantalla de respaldo traduce cada código.
 */
export const BACKUP_ERRORS = {
  notJson: 'backup_not_json',
  wrongApp: 'backup_wrong_app',
  unknownVersion: 'backup_unknown_version',
  invalidEvents: 'backup_invalid_events',
};

/** Zona horaria de la casa: con ella se decide qué día es "hoy" y cómo se muestran las fechas. */
export const HOUSE_TIME_ZONE = 'America/Denver';

/** Las categorías de procesos, en el orden del flujo de la cocina. */
export const CATEGORIES = ['compra', 'guardar', 'preparar', 'limpieza', 'mantenimiento', 'seguridad'];

/** Los grupos en que se divide la categoría "preparar", en el orden en que se muestran. */
export const PREPARE_GROUPS = ['pollo', 'cerdo', 'res', 'seafood', 'sopas', 'flex', 'desayunos', 'marinadas'];

/** Milisegundos en un segundo y en un minuto, para las cuentas del cronómetro. */
export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60000;
