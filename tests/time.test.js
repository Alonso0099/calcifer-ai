// Pruebas de los tiempos de un proceso, del cronómetro y de las fechas de la casa.
import test from 'node:test';
import assert from 'node:assert/strict';
import { formatStopwatch, getElapsedMs, getMinutesFromElapsed, getProcessTime } from '../src/lib/time.js';
import { formatHouseDate } from '../src/lib/dates.js';

const step = (minutes) => ({ id: 'paso-1', text: 'x', minutes });

test('getProcessTime prefiere lo medido, luego lo estimado, luego pendiente', () => {
  assert.deepEqual(getProcessTime({ steps: [step(5), step(7)], estimatedMinutes: { min: 45, max: 60 } }), { kind: 'measured', minutes: 12 });
  assert.deepEqual(getProcessTime({ steps: [step(5), step(null)], estimatedMinutes: { min: 45, max: 60 } }), { kind: 'estimated', min: 45, max: 60 });
  assert.deepEqual(getProcessTime({ steps: [step(null)], estimatedMinutes: null }), { kind: 'pending' });
  assert.deepEqual(getProcessTime({ steps: [], estimatedMinutes: null }), { kind: 'pending' });
});

test('formatStopwatch muestra minutos y segundos, y horas solo si hacen falta', () => {
  assert.equal(formatStopwatch(0), '00:00');
  assert.equal(formatStopwatch(425000), '07:05');
  assert.equal(formatStopwatch(4025000), '1:07:05');
});

test('getMinutesFromElapsed redondea y nunca baja de 1', () => {
  assert.equal(getMinutesFromElapsed(10000), 1);
  assert.equal(getMinutesFromElapsed(149000), 2);
  assert.equal(getMinutesFromElapsed(151000), 3);
});

test('formatHouseDate usa el día de Denver, no el de UTC', () => {
  // 03:15 UTC del 14 de noviembre todavía es 13 de noviembre en Denver.
  assert.match(formatHouseDate('2026-11-14T03:15:00.000Z'), /^13 nov 2026$/);
});

test('getElapsedMs suma lo acumulado y lo que lleva corriendo', () => {
  assert.equal(getElapsedMs({ accumulatedMs: 5000, startedAt: null }, 99000), 5000);
  assert.equal(getElapsedMs({ accumulatedMs: 5000, startedAt: 90000 }, 99000), 14000);
});
