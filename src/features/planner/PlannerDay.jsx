// La tarjeta de un día en el menú de la semana: sus tres momentos de comida.
import { Link } from 'react-router-dom';
import { formatDayLong } from '../../lib/dates.js';
import { MEAL_SLOTS } from '../../shared/constants.js';
import { getMealName } from '../../shared/mealName.js';
import { text } from '../../shared/text.js';
import './PlannerDay.css';

/**
 * Muestra un día del menú. Cada momento es un botón grande que abre el selector de comidas.
 *
 * @param {object} props
 * @param {string} props.day - El día, en formato año-mes-día.
 * @param {boolean} props.isToday - Si es el día de hoy (se resalta).
 * @param {Record<string, {kind: string, processId: string|null}>} props.meals - Lo planeado ese día.
 * @param {string|null} props.usualMeal - Lo habitual ese día según la semana tipo.
 * @param {Record<string, object>} props.processesById - Los procesos, por id.
 * @returns {JSX.Element} La tarjeta del día.
 */
export default function PlannerDay({ day, isToday, meals, usualMeal, processesById }) {
  return (
    <section className={isToday ? 'card planner-day planner-day-today' : 'card planner-day'}>
      <h3>
        {formatDayLong(day)}
        {isToday && <span className="planner-day-badge">{text.planner.today}</span>}
      </h3>
      {usualMeal && <p className="planner-day-usual">{text.today.usual(usualMeal)}</p>}
      <ul className="planner-slots">
        {MEAL_SLOTS.map((slot) => {
          const mealName = getMealName(meals[slot], processesById);
          return (
            <li key={slot}>
              <Link className={mealName ? 'tile planner-slot' : 'tile planner-slot planner-slot-empty'} to={`/menu/elegir?dia=${day}&momento=${slot}`}>
                <span className="planner-slot-label">{text.slots[slot]}</span>
                <span className="planner-slot-meal">{mealName ?? text.planner.empty}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
