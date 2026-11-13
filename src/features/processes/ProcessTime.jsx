// Muestra el tiempo de un proceso: medido, estimado o "Pendiente".
import { getProcessTime } from '../../lib/time.js';
import { text } from '../../shared/text.js';

/**
 * Escribe el tiempo de un proceso con las palabras correctas según de dónde sale.
 *
 * @param {object} props
 * @param {object} props.process - El proceso (necesita steps y estimatedMinutes).
 * @returns {JSX.Element} Un texto como "45–60 min", "38 min (medido)" o "Pendiente".
 */
export default function ProcessTime({ process }) {
  const time = getProcessTime(process);
  if (time.kind === 'measured') return <span>{text.time.measured(time.minutes)}</span>;
  if (time.kind === 'estimated') return <span>{text.time.estimated(time.min, time.max)}</span>;
  return <span>{text.common.pending}</span>;
}
