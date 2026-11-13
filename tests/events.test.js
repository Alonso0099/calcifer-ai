// Pruebas de las funciones puras de eventos: deshacer, última vez y pasos marcados.
import test from 'node:test';
import assert from 'node:assert/strict';
import { getActiveEvents, getCheckedStepIds, getLastDoneIso, getLastUndoableEvent } from '../src/lib/events.js';

const check = (id, stepId) => ({ id, type: 'step_checked', processId: 'limpieza-semanal', stepId, createdAt: `2026-11-13T10:0${id}:00.000Z` });
const uncheck = (id, stepId) => ({ ...check(id, stepId), type: 'step_unchecked' });
const finish = (id, processId = 'limpieza-semanal') => ({ id, type: 'process_finished', processId, minutes: 50, doneBy: null, createdAt: `2026-11-13T11:0${id}:00.000Z` });
const undo = (id, targetEventId) => ({ id, type: 'event_undone', targetEventId, createdAt: '2026-11-13T12:00:00.000Z' });

test('getActiveEvents quita el evento anulado y la anulación', () => {
  const events = [check('1', 'paso-1'), check('2', 'paso-2'), undo('3', '2')];
  assert.deepEqual(getActiveEvents(events).map((event) => event.id), ['1']);
});

test('deshacer varias veces va anulando hacia atrás', () => {
  const events = [check('1', 'paso-1'), check('2', 'paso-2')];
  assert.equal(getLastUndoableEvent(events).id, '2');
  events.push(undo('3', '2'));
  assert.equal(getLastUndoableEvent(events).id, '1');
  events.push(undo('4', '1'));
  assert.equal(getLastUndoableEvent(events), null);
});

test('getLastUndoableEvent regresa null sin historial', () => {
  assert.equal(getLastUndoableEvent([]), null);
});

test('getLastDoneIso regresa la fecha de la última vez, solo de ese proceso', () => {
  const events = [finish('1'), finish('2', 'refri-a-fondo'), finish('3')];
  assert.equal(getLastDoneIso(events, 'limpieza-semanal'), '2026-11-13T11:03:00.000Z');
  assert.equal(getLastDoneIso(events, 'horno-steam-clean'), null);
});

test('al deshacer un "terminado", la última vez vuelve a la anterior', () => {
  const events = [finish('1'), finish('2'), undo('3', '2')];
  assert.equal(getLastDoneIso(events, 'limpieza-semanal'), '2026-11-13T11:01:00.000Z');
});

test('getCheckedStepIds sigue los pasos marcados y desmarcados', () => {
  const events = [check('1', 'paso-1'), check('2', 'paso-2'), uncheck('3', 'paso-1')];
  assert.deepEqual([...getCheckedStepIds(events, 'limpieza-semanal')], ['paso-2']);
  assert.deepEqual([...getCheckedStepIds(events, 'refri-a-fondo')], []);
});

test('terminar el proceso limpia el checklist; deshacerlo lo recupera', () => {
  const events = [check('1', 'paso-1'), finish('2')];
  assert.equal(getCheckedStepIds(events, 'limpieza-semanal').size, 0);
  events.push(undo('3', '2'));
  assert.deepEqual([...getCheckedStepIds(events, 'limpieza-semanal')], ['paso-1']);
});
