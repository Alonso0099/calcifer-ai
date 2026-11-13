// La tarjeta de un día de la semana tipo: su comida y sus bloques de trabajo.
import { Link } from 'react-router-dom';
import { text } from '../../shared/text.js';
import './DayCard.css';

/**
 * Muestra un día: nombre, comida del sistema y cada bloque con su tiempo estimado.
 * No muestra nombres de personas: en esta cocina nadie tiene tareas asignadas.
 *
 * @param {object} props
 * @param {{name: string, meal: string|null, blocks: object[]}} props.day - El día, como lo regresa getWeekPlan.
 * @returns {JSX.Element} La tarjeta del día.
 */
export default function DayCard({ day }) {
  return (
    <section className="day-card">
      <h3>{day.name}</h3>
      {day.meal && <p className="day-card-meal">{day.meal}</p>}
      {day.blocks.length === 0 ? (
        <p className="day-card-rest">{text.week.rest}</p>
      ) : (
        <ul className="day-card-blocks">
          {day.blocks.map((block) => (
            <li key={block.processId}>
              {/* Cada bloque lleva al checklist de su proceso. */}
              <Link className="day-card-block" to={`/procesos/${block.processId}`}>
                <span className="day-card-block-name">{block.processName}</span>
                <span className="day-card-block-time">
                  {block.estimatedMinutes
                    ? text.time.estimated(block.estimatedMinutes.min, block.estimatedMinutes.max)
                    : text.common.pending}
                  {block.everyWeeks ? ` · ${text.week.everyWeeks(block.everyWeeks)}` : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
