// La tarjeta de una zona: su punto de estado y sus tareas con barra de vencimiento.
import { Link } from 'react-router-dom';
import { formatHouseDate } from '../../lib/dates.js';
import { text } from '../../shared/text.js';
import DueBar from './DueBar.jsx';
import { getDueLabel } from './dueLabel.js';
import './ZoneCard.css';

/**
 * Muestra una zona de la cocina. El punto de color refleja su tarea más atrasada,
 * y junto a él va el mismo estado escrito con palabras.
 *
 * @param {object} props
 * @param {{zone: object, tasks: object[], worstTask: object}} props.board - Una zona de buildZoneBoards.
 * @returns {JSX.Element} La tarjeta de la zona.
 */
export default function ZoneCard({ board }) {
  return (
    <section className="zone-card">
      <header className="zone-card-header">
        <h3>{board.zone.name}</h3>
        <p className="zone-card-status">
          <span className={`zone-card-dot zone-card-dot-${board.worstTask.status}`} aria-hidden="true" />
          {getDueLabel(board.worstTask)}
        </p>
      </header>
      <ul className="zone-card-tasks">
        {board.tasks.map((task) => (
          <li key={task.process.id} className="zone-card-task">
            {/* El nombre abre el proceso: ahí se sigue el checklist y se registra que se terminó. */}
            <Link className="zone-card-task-name" to={`/procesos/${task.process.id}`}>
              {task.process.name}
            </Link>
            <p className="zone-card-task-details">
              {task.process.frequencyLabel}
              {task.lastDoneIso ? ` · ${text.maintenance.lastDone(formatHouseDate(task.lastDoneIso))}` : ''}
            </p>
            <DueBar task={task} />
          </li>
        ))}
      </ul>
    </section>
  );
}
