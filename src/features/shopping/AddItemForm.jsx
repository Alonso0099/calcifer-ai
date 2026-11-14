// Campo para anotar a mano algo que comprar y que no sale del menú ni del congelador.
import { useState } from 'react';
import { text } from '../../shared/text.js';
import './AddItemForm.css';

/**
 * Un campo y un botón. Guarda lo escrito en su propio estado y avisa a la pantalla al agregar.
 *
 * @param {object} props
 * @param {(name: string) => void} props.onAdd - Se llama con lo escrito.
 * @returns {JSX.Element} El formulario.
 */
export default function AddItemForm({ onAdd }) {
  const [name, setName] = useState('');

  /** Agrega el renglón y vacía el campo. preventDefault evita que el formulario recargue la página. */
  function handleSubmit(event) {
    event.preventDefault();
    if (name.trim() === '') return;
    onAdd(name);
    setName('');
  }

  return (
    <form className="card add-item" onSubmit={handleSubmit}>
      <label className="add-item-label" htmlFor="add-item-input">
        {text.shopping.addLabel}
      </label>
      <div className="add-item-row">
        <input id="add-item-input" className="field" type="text" value={name} placeholder={text.shopping.addPlaceholder} onChange={(event) => setName(event.target.value)} />
        <button type="submit" className="button button-primary">
          {text.shopping.add}
        </button>
      </div>
    </form>
  );
}
