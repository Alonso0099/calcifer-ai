// Pantalla de inicio: qué toca hoy en la cocina, sin tener que buscarlo.
import { Link } from 'react-router-dom';
import { formatDayLong } from '../../lib/dates.js';
import { THAW_PROCESS_ID } from '../../shared/constants.js';
import { text } from '../../shared/text.js';
import { useLoadedData } from '../../shared/useLoadedData.js';
import { loadToday } from './loadToday.js';
import TodayMeals from './TodayMeals.jsx';
import TodayTasks from './TodayTasks.jsx';
import './TodayPage.css';

/**
 * "Hoy": la comida planeada, las tareas del día y qué descongelar para mañana.
 * La app recuerda; quien cocina solo abre cada tarea y la confirma al terminarla.
 *
 * @returns {JSX.Element} El tablero del día.
 */
export default function TodayPage() {
  const { data, isLoading, hasError } = useLoadedData(loadToday, []);

  if (isLoading) return <p>{text.common.loading}</p>;
  if (hasError) return <p>{text.common.loadError}</p>;
  return (
    <>
      <h2 className="today-title">{text.today.title(formatDayLong(data.today))}</h2>
      <div className="today-grid">
        <TodayMeals meals={data.todayMeals} usualMeal={data.usualMeal} processesById={data.processesById} />
        <TodayTasks tasks={data.tasks} />
        {data.recipesToThaw.length > 0 && (
          <section className="today-card">
            <h3>{text.today.thawTitle}</h3>
            {data.recipesToThaw.map((recipe) => (
              <p key={recipe.id}>{text.today.thaw(recipe.name)}</p>
            ))}
            <Link className="today-thaw-link" to={`/procesos/${THAW_PROCESS_ID}`}>
              {text.today.thawLink}
            </Link>
          </section>
        )}
      </div>
    </>
  );
}
