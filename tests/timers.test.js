// Pruebas de los temporizadores y del ajuste de cantidades del modo de cocina.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createTimer, getRemainingMs, isTimerDone, sortTimers } from '../src/lib/timers.js';
import { describeIngredient } from '../src/lib/scaling.js';

test('un temporizador guarda su hora de término y calcula lo que falta', () => {
  const timer = createTimer('a', 'Paso 2', 10, 1000000);
  assert.equal(timer.endsAt, 1600000);
  assert.equal(getRemainingMs(timer, 1000000), 600000);
  assert.equal(getRemainingMs(timer, 1500000), 100000);
  assert.equal(isTimerDone(timer, 1599999), false);
  assert.equal(isTimerDone(timer, 1600000), true);
  assert.equal(getRemainingMs(timer, 9999999), 0);
});

test('sortTimers pone primero el que termina antes y no cambia la lista original', () => {
  const timers = [{ id: 'late', endsAt: 30 }, { id: 'soon', endsAt: 10 }];
  assert.deepEqual(sortTimers(timers).map((timer) => timer.id), ['soon', 'late']);
  assert.equal(timers[0].id, 'late');
});

const label = (unit, amount) => ({ cda: ['cda', 'cdas'], taza: ['taza', 'tazas'] }[unit][amount > 1 ? 1 : 0]);
const ingredient = { text: '2 cdas de salsa de soya', name: 'salsa de soya', amount: 2, unit: 'cda' };

test('con el tamaño normal se muestran las palabras del manual', () => {
  assert.equal(describeIngredient(ingredient, 1, label), '2 cdas de salsa de soya');
});

test('al cambiar el tamaño se recalcula la cantidad con fracciones', () => {
  assert.equal(describeIngredient(ingredient, 0.5, label), '1 cda de salsa de soya');
  assert.equal(describeIngredient(ingredient, 2, label), '4 cdas de salsa de soya');
  const range = { text: '1–1½ tazas de caldo', name: 'caldo', amount: 1, amountMax: 1.5, unit: 'taza' };
  assert.equal(describeIngredient(range, 0.5, label), '½–¾ taza de caldo');
});

test('sin cantidad o sin unidad el ingrediente se muestra bien', () => {
  assert.equal(describeIngredient({ text: 'Sal', name: 'Sal', amount: null, unit: null }, 2, label), 'Sal');
  assert.equal(describeIngredient({ text: '1 cebolla en tiras', name: 'cebolla en tiras', amount: 1, unit: null }, 2, label), 'cebolla en tiras: 2');
  const optional = { text: 'Cilantro (opcional)', name: 'cilantro', amount: 1, unit: 'taza', optional: true };
  assert.equal(describeIngredient(optional, 2, label), '2 tazas de cilantro (opcional)');
  const inSection = { text: 'Salsa: 2 cdas de salsa de soya', name: 'salsa de soya', amount: 2, unit: 'cda', section: 'Salsa' };
  assert.equal(describeIngredient(inSection, 2, label), 'Salsa: 4 cdas de salsa de soya');
});
