// Pruebas de la lista de compras: casillas, lo anotado a mano, ingredientes del menú y formato de cantidades.
import test from 'node:test';
import assert from 'node:assert/strict';
import { formatAmount, formatNumber } from '../src/lib/quantity.js';
import { buildShoppingList, collectMenuIngredients, getShoppingState } from '../src/lib/shopping.js';

const ev = (id, type, fields) => ({ id, type, ...fields, createdAt: `2026-11-14T10:0${id}:00.000Z` });
const undo = (id, targetEventId) => ev(id, 'event_undone', { targetEventId });

test('formatNumber y formatAmount escriben fracciones y rangos', () => {
  assert.equal(formatNumber(1.5), '1½');
  assert.equal(formatNumber(0.25), '¼');
  assert.equal(formatNumber(2), '2');
  assert.equal(formatNumber(1 / 3 + 1 / 3), '⅔');
  assert.equal(formatNumber(0.1), '0.1');
  assert.equal(formatAmount(1, 1.5), '1–1½');
  assert.equal(formatAmount(2, 2), '2');
});

test('las casillas se marcan, se desmarcan, se deshacen y se limpian al terminar la compra', () => {
  const events = [ev('1', 'shopping_item_checked', { key: 'menu:ajo|diente' }), ev('2', 'shopping_item_checked', { key: 'protein:pollo' })];
  assert.deepEqual([...getShoppingState(events).checkedKeys], ['menu:ajo|diente', 'protein:pollo']);
  events.push(ev('3', 'shopping_item_unchecked', { key: 'protein:pollo' }));
  assert.deepEqual([...getShoppingState(events).checkedKeys], ['menu:ajo|diente']);
  events.push(undo('4', '3'));
  assert.equal(getShoppingState(events).checkedKeys.size, 2);
  events.push(ev('5', 'shopping_completed', { checkedCount: 2 }));
  const state = getShoppingState(events);
  assert.equal(state.checkedKeys.size, 0);
  assert.equal(state.lastCompletedAt, '2026-11-14T10:05:00.000Z');
});

test('lo anotado a mano sale de la lista al comprarlo, y lo no comprado se queda', () => {
  const events = [
    ev('1', 'shopping_item_added', { itemId: 'a', name: 'Pilas para el detector' }),
    ev('2', 'shopping_item_added', { itemId: 'b', name: 'Bolsas para congelar' }),
    ev('3', 'shopping_item_checked', { key: 'manual:a' }),
    ev('4', 'shopping_completed', { checkedCount: 1 }),
  ];
  assert.deepEqual(getShoppingState(events).manualItems.map((item) => item.name), ['Bolsas para congelar']);
  events.push(ev('5', 'shopping_item_removed', { itemId: 'b' }));
  assert.equal(getShoppingState(events).manualItems.length, 0);
});

const processesById = {
  receta: { name: 'Receta A', ingredients: [
    { text: '2 dientes de ajo', name: 'ajo', amount: 2, unit: 'diente' },
    { text: '1 unidad de pollo con hueso', name: 'pollo con hueso', amount: 1, unit: 'unidad' },
    { text: '1–1½ tazas de caldo', name: 'caldo', amount: 1, amountMax: 1.5, unit: 'taza' },
    { text: 'Sal', name: 'Sal', amount: null, unit: null },
    { text: 'Cilantro (opcional)', name: 'cilantro', amount: null, unit: null, optional: true },
    { text: 'Los ingredientes de Carne en Salsa', name: 'Los ingredientes de Carne en Salsa', amount: null, unit: null },
  ] },
  otra: { name: 'Receta B', ingredients: [{ text: '3 dientes de ajo', name: 'Ajo', amount: 3, unit: 'diente' }] },
};
const mealPlan = {
  '2026-11-14': { dinner: { kind: 'recipe', processId: 'receta' } },
  '2026-11-16': { dinner: { kind: 'recipe', processId: 'otra' }, lunch: { kind: 'recipe', processId: 'receta' } },
  '2026-11-30': { dinner: { kind: 'recipe', processId: 'otra' } },
  '2026-11-15': { dinner: { kind: 'eat_out', processId: null } },
};

test('los ingredientes del menú se suman, sin opcionales, proteína ni referencias, y solo de los próximos 7 días', () => {
  const items = collectMenuIngredients(mealPlan, processesById, '2026-11-14');
  const byName = Object.fromEntries(items.map((item) => [item.name.toLowerCase(), item]));
  // Receta A dos veces (hoy y el 16) + Receta B una vez: 2 + 2 + 3 dientes de ajo.
  assert.equal(byName.ajo.amount, 7);
  assert.deepEqual(byName.ajo.recipes, ['Receta A', 'Receta B']);
  assert.deepEqual([byName.caldo.amount, byName.caldo.amountMax], [2, 3]);
  assert.equal(byName.sal.amount, null);
  assert.deepEqual(Object.keys(byName).sort(), ['ajo', 'caldo', 'sal']);
});

test('la lista junta proteína, menú y lo anotado a mano, y cuenta lo marcado', () => {
  const board = { proteins: [{ id: 'pollo', name: 'Pollo', missing: 4 }, { id: 'res', name: 'Res', missing: 0 }] };
  const state = { manualItems: [{ id: 'a', name: 'Pilas' }], checkedKeys: new Set(['protein:pollo', 'manual:a']) };
  const list = buildShoppingList({ board, mealPlan, processesById, state, today: '2026-11-14' });
  assert.deepEqual(list.protein.map((item) => [item.name, item.amount, item.checked]), [['Pollo', 4, true]]);
  assert.equal(list.manual[0].checked, true);
  assert.deepEqual([list.checkedCount, list.totalCount], [2, 5]);
});
