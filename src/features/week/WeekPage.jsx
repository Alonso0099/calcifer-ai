// Pantalla de la semana tipo: los 7 días con lo que se hace y cuánto tiempo estimado toma.
import { getWeekPlan } from '../../data/index.js';
import { text } from '../../shared/text.js';
import { useLoadedData } from '../../shared/useLoadedData.js';
import DayCard from './DayCard.jsx';
import './WeekPage.css';

/**
 * La vista semanal. Solo lee la semana tipo del contenido: no guarda nada.
 *
 * @returns {JSX.Element} Una tarjeta por día.
 */
export default function WeekPage() {
  const { data: week, isLoading, hasError } = useLoadedData(getWeekPlan, []);

  if (isLoading) return <p>{text.common.loading}</p>;
  if (hasError) return <p>{text.common.loadError}</p>;
  return (
    <>
      <h2 className="week-title">{text.week.title}</h2>
      <p className="week-intro">{text.week.intro}</p>
      <div className="week-days">
        {week.days.map((day) => (
          <DayCard key={day.id} day={day} />
        ))}
      </div>
    </>
  );
}
