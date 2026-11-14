// Todos los textos que ve el usuario, en un solo lugar.
// Ningún componente escribe un texto directo: lo toma de aquí.

export const text = {
  appName: 'Calcifer',
  common: {
    loading: 'Cargando…',
    loadError: 'No se pudieron cargar los datos.',
    pending: 'Pendiente',
    back: 'Volver a procesos',
  },
  menu: {
    label: 'Secciones',
    toggle: 'Menú',
    processes: 'Procesos',
    week: 'Semana',
    search: 'Buscar',
    maintenance: 'Limpieza',
    notes: 'Notas',
    backup: 'Respaldo',
  },
  install: {
    notice:
      'La app no está instalada en este dispositivo. El navegador puede borrar el historial de un sitio que no está instalado.',
    howTo: 'Para instalarla: en Safari, toca Compartir y luego "Agregar a inicio"; en Chrome, abre el menú y toca "Instalar app".',
    backupLink: 'Mientras tanto, descarga un respaldo',
  },
  categories: {
    compra: 'Compra',
    guardar: 'Guardar',
    preparar: 'Preparar',
    limpieza: 'Limpieza',
    mantenimiento: 'Mantenimiento',
    seguridad: 'Seguridad',
  },
  groups: {
    'prep-carnes': 'Prep de carnes',
    'prep-verduras': 'Prep de verduras, bases y frutas',
    pollo: 'Pollo',
    cerdo: 'Cerdo',
    res: 'Res',
    seafood: 'Seafood',
    sopas: 'Sopas y ollas',
    flex: 'Flex',
    desayunos: 'Desayunos',
    marinadas: 'Marinadas y sazones',
    none: 'Operación',
  },
  time: {
    /** @param {number} minutes */
    measured: (minutes) => `${minutes} min (medido)`,
    /** @param {number} min @param {number} max */
    estimated: (min, max) => (min === max ? `${min} min` : `${min}–${max} min`),
    label: 'Tiempo',
  },
  processList: {
    title: 'Procesos',
    filterLabel: 'Filtrar por categoría',
    all: 'Todas',
    empty: 'No hay procesos en esta categoría.',
    /** @param {number} count */
    stepCount: (count) => (count === 1 ? '1 paso' : `${count} pasos`),
    noSteps: 'Pasos pendientes',
  },
  processDetail: {
    notFound: 'Ese proceso no existe.',
    frequency: 'Frecuencia',
    /** @param {string} date */
    lastDone: (date) => `Última vez: ${date}`,
    neverDone: 'Sin registro todavía',
    ingredients: 'Ingredientes',
    notes: 'Del manual',
    steps: 'Pasos',
    stepsPending: 'El manual todavía no tiene los pasos de este proceso.',
    /** @param {number} done @param {number} total */
    progress: (done, total) => `${done} de ${total}`,
  },
  week: {
    title: 'Semana tipo',
    intro: 'Lo que se hace cada día y el tiempo estimado. Los días se pueden cambiar entre sí.',
    rest: 'Descanso del sistema',
    /** @param {number} weeks */
    everyWeeks: (weeks) => `cada ${weeks} semanas`,
  },
  search: {
    title: 'Buscar',
    inputLabel: 'Buscar por nombre, paso o ingrediente',
    placeholder: 'Por ejemplo: brócoli, filtros, limón',
    hint: 'Escribe una palabra. No importan las mayúsculas ni los acentos.',
    /** @param {number} count */
    resultCount: (count) => (count === 1 ? '1 resultado' : `${count} resultados`),
    empty: 'No se encontró ningún proceso.',
    matched: {
      /** @param {string} stepText */
      step: (stepText) => `Paso: ${stepText}`,
      /** @param {string} ingredientText */
      ingredient: (ingredientText) => `Ingrediente: ${ingredientText}`,
    },
  },
  maintenance: {
    title: 'Limpieza y mantenimiento',
    intro: 'Cada zona muestra el estado de su tarea más atrasada. Para registrar una tarea, ábrela y termínala.',
    /** @param {string} date */
    lastDone: (date) => `Última vez: ${date}`,
  },
  due: {
    none: 'Sin registro',
    ok: 'Al día',
    today: 'Vence hoy',
    /** @param {number} days */
    soon: (days) => (days === 1 ? 'Vence en 1 día' : `Vence en ${days} días`),
    /** @param {number} days */
    late: (days) => (days === 1 ? 'Atrasada 1 día' : `Atrasada ${days} días`),
  },
  notes: {
    title: 'Notas',
    create: 'Nueva nota',
    createTitle: 'Nueva nota',
    editTitle: 'Editar nota',
    empty: 'Todavía no hay notas.',
    untitled: 'Sin título',
    titleLabel: 'Título de la nota',
    titlePlaceholder: 'Título',
    bodyLabel: 'Texto de la nota',
    bodyPlaceholder: 'Escribe aquí…',
    processLabel: 'Ligar a un proceso (opcional)',
    noProcess: 'Sin proceso',
    save: 'Guardar nota',
    delete: 'Borrar nota',
    edit: 'Editar',
    back: 'Volver a notas',
    notFound: 'Esa nota no existe o fue borrada.',
    deleted: 'Nota borrada. Puedes recuperarla con Deshacer.',
    /** @param {string} date */
    updated: (date) => `Último cambio: ${date}`,
    /** @param {string} processName */
    linkedTo: (processName) => `Ligada a: ${processName}`,
    linkedTitle: 'Notas de este proceso',
    linkedEmpty: 'Este proceso no tiene notas.',
    addToProcess: 'Agregar nota a este proceso',
  },
  backup: {
    title: 'Respaldo',
    intro: 'El historial (pasos, procesos terminados y notas) vive solo en este dispositivo. Descarga un respaldo de vez en cuando.',
    downloadTitle: 'Descargar el historial',
    downloadHelp: 'Guarda un archivo con todo el historial de este dispositivo.',
    download: 'Descargar respaldo',
    downloaded: 'Respaldo descargado.',
    restoreTitle: 'Restaurar un respaldo',
    restoreHelp: 'Elige un archivo de respaldo descargado antes desde esta app.',
    chooseFile: 'Elegir archivo de respaldo',
    confirmTitle: '¿Reemplazar el historial de este dispositivo?',
    /** @param {string} fileName */
    confirmBody: (fileName) =>
      `Todo el historial actual se reemplaza con el del archivo "${fileName}". Esto no se puede deshacer con el botón Deshacer. Si quieres conservar lo actual, descarga antes un respaldo.`,
    confirm: 'Sí, reemplazar',
    cancel: 'Cancelar',
    /** @param {number} count */
    restored: (count) => (count === 1 ? 'Se restauró 1 registro.' : `Se restauraron ${count} registros.`),
    errors: {
      backup_not_json: 'Ese archivo no es un respaldo: no se pudo leer. No se cambió nada.',
      backup_wrong_app: 'Ese archivo no es un respaldo de esta app. No se cambió nada.',
      backup_unknown_version: 'Ese respaldo es de una versión que esta app no conoce. No se cambió nada.',
      backup_invalid_events: 'Ese respaldo tiene datos dañados. No se cambió nada.',
      unknown: 'No se pudo restaurar el respaldo. No se cambió nada.',
    },
  },
  stopwatch: {
    title: 'Cronómetro',
    start: 'Iniciar',
    pause: 'Pausar',
    resume: 'Continuar',
    reset: 'Reiniciar',
  },
  finish: {
    open: 'Terminar proceso',
    title: 'Registrar que se terminó',
    minutesLabel: 'Minutos que tardó',
    doneByLabel: '¿Quién lo hizo?',
    confirm: 'Guardar registro',
    cancel: 'Cancelar',
    /** @param {number} minutes */
    saved: (minutes) => `Registrado: ${minutes} min.`,
  },
  wakeLock: {
    active: 'La pantalla se queda encendida mientras este proceso está abierto.',
    unsupported:
      'Este dispositivo no puede mantener la pantalla encendida. Mientras cocinas, desactiva el bloqueo automático en los ajustes.',
  },
  undo: {
    button: 'Deshacer',
    nothing: 'No hay nada que deshacer.',
    done: {
      step_checked: 'Se deshizo: paso marcado.',
      step_unchecked: 'Se deshizo: paso desmarcado.',
      process_finished: 'Se deshizo: registro de proceso terminado.',
      note_saved: 'Se deshizo: nota guardada.',
      note_deleted: 'Se deshizo: nota borrada.',
    },
  },
};
