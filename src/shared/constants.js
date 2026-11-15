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
  mealPlanned: 'meal_planned',
  freezerItemSaved: 'freezer_item_saved',
  freezerItemRemoved: 'freezer_item_removed',
  shoppingItemAdded: 'shopping_item_added',
  shoppingItemRemoved: 'shopping_item_removed',
  shoppingItemChecked: 'shopping_item_checked',
  shoppingItemUnchecked: 'shopping_item_unchecked',
  shoppingCompleted: 'shopping_completed',
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

/** Los momentos de comida de un día, en el orden en que se muestran. */
export const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner'];

/**
 * Qué puede ir en un momento de comida: una receta, o una de estas opciones sin receta.
 * "none" se usa para quitar lo planeado.
 */
export const MEAL_KINDS = { recipe: 'recipe', leftovers: 'leftovers', eatOut: 'eat_out', quick: 'quick', none: 'none' };

/** Grupos de "preparar" que son comidas y se pueden poner en el menú. */
export const MENU_GROUPS = ['pollo', 'cerdo', 'res', 'seafood', 'sopas', 'flex', 'desayunos'];

/** Grupos cuya proteína suele venir del congelador: avisan que hay que descongelar la noche anterior. */
export const THAW_GROUPS = ['pollo', 'cerdo', 'res', 'seafood'];

/** Procesos que se hacen cada día que se cocina (ids del contenido). */
export const AFTER_COOKING_PROCESS_ID = 'limpieza-de-cada-vez';
export const NIGHT_CLOSE_PROCESS_ID = 'cierre-diario';
/** El bloque de la semana tipo que ya queda cubierto por "cocinar + limpiar + cerrar". */
export const DAILY_SERVICE_PROCESS_ID = 'servicio-diario';

/** Los ids de los días en week.json, en el orden de getUTCDay (0 = domingo). */
export const WEEKDAY_IDS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
export const DAYS_PER_WEEK = 7;

/** Procesos que, al terminar, tienen un siguiente paso en otra pantalla (la ruta a la que se ofrece ir). */
export const FOLLOW_UP_ROUTE_BY_PROCESS_ID = { 'prep-mensual-carnes': '/congelador' };

/** El proceso que explica cómo descongelar la proteína de mañana. */
export const THAW_PROCESS_ID = 'descongelar-para-manana';

/** Por qué sale una bolsa del congelador. "correction" es para arreglar un registro equivocado. */
export const FREEZER_REMOVE_REASONS = ['cooked', 'discarded', 'correction'];

/** Días antes de la fecha límite en que una bolsa se marca como "usar pronto". */
export const USE_SOON_THRESHOLD_DAYS = 30;

/** Cuántos días del menú (desde hoy) se miran para sacar los ingredientes de la lista de compras. */
export const SHOPPING_MENU_DAYS = 7;

/** Ingredientes que son 1 unidad de proteína: esos salen del congelador, no de la lista de ingredientes. */
export const PROTEIN_UNIT_PATTERN = /unidad(es)? de /i;

/** Ingredientes que solo remiten a otra receta ("Los ingredientes de Carne en Salsa"): no se compran. */
export const REFERENCE_INGREDIENT_PATTERN = /^(los|las) (ingredientes|camarones) de |^la salsa que se quiera/i;

/** Clave con la que se guardan los temporizadores en curso (no son parte del historial). */
export const TIMERS_STORAGE_KEY = 'calcifer.timers';

/** Minutos de los botones rápidos de temporizador del modo de cocina. */
export const TIMER_PRESET_MINUTES = [5, 10, 15, 30];

/** Cuántos temporizadores puede haber a la vez en el modo de cocina. */
export const MAX_TIMERS = 8;

/** Tamaños para ajustar cuánto se cocina. Solo cambian lo que se muestra en los ingredientes. */
export const QUANTITY_FACTORS = [0.5, 1, 2];

/** Grupos de recetas que son comida cocinada: al terminar piden confirmar que quedó bien cocida. */
export const COOKED_FOOD_GROUPS = MENU_GROUPS;

/** Grupos de recetas que dejan sobras o almuerzos: al terminar piden confirmar que se guardaron. */
export const LEFTOVER_GROUPS = ['pollo', 'cerdo', 'res', 'seafood', 'sopas', 'flex'];

/** El pitido cuando termina un temporizador: tono, volumen (0 a 1) y duración. */
export const BEEP = { frequencyHz: 880, volume: 0.2, seconds: 0.4 };

/** El patrón de vibración al terminar un temporizador (vibra, pausa, vibra), en milisegundos. */
export const VIBRATION_PATTERN_MS = [200, 100, 200];

/** La dirección del modo paso a paso (sirve para recetas, limpiezas, compras...). */
export const STEP_BY_STEP_PATH = '/paso-a-paso';
