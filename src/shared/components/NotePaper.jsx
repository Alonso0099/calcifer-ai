// La hoja de papel de las notas: el fondo, el borde y la ramita en la esquina.
// Es compartida: la usan la pantalla de notas y el detalle de un proceso.
import HerbSprig from './HerbSprig.jsx';
import './NotePaper.css';

/**
 * Envuelve su contenido en una hoja de papel. "children" es una prop especial de
 * React: es lo que se escribe entre la etiqueta de apertura y la de cierre.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - El contenido de la hoja (título, texto, campos...).
 * @returns {JSX.Element} La hoja con su adorno.
 */
export default function NotePaper({ children }) {
  return (
    <div className="note-paper">
      <span className="note-paper-sprig">
        <HerbSprig />
      </span>
      {children}
    </div>
  );
}
