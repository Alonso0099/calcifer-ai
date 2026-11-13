// Formulario para registrar que un proceso se terminó: minutos y, si se quiere, quién lo hizo.
import { useState } from 'react';
import { DONE_BY_OPTIONS } from '../../shared/constants.js';
import { text } from '../../shared/text.js';
import './FinishForm.css';

/**
 * Pide los minutos (ya vienen llenos con lo que marcó el cronómetro, pero se pueden
 * corregir) y la nota opcional de quién lo hizo. "Prefiero no anotar" viene elegido:
 * anotar a alguien nunca es obligatorio ni asigna nada.
 *
 * @param {object} props
 * @param {number} props.initialMinutes - Los minutos del cronómetro.
 * @param {(minutes: number, doneBy: string|null) => void} props.onConfirm - Se llama al guardar.
 * @param {() => void} props.onCancel - Se llama al cancelar.
 * @returns {JSX.Element} El formulario.
 */
export default function FinishForm({ initialMinutes, onConfirm, onCancel }) {
  const [minutes, setMinutes] = useState(String(initialMinutes));
  const [doneBy, setDoneBy] = useState('');

  /** Guarda el registro. preventDefault evita que el formulario recargue la página. */
  function handleSubmit(event) {
    event.preventDefault();
    onConfirm(Number(minutes), doneBy === '' ? null : doneBy);
  }

  const doneByOptions = [...DONE_BY_OPTIONS.map((name) => ({ value: name, label: name })), { value: '', label: text.finish.doneByNone }];
  return (
    <form className="finish-form" onSubmit={handleSubmit}>
      <h3>{text.finish.title}</h3>
      <label className="finish-form-field">
        {text.finish.minutesLabel}
        <input
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          required
          value={minutes}
          onChange={(event) => setMinutes(event.target.value)}
        />
      </label>
      <fieldset className="finish-form-done-by">
        <legend>{text.finish.doneByLabel}</legend>
        {doneByOptions.map((option) => (
          <label key={option.label} className="finish-form-option">
            <input type="radio" name="doneBy" value={option.value} checked={doneBy === option.value} onChange={() => setDoneBy(option.value)} />
            {option.label}
          </label>
        ))}
      </fieldset>
      <div className="finish-form-buttons">
        <button type="submit" className="button button-primary">
          {text.finish.confirm}
        </button>
        <button type="button" className="button" onClick={onCancel}>
          {text.finish.cancel}
        </button>
      </div>
    </form>
  );
}
