// La tarjeta "Qué se come hoy" de la pantalla de inicio.
import { Link } from 'react-router-dom';
import { MEAL_KINDS, MEAL_SLOTS } from '../../shared/constants.js';
import { getMealName } from '../../shared/mealName.js';
import { text } from '../../shared/text.js';
import './TodayMeals.css';

/**
 * Muestra desayuno, almuerzo y cena de hoy. Si la cena es una receta, ofrece el botón
 * grande "Empezar a cocinar", que abre su checklist.
 *
 * @param {object} props
 * @param {Record<string, {kind: string, processId: string|null}>} props.meals - Lo planeado hoy, por momento.
 * @param {string|null} props.usualMeal - Lo habitual ese día según la semana tipo.
 * @param {Record<string, object>} props.processesById - Los procesos, por id.
 * @returns {JSX.Element} La tarjeta de comidas.
 */
export default function TodayMeals({ meals, usualMeal, processesById }) {
  // La comida que se cocina: la última receta del día (normalmente la cena).
  const recipeSlot = [...MEAL_SLOTS].reverse().find((slot) => meals[slot]?.kind === MEAL_KINDS.recipe);
  return (
    <section className="today-card">
      <h3>{text.today.mealsTitle}</h3>
      <dl className="today-meals">
        {MEAL_SLOTS.map((slot) => (
          <div key={slot} className="today-meal">
            <dt>{text.slots[slot]}</dt>
            <dd>{getMealName(meals[slot], processesById) ?? text.today.notPlanned}</dd>
          </div>
        ))}
      </dl>
      {usualMeal && <p className="today-usual">{text.today.usual(usualMeal)}</p>}
      <div className="today-actions">
        {recipeSlot && (
          <Link className="button button-primary today-start" to={`/procesos/${meals[recipeSlot].processId}`}>
            {text.today.startCooking}
          </Link>
        )}
        <Link className="button today-plan" to="/menu">
          {text.today.planMenu}
        </Link>
      </div>
      {recipeSlot === 'dinner' && <p className="today-reminder">{text.today.packLunch}</p>}
    </section>
  );
}
