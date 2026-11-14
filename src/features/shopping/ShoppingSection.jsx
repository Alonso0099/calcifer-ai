// Una parte de la lista de compras (proteína, menú o anotado a mano): título y renglones con casilla.
import { formatAmount } from '../../lib/quantity.js';
import { text } from '../../shared/text.js';
import './ShoppingSection.css';

/**
 * Escribe la cantidad de un renglón con su unidad: "2 dientes", "1–1½ tazas", "4 unidades".
 *
 * @param {{amount: number|null, amountMax: number|null, unit: string|null}} item - El renglón.
 * @returns {string} La cantidad, o texto vacío si el manual no da una.
 */
function describeQuantity(item) {
  if (item.amount === null) return '';
  const amountText = formatAmount(item.amount, item.amountMax);
  return item.unit ? `${amountText} ${text.shopping.unitLabel(item.unit, item.amountMax ?? item.amount)}` : amountText;
}

/**
 * Dibuja una parte de la lista. Marcar un renglón se guarda al momento; si el renglón se anotó
 * a mano, también se puede quitar.
 *
 * @param {object} props
 * @param {string} props.title - El título de la parte.
 * @param {string} props.help - Una línea que explica de dónde sale.
 * @param {object[]} props.items - Los renglones (de buildShoppingList).
 * @param {(key: string, isChecked: boolean) => void} props.onCheck - Se llama al marcar o desmarcar.
 * @param {(itemId: string) => void} [props.onRemove] - Si se da, cada renglón tiene un botón para quitarlo.
 * @returns {JSX.Element|null} La parte de la lista, o null si no tiene renglones.
 */
export default function ShoppingSection({ title, help, items, onCheck, onRemove }) {
  if (items.length === 0) return null;
  return (
    <section className="card shopping-section">
      <h3>{title}</h3>
      <p className="shopping-help">{help}</p>
      <ul className="shopping-items">
        {items.map((item) => (
          <li key={item.key} className="shopping-item">
            {/* La casilla y el texto van en un <label>: tocar cualquiera de los dos marca el renglón. */}
            <label className={item.checked ? 'shopping-label shopping-label-done' : 'shopping-label'}>
              <input type="checkbox" checked={item.checked} onChange={(event) => onCheck(item.key, event.target.checked)} />
              <span>
                <span className="shopping-name">{item.name}</span>
                {describeQuantity(item) && <span className="shopping-quantity"> · {describeQuantity(item)}</span>}
                {item.recipes.length > 0 && <span className="shopping-recipes">{text.shopping.forRecipes(item.recipes.join(', '))}</span>}
              </span>
            </label>
            {onRemove && (
              <button type="button" className="button shopping-remove" onClick={() => onRemove(item.itemId)}>
                {text.shopping.remove}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
