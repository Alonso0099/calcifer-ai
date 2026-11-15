// Los ingredientes del modo de cocina: casillas para ir juntándolos y un ajuste de tamaño.
import { useState } from 'react';
import { describeIngredient } from '../../lib/scaling.js';
import { QUANTITY_FACTORS } from '../../shared/constants.js';
import { text } from '../../shared/text.js';
import './IngredientsPanel.css';

/**
 * Lista los ingredientes con una casilla cada uno ("ya lo tengo") y botones para cocinar la
 * mitad, lo normal o el doble. El tamaño solo cambia las cantidades que se muestran: los
 * pasos, los tiempos y las temperaturas no se ajustan, y la pantalla lo dice.
 *
 * @param {object} props
 * @param {object[]} props.ingredients - Los ingredientes de la receta.
 * @param {number} props.factor - El tamaño elegido (0.5, 1 o 2).
 * @param {(factor: number) => void} props.onFactorChange - Se llama al elegir otro tamaño.
 * @returns {JSX.Element} El panel de ingredientes.
 */
export default function IngredientsPanel({ ingredients, factor, onFactorChange }) {
  // Las casillas de aquí son solo para ir juntando lo que se necesita; no se guardan.
  const [gathered, setGathered] = useState(new Set());

  /** Marca o desmarca un ingrediente como ya reunido. */
  function toggle(index) {
    const next = new Set(gathered);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setGathered(next);
  }

  return (
    <section className="card ingredients-panel">
      <h3>{text.cooking.ingredientsTitle}</h3>
      <div className="ingredients-scale" role="group" aria-label={text.cooking.scaleLabel}>
        {QUANTITY_FACTORS.map((option) => (
          <button key={option} type="button" className="button" aria-pressed={option === factor} onClick={() => onFactorChange(option)}>
            {text.cooking.scaleNames[option]}
          </button>
        ))}
      </div>
      {factor !== 1 && <p className="ingredients-note">{text.cooking.scaleNote}</p>}
      <ul className="ingredients-list">
        {ingredients.map((ingredient, index) => (
          <li key={ingredient.text}>
            <label className={gathered.has(index) ? 'ingredients-item ingredients-item-done' : 'ingredients-item'}>
              <input type="checkbox" checked={gathered.has(index)} onChange={() => toggle(index)} />
              <span>{describeIngredient(ingredient, factor, text.units.label)}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
