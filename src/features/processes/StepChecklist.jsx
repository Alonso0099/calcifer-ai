// El checklist de un proceso: cada paso con su casilla.
import { text } from '../../shared/text.js';
import './StepChecklist.css';

/**
 * Lista de pasos con casillas. No guarda nada por sí misma: avisa a la pantalla
 * con onToggle, y la pantalla le regresa los pasos ya actualizados.
 *
 * @param {object} props
 * @param {Array<{id: string, text: string, checked: boolean}>} props.steps - Los pasos del proceso.
 * @param {(stepId: string) => void} props.onToggle - Se llama al tocar un paso.
 * @returns {JSX.Element} El título con el avance y la lista, o el aviso de pasos pendientes.
 */
export default function StepChecklist({ steps, onToggle }) {
  if (steps.length === 0) {
    return (
      <section>
        <h3>{text.processDetail.steps}</h3>
        <p>{text.processDetail.stepsPending}</p>
      </section>
    );
  }
  const doneCount = steps.filter((step) => step.checked).length;
  return (
    <section>
      <h3>
        {text.processDetail.steps} <span className="checklist-progress">{text.processDetail.progress(doneCount, steps.length)}</span>
      </h3>
      <ol className="checklist">
        {steps.map((step) => (
          <li key={step.id}>
            {/* Al envolver la casilla y el texto en un <label>, tocar el texto también marca el paso. */}
            <label className={step.checked ? 'checklist-step checklist-step-done' : 'checklist-step'}>
              <input type="checkbox" checked={step.checked} onChange={() => onToggle(step.id)} />
              <span>{step.text}</span>
            </label>
          </li>
        ))}
      </ol>
    </section>
  );
}
