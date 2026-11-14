// Formulario para registrar bolsas nuevas en el congelador (por ejemplo, al terminar la preparación mensual).
import { useState } from 'react';
import { text } from '../../shared/text.js';
import './AddBagsForm.css';

/**
 * Pide lo mínimo para registrar bolsas iguales de una sola vez: el corte, si van marinadas,
 * cuántas bolsas son y su día de preparación. Así, 6 bolsas de filetes son un solo registro.
 *
 * @param {object} props
 * @param {object[]} props.proteins - Las proteínas del catálogo, con sus cortes.
 * @param {string} props.today - El día de hoy (año-mes-día); viene puesto como día de preparación.
 * @param {(bags: {cutId: string, marinated: boolean, units: number, prepDay: string, count: number}) => void} props.onAdd
 *   Se llama al guardar.
 * @returns {JSX.Element} El formulario.
 */
export default function AddBagsForm({ proteins, today, onAdd }) {
  const [cutId, setCutId] = useState(proteins[0].cuts[0].id);
  const [marinated, setMarinated] = useState(false);
  const [count, setCount] = useState('1');
  const [units, setUnits] = useState('1');
  const [prepDay, setPrepDay] = useState(today);

  /** Manda los datos a la pantalla y deja el contador en 1 para el siguiente registro. */
  function handleSubmit(event) {
    event.preventDefault();
    onAdd({ cutId, marinated, units: Number(units), prepDay, count: Number(count) });
    setCount('1');
  }

  return (
    <form className="card add-bags" onSubmit={handleSubmit}>
      <h3>{text.freezer.addTitle}</h3>
      <label className="add-bags-field">
        {text.freezer.cutLabel}
        <select className="field" value={cutId} onChange={(event) => setCutId(event.target.value)}>
          {proteins.map((protein) => (
            <optgroup key={protein.id} label={protein.name}>
              {protein.cuts.map((cut) => (
                <option key={cut.id} value={cut.id}>
                  {cut.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <label className="add-bags-check">
        <input type="checkbox" checked={marinated} onChange={(event) => setMarinated(event.target.checked)} />
        {text.freezer.marinatedLabel}
      </label>
      <div className="add-bags-row">
        <label className="add-bags-field">
          {text.freezer.countLabel}
          <input className="field" type="number" inputMode="numeric" min="1" step="1" required value={count} onChange={(event) => setCount(event.target.value)} />
        </label>
        <label className="add-bags-field">
          {text.freezer.unitsLabel}
          <input className="field" type="number" inputMode="decimal" min="0.5" step="0.5" required value={units} onChange={(event) => setUnits(event.target.value)} />
        </label>
        <label className="add-bags-field">
          {text.freezer.prepDayLabel}
          <input className="field" type="date" required max={today} value={prepDay} onChange={(event) => setPrepDay(event.target.value)} />
        </label>
      </div>
      <p className="add-bags-help">{text.freezer.unitsHelp}</p>
      <button type="submit" className="button button-primary">
        {text.freezer.add}
      </button>
    </form>
  );
}
