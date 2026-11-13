// Pantalla de inicio provisional. Solo confirma que el proyecto base funciona;
// se reemplaza por la lista de procesos cuando se construya esa funcionalidad.
import { text } from '../shared/text.js';

/**
 * Muestra un mensaje de bienvenida mientras no existen las demás pantallas.
 *
 * @returns {JSX.Element} Un párrafo con el mensaje.
 */
export default function HomePage() {
  return <p>{text.home.underConstruction}</p>;
}
