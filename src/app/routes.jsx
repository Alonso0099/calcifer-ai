// La lista de pantallas de la app: una línea por pantalla.
// Para agregar una funcionalidad se agregan sus líneas aquí; para quitarla, se borran.
import NoteEditorPage from '../features/notes/NoteEditorPage.jsx';
import NotesListPage from '../features/notes/NotesListPage.jsx';
import ProcessListPage from '../features/processes/ProcessListPage.jsx';
import ProcessDetailPage from '../features/processes/ProcessDetailPage.jsx';
import WeekPage from '../features/week/WeekPage.jsx';
import BackupPage from '../features/backup/BackupPage.jsx';
import MaintenancePage from '../features/maintenance/MaintenancePage.jsx';
import SearchPage from '../features/search/SearchPage.jsx';
import { text } from '../shared/text.js';

/**
 * Cada ruta une una dirección (path) con el componente que se dibuja ahí (element).
 * Las rutas con "menuLabel" aparecen en el menú, en este orden.
 * ":processId" es una parte variable: /procesos/pozole-rojo abre el proceso "pozole-rojo".
 */
export const routes = [
  { path: '/', element: <ProcessListPage />, menuLabel: text.menu.processes },
  { path: '/procesos/:processId', element: <ProcessDetailPage /> },
  { path: '/semana', element: <WeekPage />, menuLabel: text.menu.week },
  { path: '/limpieza', element: <MaintenancePage />, menuLabel: text.menu.maintenance },
  { path: '/notas', element: <NotesListPage />, menuLabel: text.menu.notes },
  { path: '/notas/nueva', element: <NoteEditorPage /> },
  { path: '/notas/:noteId', element: <NoteEditorPage /> },
  { path: '/buscar', element: <SearchPage />, menuLabel: text.menu.search },
  { path: '/respaldo', element: <BackupPage />, menuLabel: text.menu.backup },
];
