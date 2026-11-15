// La lista de pantallas de la app: una línea por pantalla.
// Para agregar una funcionalidad se agregan sus líneas aquí; para quitarla, se borran.
import BackupPage from '../features/backup/BackupPage.jsx';
import CookingPage from '../features/cooking/CookingPage.jsx';
import FreezerPage from '../features/freezer/FreezerPage.jsx';
import MaintenancePage from '../features/maintenance/MaintenancePage.jsx';
import NoteEditorPage from '../features/notes/NoteEditorPage.jsx';
import NotesListPage from '../features/notes/NotesListPage.jsx';
import MealPickerPage from '../features/planner/MealPickerPage.jsx';
import PlannerPage from '../features/planner/PlannerPage.jsx';
import ProcessListPage from '../features/processes/ProcessListPage.jsx';
import ProcessDetailPage from '../features/processes/ProcessDetailPage.jsx';
import ShoppingPage from '../features/shopping/ShoppingPage.jsx';
import SearchPage from '../features/search/SearchPage.jsx';
import TodayPage from '../features/today/TodayPage.jsx';
import WeekPage from '../features/week/WeekPage.jsx';
import { text } from '../shared/text.js';

/**
 * Cada ruta une una dirección (path) con el componente que se dibuja ahí (element).
 * Las rutas con "menuLabel" aparecen en el menú, en este orden; las que dicen menuGroup: 'more'
 * van dentro de "Más".
 * ":processId" es una parte variable: /procesos/pozole-rojo abre el proceso "pozole-rojo".
 */
export const routes = [
  { path: '/', element: <TodayPage />, menuLabel: text.menu.today },
  { path: '/menu', element: <PlannerPage />, menuLabel: text.menu.planner },
  { path: '/menu/elegir', element: <MealPickerPage /> },
  { path: '/procesos', element: <ProcessListPage />, menuLabel: text.menu.processes },
  { path: '/procesos/:processId', element: <ProcessDetailPage /> },
  { path: '/cocinar/:processId', element: <CookingPage /> },
  { path: '/congelador', element: <FreezerPage />, menuLabel: text.menu.freezer },
  { path: '/compras', element: <ShoppingPage />, menuLabel: text.menu.shopping },
  { path: '/limpieza', element: <MaintenancePage />, menuLabel: text.menu.maintenance, menuGroup: 'more' },
  { path: '/notas', element: <NotesListPage />, menuLabel: text.menu.notes, menuGroup: 'more' },
  { path: '/notas/nueva', element: <NoteEditorPage /> },
  { path: '/notas/:noteId', element: <NoteEditorPage /> },
  { path: '/buscar', element: <SearchPage />, menuLabel: text.menu.search, menuGroup: 'more' },
  { path: '/respaldo', element: <BackupPage />, menuLabel: text.menu.backup, menuGroup: 'more' },
  // La semana tipo del manual ya no va en el menú: se abre desde la pantalla del menú semanal.
  { path: '/semana', element: <WeekPage /> },
];
