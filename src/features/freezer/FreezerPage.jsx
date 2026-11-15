// Pantalla del congelador: cuántas unidades de proteína hay, cuántas faltan y qué bolsas son.
import { getFreezer, getFreezerCatalog, removeFreezerItem, saveFreezerItem } from '../../data/index.js';
import { getHouseDayText } from '../../lib/dates.js';
import { buildFreezerBoard } from '../../lib/freezer.js';
import UndoButton from '../../shared/components/UndoButton.jsx';
import { text } from '../../shared/text.js';
import { useLoadedData } from '../../shared/useLoadedData.js';
import AddBagsForm from './AddBagsForm.jsx';
import FreezerProtein from './FreezerProtein.jsx';
import './FreezerPage.css';

/**
 * Pide las bolsas y el catálogo y arma el tablero. Lo que falta por comprar no se
 * guarda: se calcula cada vez como "meta − existencia".
 *
 * @returns {Promise<{board: object, proteins: object[], today: string}>}
 */
async function loadFreezer() {
  const today = getHouseDayText(new Date());
  const [items, catalog] = await Promise.all([getFreezer(), getFreezerCatalog()]);
  return { board: buildFreezerBoard(items, catalog, today), proteins: catalog.proteins, today };
}

/**
 * El inventario del congelador. Reemplaza contar de memoria: al terminar la preparación
 * mensual se registran las bolsas, y al cocinar se toca "La usé".
 *
 * @returns {JSX.Element} El resumen, una tarjeta por proteína, el formulario y Deshacer.
 */
export default function FreezerPage() {
  const { data, isLoading, hasError, reload } = useLoadedData(loadFreezer, []);

  /** Registra varias bolsas iguales, una por una, y vuelve a leer el inventario. */
  async function handleAdd({ count, ...bag }) {
    for (let index = 0; index < count; index += 1) await saveFreezerItem(bag);
    await reload();
  }

  /** Saca una bolsa (se usó o se tiró) y vuelve a leer el inventario. */
  async function handleRemove(itemId, reason) {
    await removeFreezerItem(itemId, reason);
    await reload();
  }

  if (isLoading) return <p>{text.common.loading}</p>;
  if (hasError) return <p>{text.common.loadError}</p>;
  const { board } = data;
  return (
    <>
      <h2 className="freezer-title">{text.freezer.title}</h2>
      <section className="card freezer-summary">
        <p className="freezer-summary-total">{text.freezer.total(board.totalUnits, board.totalTarget)}</p>
        <p className="freezer-summary-missing">{board.totalMissing > 0 ? text.freezer.totalMissing(board.totalMissing) : text.freezer.totalComplete}</p>
        <p className="freezer-summary-help">{text.freezer.summaryHelp}</p>
      </section>
      <div className="freezer-proteins">
        {board.proteins.map((protein) => (
          <FreezerProtein key={protein.id} protein={protein} onRemove={handleRemove} />
        ))}
      </div>
      <AddBagsForm proteins={data.proteins} today={data.today} onAdd={handleAdd} />
      <div className="freezer-undo">
        <UndoButton scope={{ area: 'freezer' }} onUndone={reload} />
      </div>
    </>
  );
}
