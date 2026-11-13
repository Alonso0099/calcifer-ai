// La lista de pantallas de la app: una línea por funcionalidad.
// Para agregar una pantalla se agrega una línea aquí; para quitarla, se borra.
import ProcessListPage from '../features/processes/ProcessListPage.jsx';
import ProcessDetailPage from '../features/processes/ProcessDetailPage.jsx';

/**
 * Cada ruta une una dirección (path) con el componente que se dibuja ahí (element).
 * ":processId" es una parte variable: /procesos/pozole-rojo abre el proceso "pozole-rojo".
 */
export const routes = [
  { path: '/', element: <ProcessListPage /> },
  { path: '/procesos/:processId', element: <ProcessDetailPage /> },
];
