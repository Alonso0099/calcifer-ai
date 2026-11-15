// Un paso de la receta, en grande, con los botones para avanzar con una mano.
import { text } from '../../shared/text.js';
import './CookingStep.css';

/**
 * Muestra un solo paso con letra grande. "Listo, siguiente" marca el paso como hecho y avanza;
 * "Saltar" avanza sin marcarlo; "Anterior" regresa. Todo se hace con botones grandes porque
 * se usa con las manos ocupadas.
 *
 * @param {object} props
 * @param {{text: string, checked: boolean}} props.step - El paso.
 * @param {number} props.index - Su posición (empieza en 0).
 * @param {number} props.total - Cuántos pasos tiene la receta.
 * @param {() => void} props.onDone - Marca el paso y avanza.
 * @param {() => void} props.onSkip - Avanza sin marcar.
 * @param {() => void} props.onPrevious - Regresa.
 * @returns {JSX.Element} La pantalla del paso.
 */
export default function CookingStep({ step, index, total, onDone, onSkip, onPrevious }) {
  const isLast = index === total - 1;
  return (
    <section className="card cooking-step">
      <p className="cooking-step-count">
        {text.cooking.stepCount(index + 1, total)}
        {step.checked && <span className="cooking-step-done"> · {text.cooking.stepDone}</span>}
      </p>
      <p className="cooking-step-text">{step.text}</p>
      <div className="cooking-step-buttons">
        <button type="button" className="button button-primary cooking-step-next" onClick={onDone}>
          {isLast ? text.cooking.lastStepDone : text.cooking.stepNext}
        </button>
        <button type="button" className="button" onClick={onPrevious}>
          {text.cooking.previous}
        </button>
        <button type="button" className="button" onClick={onSkip}>
          {text.cooking.skip}
        </button>
      </div>
    </section>
  );
}
