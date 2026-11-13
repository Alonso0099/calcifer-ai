// La tarjeta de un proceso en la lista: nombre, categoría, tiempo y número de pasos.
import { Link } from 'react-router-dom';
import { text } from '../../shared/text.js';
import CategoryDot from './CategoryDot.jsx';
import ProcessTime from './ProcessTime.jsx';
import './ProcessCard.css';

/**
 * Una tarjeta que, al tocarla, abre el detalle del proceso.
 *
 * @param {object} props
 * @param {object} props.process - El proceso a mostrar.
 * @returns {JSX.Element} La tarjeta completa como un enlace.
 */
export default function ProcessCard({ process }) {
  const stepCount = process.steps.length;
  return (
    // Link es el <a> de React Router: cambia de pantalla sin recargar la página.
    <Link className="process-card" to={`/procesos/${process.id}`}>
      <span className="process-card-category">
        <CategoryDot category={process.category} />
        {text.categories[process.category]}
      </span>
      <span className="process-card-name">{process.name}</span>
      <span className="process-card-details">
        <ProcessTime process={process} />
        {' · '}
        {stepCount > 0 ? text.processList.stepCount(stepCount) : text.processList.noSteps}
      </span>
    </Link>
  );
}
