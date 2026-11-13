// La barra de vencimiento de una tarea, con su texto de estado.
import { getDueLabel } from './dueLabel.js';
import './DueBar.css';

/**
 * Dibuja la barra: se va llenando conforme pasa el plazo y cambia de color según el estado.
 *
 * @param {object} props
 * @param {{status: string, daysUntilDue: number|null, progress: number}} props.task - Una tarea de buildZoneBoards.
 * @returns {JSX.Element} El texto del estado y la barra.
 */
export default function DueBar({ task }) {
  const filledPercent = Math.round(task.progress * 100);
  return (
    <div className={`due-bar due-bar-${task.status}`}>
      <span className="due-bar-label">{getDueLabel(task)}</span>
      {/* La barra es decorativa (aria-hidden): el texto de arriba ya dice lo mismo con palabras.
          El ancho del relleno se pone con "style" porque es un número calculado, no un color. */}
      <span className="due-bar-track" aria-hidden="true">
        <span className="due-bar-fill" style={{ width: `${filledPercent}%` }} />
      </span>
    </div>
  );
}
