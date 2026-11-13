// El selector para ligar una nota a un proceso (o a ninguno).
import { CATEGORIES } from '../../shared/constants.js';
import { text } from '../../shared/text.js';

/**
 * Una lista desplegable con todos los procesos, agrupados por categoría.
 * La primera opción es "Sin proceso": ligar una nota es opcional.
 *
 * @param {object} props
 * @param {object[]} props.processes - Todos los procesos activos.
 * @param {string} props.value - El id del proceso elegido, o "" si no hay ninguno.
 * @param {(processId: string) => void} props.onChange - Se llama al elegir otra opción.
 * @returns {JSX.Element} El campo con su etiqueta.
 */
export default function ProcessSelect({ processes, value, onChange }) {
  return (
    <label className="note-form-field">
      {text.notes.processLabel}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{text.notes.noProcess}</option>
        {CATEGORIES.map((category) => (
          // optgroup pone un título no elegible sobre cada grupo de opciones.
          <optgroup key={category} label={text.categories[category]}>
            {processes
              .filter((process) => process.category === category)
              .map((process) => (
                <option key={process.id} value={process.id}>
                  {process.name}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
