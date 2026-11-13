// La capa de datos: el único camino por el que los componentes leen contenido y
// guardan lo que pasa. Elige un adaptador y expone sus funciones.
import { content } from './content.js';
import { createLocalAdapter } from './adapters/localAdapter.js';

/**
 * Elige el adaptador según la variable VITE_DATA_SOURCE del archivo .env.
 * Hoy solo existe "local". Un adaptador futuro (por ejemplo, una base de datos) se
 * agrega aquí y debe tener las mismas funciones, para no tocar ningún componente.
 *
 * @returns {object} El adaptador con las funciones de la capa de datos.
 */
function chooseAdapter() {
  const dataSource = import.meta.env.VITE_DATA_SOURCE;
  if (dataSource === 'local') return createLocalAdapter({ storage: window.localStorage, content });
  throw new Error(`VITE_DATA_SOURCE desconocido: "${dataSource}"`);
}

// Se "desarma" el adaptador en funciones sueltas para que un componente pueda
// escribir: import { getProcesses } from '../../data/index.js'
export const {
  getProcesses,
  getProcess,
  searchProcesses,
  getWeekPlan,
  toggleStep,
  finishProcess,
  getLastDone,
  getNotes,
  saveNote,
  deleteNote,
  undoLastEvent,
  getStopwatch,
  saveStopwatch,
  exportBackup,
  importBackup,
} = chooseAdapter();
