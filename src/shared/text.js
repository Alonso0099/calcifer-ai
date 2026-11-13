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
  categories: {
    compra: 'Compra',
    guardar: 'Guardar',
    preparar: 'Preparar',
    limpieza: 'Limpieza',
    mantenimiento: 'Mantenimiento',
    seguridad: 'Seguridad',
  },
  groups: {
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
    doneByLabel: '¿Quién lo hizo? (opcional)',
    doneByNone: 'Prefiero no anotar',
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
