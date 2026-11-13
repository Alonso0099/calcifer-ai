// Botón "Deshacer": anula el último registro (paso, proceso terminado o nota).
import { useState } from 'react';
import { undoLastEvent } from '../../data/index.js';
import { text } from '../text.js';
import './UndoButton.css';

/**
 * Botón que anula el último evento guardado y muestra qué se deshizo.
 *
 * Las "props" son los datos que un componente recibe de quien lo usa, como los
 * atributos de una etiqueta HTML. Aquí solo hay una: onUndone.
 *
 * @param {object} props
 * @param {() => void} props.onUndone - Se llama después de deshacer, para que la pantalla vuelva a pedir sus datos.
 * @returns {JSX.Element} El botón y, debajo, el mensaje de lo que pasó.
 */
export default function UndoButton({ onUndone }) {
  const [message, setMessage] = useState('');

  /** Anula el último evento y avisa a la pantalla. */
  async function handleClick() {
    const undoneEvent = await undoLastEvent();
    setMessage(undoneEvent ? text.undo.done[undoneEvent.type] : text.undo.nothing);
    if (undoneEvent) onUndone();
  }

  return (
    <div className="undo">
      <button type="button" className="button" onClick={handleClick}>
        {text.undo.button}
      </button>
      {/* role="status" hace que un lector de pantalla lea el mensaje cuando aparece. */}
      <p className="undo-message" role="status">
        {message}
      </p>
    </div>
  );
}
