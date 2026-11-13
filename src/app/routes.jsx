// La lista de pantallas de la app: una línea por funcionalidad.
// Para agregar una pantalla se agrega una línea aquí; para quitarla, se borra.
import HomePage from './HomePage.jsx';

/**
 * Cada ruta une una dirección (path) con el componente que se dibuja ahí (element).
 * Por ahora solo existe la pantalla de inicio; cada funcionalidad agregará la suya.
 */
export const routes = [{ path: '/', element: <HomePage /> }];
