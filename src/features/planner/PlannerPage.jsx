// Pantalla del menú de la semana: qué se come cada día, y se puede cambiar.
import { Link, useSearchParams } from 'react-router-dom';
import { getMealPlan, getProcesses, getWeekPlan } from '../../data/index.js';
import { addDays, getHouseDayText, getWeekDays, getWeekdayId } from '../../lib/dates.js';
import UndoButton from '../../shared/components/UndoButton.jsx';
import { DAYS_PER_WEEK } from '../../shared/constants.js';
import { text } from '../../shared/text.js';
import { useLoadedData } from '../../shared/useLoadedData.js';
import PlannerDay from './PlannerDay.jsx';
import './PlannerPage.css';

/**
 * Pide el menú, los procesos y la semana tipo (para mostrar lo habitual de cada día).
 *
 * @returns {Promise<{mealPlan: object, processesById: object, usualMealByWeekday: object}>}
 */
async function loadPlanner() {
  const [mealPlan, processes, weekPlan] = await Promise.all([getMealPlan(), getProcesses(), getWeekPlan()]);
  return {
    mealPlan,
    processesById: Object.fromEntries(processes.map((process) => [process.id, process])),
    usualMealByWeekday: Object.fromEntries(weekPlan.days.map((day) => [day.id, day.meal])),
  };
}

/**
 * El menú semanal. La semana que se ve vive en la dirección (/menu?semana=2026-11-15)
 * para que, al volver de elegir una comida, siga en la misma semana.
 *
 * @returns {JSX.Element} Los 7 días con sus comidas y los botones para cambiar de semana.
 */
export default function PlannerPage() {
  const [searchParams] = useSearchParams();
  const { data, isLoading, hasError, reload } = useLoadedData(loadPlanner, []);
  const today = getHouseDayText(new Date());
  // Si la dirección no trae una fecha válida, se muestra la semana de hoy.
  const requested = searchParams.get('semana');
  const weekDays = getWeekDays(/^\d{4}-\d{2}-\d{2}$/.test(requested ?? '') ? requested : today);

  if (isLoading) return <p>{text.common.loading}</p>;
  if (hasError) return <p>{text.common.loadError}</p>;
  return (
    <>
      <h2 className="planner-title">{text.planner.title}</h2>
      <p className="planner-intro">{text.planner.intro}</p>
      <nav className="planner-weeks">
        <Link className="button" to={`/menu?semana=${addDays(weekDays[0], -DAYS_PER_WEEK)}`}>
          {text.planner.previous}
        </Link>
        <Link className="button" to="/menu">
          {text.planner.thisWeek}
        </Link>
        <Link className="button" to={`/menu?semana=${addDays(weekDays[0], DAYS_PER_WEEK)}`}>
          {text.planner.next}
        </Link>
      </nav>
      <div className="planner-days">
        {weekDays.map((day) => (
          <PlannerDay
            key={day}
            day={day}
            isToday={day === today}
            meals={data.mealPlan[day] ?? {}}
            usualMeal={data.usualMealByWeekday[getWeekdayId(day)]}
            processesById={data.processesById}
          />
        ))}
      </div>
      <UndoButton onUndone={reload} />
      <p>
        <Link className="planner-typical" to="/semana">
          {text.planner.typicalWeek}
        </Link>
      </p>
    </>
  );
}
