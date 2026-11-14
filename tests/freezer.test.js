// Pruebas del congelador: bolsas actuales, fechas límite y "meta − existencia = a comprar".
import test from 'node:test';
import assert from 'node:assert/strict';
import { addMonths, getDaysBetween } from '../src/lib/dates.js';
import { buildFreezerBoard, getFreezerItems, getProteinStock, getUseByDay } from '../src/lib/freezer.js';

const catalog = {
  marinatedUseByMonths: 3,
  proteins: [
    { id: 'pollo', name: 'Pollo', target: 10, cuts: [{ id: 'pollo-filetes', name: 'Filetes', useByMonths: 6 }] },
    { id: 'seafood', name: 'Pescado y mariscos', target: 4, cuts: [{ id: 'seafood-camarones', name: 'Camarones', useByMonths: 6 }] },
  ],
};
const saved = (id, itemId, cutId, prepDay, extra = {}) => ({ id, type: 'freezer_item_saved', itemId, cutId, marinated: false, units: 1, prepDay, createdAt: '2026-11-07T20:00:00.000Z', ...extra });

test('addMonths respeta el fin de mes y getDaysBetween cuenta días', () => {
  assert.equal(addMonths('2026-11-07', 6), '2027-05-07');
  assert.equal(addMonths('2026-08-31', 6), '2027-02-28');
  assert.equal(getDaysBetween('2026-11-07', '2026-11-10'), 3);
  assert.equal(getDaysBetween('2026-11-10', '2026-11-07'), -3);
});

test('una bolsa marinada usa el límite de marinadas si es más corto', () => {
  const cut = catalog.proteins[0].cuts[0];
  assert.equal(getUseByDay({ prepDay: '2026-11-07', marinated: false }, cut, 3), '2027-05-07');
  assert.equal(getUseByDay({ prepDay: '2026-11-07', marinated: true }, cut, 3), '2027-02-07');
});

test('getFreezerItems sigue lo guardado, lo corregido y lo que salió', () => {
  const events = [
    saved('1', 'a', 'pollo-filetes', '2026-11-07'),
    saved('2', 'b', 'pollo-filetes', '2026-11-07'),
    saved('3', 'a', 'pollo-filetes', '2026-11-07', { units: 2 }),
    { id: '4', type: 'freezer_item_removed', itemId: 'b', reason: 'cooked', createdAt: '2026-11-09T02:00:00.000Z' },
  ];
  assert.deepEqual(getFreezerItems(events), [{ id: 'a', cutId: 'pollo-filetes', marinated: false, units: 2, prepDay: '2026-11-07' }]);
});

test('el tablero calcula meta − existencia y pone primero lo más viejo', () => {
  const items = [
    { id: 'nueva', cutId: 'pollo-filetes', marinated: false, units: 1, prepDay: '2026-11-07' },
    { id: 'vieja', cutId: 'pollo-filetes', marinated: true, units: 1, prepDay: '2026-07-01' },
    { id: 'bolsa-grande', cutId: 'seafood-camarones', marinated: false, units: 5, prepDay: '2026-10-01' },
  ];
  const board = buildFreezerBoard(items, catalog, '2026-11-14');
  const [pollo, seafood] = board.proteins;
  assert.deepEqual([pollo.units, pollo.missing], [2, 8]);
  assert.deepEqual(pollo.items.map((bag) => [bag.id, bag.useByDay, bag.useStatus]), [['vieja', '2026-10-01', 'expired'], ['nueva', '2027-05-07', 'ok']]);
  // Hay más mariscos que la meta: lo que falta nunca es negativo.
  assert.deepEqual([seafood.units, seafood.missing], [5, 0]);
  assert.deepEqual([board.totalUnits, board.totalTarget, board.totalMissing], [7, 14, 8]);
});

test('getProteinStock dice cuánto hay y cuál bolsa se saca primero', () => {
  const items = [
    { id: 'nueva', cutId: 'pollo-filetes', marinated: false, units: 1, prepDay: '2026-11-07' },
    { id: 'vieja', cutId: 'pollo-filetes', marinated: false, units: 1, prepDay: '2026-09-01' },
  ];
  const board = buildFreezerBoard(items, catalog, '2026-11-14');
  const pollo = getProteinStock(board, 'pollo');
  assert.deepEqual([pollo.units, pollo.oldestBag.id], [2, 'vieja']);
  assert.equal(getProteinStock(board, 'seafood').oldestBag, null);
  assert.equal(getProteinStock(board, 'no-existe'), null);
});
