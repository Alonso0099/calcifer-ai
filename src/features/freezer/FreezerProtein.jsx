// La tarjeta de una proteína en el congelador: cuánto hay, cuánto falta y sus bolsas.
import { formatDayLong } from '../../lib/dates.js';
import { text } from '../../shared/text.js';
import './FreezerProtein.css';

/**
 * Muestra una proteína con sus bolsas, de la más vieja a la más nueva.
 * Cada bolsa tiene dos botones: "La usé" y "La tiré". Ninguno supone nada: la app
 * solo cambia el inventario cuando alguien lo confirma con un toque.
 *
 * @param {object} props
 * @param {object} props.protein - Una proteína de buildFreezerBoard (units, target, missing, items).
 * @param {(itemId: string, reason: string) => void} props.onRemove - Se llama al sacar una bolsa.
 * @returns {JSX.Element} La tarjeta de la proteína.
 */
export default function FreezerProtein({ protein, onRemove }) {
  return (
    <section className="card freezer-protein">
      <header className="freezer-protein-header">
        <h3>{protein.name}</h3>
        <p className="freezer-protein-count">{text.freezer.count(protein.units, protein.target)}</p>
      </header>
      <p className={protein.missing > 0 ? 'freezer-protein-missing' : 'freezer-protein-complete'}>
        {protein.missing > 0 ? text.freezer.missing(protein.missing) : text.freezer.complete}
      </p>
      {protein.items.length === 0 && <p className="freezer-protein-empty">{text.freezer.noBags}</p>}
      <ul className="freezer-bags">
        {protein.items.map((bag) => (
          <li key={bag.id} className="freezer-bag">
            <p className="freezer-bag-name">
              {bag.cutName}
              {bag.marinated ? ` · ${text.freezer.marinated}` : ''}
              {bag.units !== 1 ? ` · ${text.freezer.units(bag.units)}` : ''}
            </p>
            <p className={`freezer-bag-date freezer-bag-${bag.useStatus}`}>
              {text.freezer.useStatus[bag.useStatus]} {text.freezer.useBy(formatDayLong(bag.useByDay), bag.useByDay.slice(0, 4))}
            </p>
            <div className="freezer-bag-buttons">
              <button type="button" className="button" onClick={() => onRemove(bag.id, 'cooked')}>
                {text.freezer.used}
              </button>
              <button type="button" className="button" onClick={() => onRemove(bag.id, 'discarded')}>
                {text.freezer.discarded}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
