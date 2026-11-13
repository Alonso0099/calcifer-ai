// El encabezado del detalle de un proceso: categoría, nombre, tiempo, frecuencia y última vez.
import { formatHouseDate } from '../../lib/dates.js';
import { text } from '../../shared/text.js';
import CategoryDot from './CategoryDot.jsx';
import ProcessTime from './ProcessTime.jsx';
import './ProcessSummary.css';

/**
 * Muestra los datos generales de un proceso.
 *
 * @param {object} props
 * @param {object} props.process - El proceso.
 * @param {string|null} props.lastDoneIso - Fecha ISO de la última vez que se terminó, o null.
 * @returns {JSX.Element} El encabezado del proceso.
 */
export default function ProcessSummary({ process, lastDoneIso }) {
  return (
    <header className="process-summary">
      <p className="process-summary-category">
        <CategoryDot category={process.category} />
        {text.categories[process.category]}
        {process.group ? ` · ${text.groups[process.group]}` : ''}
      </p>
      <h2>{process.name}</h2>
      {/* dl/dt/dd es la lista de HTML para pares "dato: valor". */}
      <dl className="process-summary-facts">
        <dt>{text.time.label}</dt>
        <dd>
          <ProcessTime process={process} />
        </dd>
        {process.frequencyLabel && (
          <>
            <dt>{text.processDetail.frequency}</dt>
            <dd>{process.frequencyLabel}</dd>
          </>
        )}
      </dl>
      <p className="process-summary-last-done">
        {lastDoneIso ? text.processDetail.lastDone(formatHouseDate(lastDoneIso)) : text.processDetail.neverDone}
      </p>
    </header>
  );
}
