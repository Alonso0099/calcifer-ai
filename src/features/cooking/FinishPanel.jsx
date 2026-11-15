// La última pantalla del modo de cocina: confirmar que todo quedó bien y registrar que se terminó.
import { useState } from 'react';
import FinishForm from '../../shared/components/FinishForm.jsx';
import { COOKED_FOOD_GROUPS, LEFTOVER_GROUPS } from '../../shared/constants.js';
import { getMinutesFromElapsed } from '../../lib/time.js';
import { text } from '../../shared/text.js';
import './FinishPanel.css';

/**
 * Pide confirmaciones antes de registrar. La app nunca da por cocinada una comida ni por guardadas
 * las sobras: lo confirma la persona, y la temperatura la mide ella. Las confirmaciones que
 * aplican dependen de la receta (una limpieza no pregunta por la comida).
 *
 * @param {object} props
 * @param {{group?: string}} props.process - La receta o tarea.
 * @param {boolean} props.packsLunchToday - Si hoy se empacan los almuerzos de mañana (viernes y sábado no).
 * @param {number} props.elapsedMs - Lo que marcó el cronómetro.
 * @param {(minutes: number, doneBy: string) => void} props.onConfirm - Se llama al registrar.
 * @param {() => void} props.onBack - Regresa a los pasos.
 * @returns {JSX.Element} Las confirmaciones y, cuando están todas, el formulario de registro.
 */
export default function FinishPanel({ process, packsLunchToday, elapsedMs, onConfirm, onBack }) {
  const confirmations = [];
  if (COOKED_FOOD_GROUPS.includes(process.group)) confirmations.push({ id: 'cooked', label: text.cooking.confirmCooked });
  if (LEFTOVER_GROUPS.includes(process.group)) {
    confirmations.push({ id: 'stored', label: text.cooking.confirmStored });
    if (packsLunchToday) confirmations.push({ id: 'packed', label: text.cooking.confirmPacked });
  }
  const [confirmed, setConfirmed] = useState(new Set());
  const allConfirmed = confirmations.every((confirmation) => confirmed.has(confirmation.id));

  /** Marca o desmarca una confirmación. */
  function toggle(id) {
    const next = new Set(confirmed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setConfirmed(next);
  }

  return (
    <section className="card finish-panel">
      <h3>{text.cooking.finishTitle}</h3>
      {confirmations.length > 0 && <p className="finish-panel-help">{text.cooking.confirmHelp}</p>}
      <ul className="finish-panel-list">
        {confirmations.map((confirmation) => (
          <li key={confirmation.id}>
            <label className="finish-panel-item">
              <input type="checkbox" checked={confirmed.has(confirmation.id)} onChange={() => toggle(confirmation.id)} />
              <span>{confirmation.label}</span>
            </label>
          </li>
        ))}
      </ul>
      {allConfirmed ? (
        <FinishForm initialMinutes={getMinutesFromElapsed(elapsedMs)} onConfirm={onConfirm} onCancel={onBack} />
      ) : (
        <button type="button" className="button" onClick={onBack}>
          {text.cooking.backToSteps}
        </button>
      )}
    </section>
  );
}
