// Pantalla para elegir qué se come en un momento del día: una receta o una opción sin receta.
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getMealPlan, getProcesses, planMeal } from '../../data/index.js';
import { formatDayLong } from '../../lib/dates.js';
import { processMatchesSearch } from '../../lib/searchText.js';
import { MEAL_KINDS, MEAL_SLOTS, MENU_GROUPS } from '../../shared/constants.js';
import { text } from '../../shared/text.js';
import { useLoadedData } from '../../shared/useLoadedData.js';
import './MealPickerPage.css';

const QUICK_KINDS = [MEAL_KINDS.leftovers, MEAL_KINDS.eatOut, MEAL_KINDS.quick];

/**
 * El selector de comidas. El día y el momento llegan en la dirección
 * (/menu/elegir?dia=2026-11-16&momento=dinner). Al elegir, guarda y regresa al menú.
 *
 * @returns {JSX.Element} Las opciones sin receta y las recetas, con un buscador.
 */
export default function MealPickerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const day = searchParams.get('dia') ?? '';
  const slot = searchParams.get('momento') ?? '';
  const isValid = /^\d{4}-\d{2}-\d{2}$/.test(day) && MEAL_SLOTS.includes(slot);
  const menuUrl = isValid ? `/menu?semana=${day}` : '/menu';

  const { data, isLoading, hasError } = useLoadedData(async () => {
    const [processes, mealPlan] = await Promise.all([getProcesses(), getMealPlan()]);
    return { recipes: processes.filter((process) => MENU_GROUPS.includes(process.group)), current: mealPlan[day]?.[slot] ?? null };
  }, [day, slot]);

  /** Guarda la elección y regresa al menú, en la semana de ese día. */
  async function choose(meal) {
    await planMeal(day, slot, meal);
    navigate(menuUrl);
  }

  const backLink = (
    <Link className="meal-picker-back" to={menuUrl}>
      ← {text.planner.pickBack}
    </Link>
  );
  if (!isValid) return backLink;
  if (isLoading) return <p>{text.common.loading}</p>;
  if (hasError) return <p>{text.common.loadError}</p>;

  // Para el desayuno van primero los desayunos; para lo demás, se dejan al final.
  const groupOrder = slot === 'breakfast' ? ['desayunos', ...MENU_GROUPS.filter((group) => group !== 'desayunos')] : MENU_GROUPS;
  const visibleRecipes = query.trim() === '' ? data.recipes : data.recipes.filter((recipe) => processMatchesSearch(recipe, query));
  return (
    <>
      {backLink}
      <h2 className="meal-picker-title">{text.planner.pickTitle(text.slots[slot], formatDayLong(day))}</h2>
      <h3>{text.planner.quickOptions}</h3>
      <div className="meal-picker-options">
        {QUICK_KINDS.map((kind) => (
          <button key={kind} type="button" className="button" onClick={() => choose({ kind })}>
            {text.mealKinds[kind]}
          </button>
        ))}
        {data.current && (
          <button type="button" className="button meal-picker-remove" onClick={() => choose({ kind: MEAL_KINDS.none })}>
            {text.planner.remove}
          </button>
        )}
      </div>
      <h3>{text.planner.recipes}</h3>
      <label className="meal-picker-search">
        {text.planner.searchLabel}
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      {visibleRecipes.length === 0 && <p>{text.planner.noRecipes}</p>}
      {groupOrder.map((group) => {
        const recipes = visibleRecipes.filter((recipe) => recipe.group === group);
        if (recipes.length === 0) return null;
        return (
          <section key={group}>
            <h4 className="meal-picker-group">{text.groups[group]}</h4>
            <div className="meal-picker-options">
              {recipes.map((recipe) => (
                <button
                  key={recipe.id}
                  type="button"
                  className={data.current?.processId === recipe.id ? 'button meal-picker-current' : 'button'}
                  onClick={() => choose({ kind: MEAL_KINDS.recipe, processId: recipe.id })}
                >
                  {recipe.name}
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
