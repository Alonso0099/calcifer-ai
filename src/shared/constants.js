// Valores fijos con nombre, para que el código no tenga textos ni números "mágicos".

/** Clave con la que se guarda el historial de eventos en el dispositivo. */
export const STORAGE_KEY = 'calcifer.events';

/** Clave con la que se guardan los cronómetros en curso (no son parte del historial). */
export const STOPWATCH_STORAGE_KEY = 'calcifer.stopwatches';

/** Los tipos de evento que existen (ver "Regla 3" en CLAUDE.md). */
export const EVENT_TYPES = {
  stepChecked: 'step_checked',
  stepUnchecked: 'step_unchecked',
  processFinished: 'process_finished',
  noteSaved: 'note_saved',
  noteDeleted: 'note_deleted',
  eventUndone: 'event_undone',
};

/** Opciones de "¿Quién lo hizo?". Es solo una nota de historial, nunca una asignación. */
export const DONE_BY_OPTIONS = ['Nano', 'Tita', 'Ambos'];

/** La opción que viene elegida al terminar un proceso. */
export const DEFAULT_DONE_BY = 'Ambos';

/** Datos que identifican un archivo de respaldo de esta app. */
export const BACKUP_APP_NAME = 'calcifer';
export const BACKUP_SCHEMA_VERSION = 1;

/** Con qué empieza el nombre del archivo de respaldo; después va la fecha. */
export const BACKUP_FILE_PREFIX = 'calcifer-respaldo';

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
export const PREPARE_GROUPS = [
  'prep-carnes',
  'prep-verduras',
  'pollo',
  'cerdo',
  'res',
  'seafood',
  'sopas',
  'flex',
  'desayunos',
  'marinadas',
];

/** Milisegundos en un segundo y en un minuto, para las cuentas del cronómetro. */
export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60000;
export const MS_PER_DAY = 86400000;

/**
 * Umbral de color de las barras de vencimiento: una tarea "vence pronto" (mostaza)
 * cuando le quedan estos días o menos. Con más días está "al día" (oliva).
 */
export const DUE_SOON_THRESHOLD_DAYS = 3;

/** Las categorías cuyas tareas aparecen en la pantalla de limpieza y mantenimiento. */
export const MAINTENANCE_CATEGORIES = ['limpieza', 'mantenimiento'];
