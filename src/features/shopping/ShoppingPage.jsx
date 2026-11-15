// Pantalla de compras: lo que hay que comprar, armado con el congelador, el menú y lo anotado a mano.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { addShoppingItem, completeShopping, removeShoppingItem, setShoppingItemChecked } from '../../data/index.js';
import { formatHouseDate } from '../../lib/dates.js';
import UndoButton from '../../shared/components/UndoButton.jsx';
import { text } from '../../shared/text.js';
import { useLoadedData } from '../../shared/useLoadedData.js';
import AddItemForm from './AddItemForm.jsx';
import ShoppingSection from './ShoppingSection.jsx';
import { loadShopping } from './loadShopping.js';
import './ShoppingPage.css';

/**
 * La lista de compras. No hay que armarla: sale sola del menú de la semana y de lo que falta
 * en el congelador. La persona solo marca lo que ya compró (o ya tenía) y, al terminar, confirma.
 *
 * @returns {JSX.Element} Las tres partes de la lista, el campo para anotar y el botón de terminar.
 */
export default function ShoppingPage() {
  const { data, isLoading, hasError, reload } = useLoadedData(loadShopping, []);
  const [message, setMessage] = useState('');

  /** Marca o desmarca un renglón, se guarda al momento y se vuelve a leer la lista. */
  async function handleCheck(key, isChecked) {
    setMessage('');
    await setShoppingItemChecked(key, isChecked);
    await reload();
  }

  /** Anota algo a mano y se vuelve a leer la lista. */
  async function handleAdd(name) {
    await addShoppingItem(name);
    await reload();
  }

  /** Quita un renglón anotado a mano y se vuelve a leer la lista. */
  async function handleRemove(itemId) {
    await removeShoppingItem(itemId);
    await reload();
  }

  /** Termina la compra: las casillas se vacían y lo anotado a mano que se compró sale de la lista. */
  async function handleComplete() {
    const checkedCount = await completeShopping();
    setMessage(text.shopping.completed(checkedCount));
    await reload();
  }

  if (isLoading) return <p>{text.common.loading}</p>;
  if (hasError) return <p>{text.common.loadError}</p>;
  const { list, lastCompletedAt } = data;
  return (
    <>
      <h2 className="shopping-title">{text.shopping.title}</h2>
      <p className="shopping-intro">
        {list.totalCount === 0 ? text.shopping.empty : text.shopping.progress(list.checkedCount, list.totalCount)}
        {lastCompletedAt && ` ${text.shopping.lastTrip(formatHouseDate(lastCompletedAt))}`}
      </p>
      <ShoppingSection title={text.shopping.proteinTitle} help={text.shopping.proteinHelp} items={list.protein} onCheck={handleCheck} />
      <ShoppingSection title={text.shopping.menuTitle} help={text.shopping.menuHelp} items={list.menu} onCheck={handleCheck} />
      <ShoppingSection title={text.shopping.manualTitle} help={text.shopping.manualHelp} items={list.manual} onCheck={handleCheck} onRemove={handleRemove} />
      <AddItemForm onAdd={handleAdd} />
      <div className="shopping-finish">
        <button type="button" className="button button-primary" disabled={list.checkedCount === 0} onClick={handleComplete}>
          {text.shopping.finish}
        </button>
        <UndoButton scope={{ area: 'shopping' }} onUndone={reload} />
      </div>
      {message && (
        <p className="shopping-message" role="status">
          {message} <Link to="/congelador">{text.shopping.toFreezer}</Link>
        </p>
      )}
    </>
  );
}
