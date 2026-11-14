// La tarjeta "Tareas de hoy": lo que toca, con su avance.
import { Link } from 'react-router-dom';
import { text } from '../../shared/text.js';
import './TodayTasks.css';

/**
 * Lista las tareas del día. Cada una abre su checklist; se marca como hecha sola
 * cuando ese proceso se termina (aquí no se marca nada a mano).
 *
 * @param {object} props
 * @param {Array<{processId: string, name: string, reason: string, isDone: boolean}>} props.tasks - De buildTodayTasks.
 * @returns {JSX.Element} La tarjeta de tareas.
 */
export default function TodayTasks({ tasks }) {
  const doneCount = tasks.filter((task) => task.isDone).length;
  return (
    <section className="card today-card">
      <h3>{text.today.tasksTitle}</h3>
      {tasks.length === 0 ? (
        <p>{text.today.noTasks}</p>
      ) : (
        <>
          <p className="today-progress">{text.today.progress(doneCount, tasks.length)}</p>
          {/* La barra es decorativa: el texto de arriba ya dice el avance. */}
          <span className="today-progress-track" aria-hidden="true">
            <span className="today-progress-fill" style={{ width: `${Math.round((doneCount / tasks.length) * 100)}%` }} />
          </span>
          <ul className="today-tasks">
            {tasks.map((task) => (
              <li key={task.processId}>
                <Link className={task.isDone ? 'tile today-task today-task-done' : 'tile today-task'} to={`/procesos/${task.processId}`}>
                  <span className="today-task-name">{task.name}</span>
                  <span className="today-task-details">
                    {text.today.reasons[task.reason]} · <strong>{task.isDone ? text.today.done : text.today.pending}</strong>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
