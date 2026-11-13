// Aviso que se muestra cuando la app se abrió en el navegador y no como app instalada.
import { Link } from 'react-router-dom';
import { text } from '../shared/text.js';
import './InstallNotice.css';

/**
 * Dice si la app se abrió desde su ícono en la pantalla de inicio.
 * Hay dos formas de saberlo porque los navegadores no se ponen de acuerdo:
 * "display-mode: standalone" (el estándar) y navigator.standalone (solo Safari).
 *
 * @returns {boolean} true si se abrió como app instalada.
 */
function isInstalledApp() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

/**
 * Avisa que el historial corre riesgo mientras la app no esté instalada: Safari puede
 * borrar los datos de un sitio no instalado. Instalada, no dibuja nada.
 *
 * @returns {JSX.Element|null} El aviso, o null si la app ya está instalada.
 */
export default function InstallNotice() {
  if (isInstalledApp()) return null;
  return (
    // <aside> marca contenido aparte del principal; role="note" lo anuncia como una nota.
    <aside className="install-notice" role="note">
      <p>{text.install.notice}</p>
      <p>{text.install.howTo}</p>
      <Link className="install-notice-link" to="/respaldo">
        {text.install.backupLink}
      </Link>
    </aside>
  );
}
