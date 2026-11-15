// Pruebas del modo paso a paso: texto según el tipo de proceso y pasos que dependen de empacar almuerzo.
import test from 'node:test';
import assert from 'node:assert/strict';
import { getStepByStepKind, getStepsForToday, packsLunchOn } from '../src/lib/stepByStep.js';

test('cada tipo de proceso tiene su propio verbo', () => {
  assert.equal(getStepByStepKind({ category: 'preparar', group: 'pollo' }), 'recipe');
  assert.equal(getStepByStepKind({ category: 'preparar', group: 'prep-verduras' }), 'prep');
  assert.equal(getStepByStepKind({ category: 'preparar' }), 'other');
  assert.equal(getStepByStepKind({ category: 'limpieza' }), 'cleaning');
  assert.equal(getStepByStepKind({ category: 'mantenimiento' }), 'cleaning');
  assert.equal(getStepByStepKind({ category: 'guardar' }), 'storing');
  assert.equal(getStepByStepKind({ category: 'compra' }), 'shopping');
  assert.equal(getStepByStepKind({ category: 'seguridad' }), 'other');
});

const weekPlan = { days: [{ id: 'jueves', packLunchForTomorrow: true }, { id: 'viernes', packLunchForTomorrow: false }] };
const steps = [{ id: 'paso-1' }, { id: 'paso-2', onlyIfPackingLunch: true }, { id: 'paso-3' }];

test('el paso de empacar almuerzo solo aparece los días en que se empaca', () => {
  assert.equal(packsLunchOn(weekPlan, 'jueves'), true);
  assert.equal(packsLunchOn(weekPlan, 'viernes'), false);
  assert.equal(packsLunchOn(weekPlan, 'no-existe'), false);
  assert.deepEqual(getStepsForToday(steps, true).map((step) => step.id), ['paso-1', 'paso-2', 'paso-3']);
  assert.deepEqual(getStepsForToday(steps, false).map((step) => step.id), ['paso-1', 'paso-3']);
});
