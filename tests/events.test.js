// Pruebas de las funciones puras de eventos: deshacer, última vez y pasos marcados.
import test from 'node:test';
import assert from 'node:assert/strict';
import { isEventInUndoScope } from '../src/lib/undoScope.js';
import { getActiveEvents, getCheckedStepIds, getLastDoneIso, getLastUndoableEvent } from '../src/lib/events.js';

const check = (id, stepId) => ({ id, type: 'step_checked', processId: 'limpieza-semanal', stepId, createdAt: `2026-11-13T10:0${id}:00.000Z` });
const uncheck = (id, stepId) => ({ ...check(id, stepId), type: 'step_unchecked' });
const finish = (id, processId = 'limpieza-semanal') => ({ id, type: 'process_finished', processId, minutes: 50, doneBy: null, createdAt: `2026-11-13T11:0${id}:00.000Z` });
const everything = () => true;
const undo = (id, targetEventId) => ({ id, type: 'event_undone', targetEventId, createdAt: '2026-11-13T12:00:00.000Z' });

test('getActiveEvents quita el evento anulado y la anulación', () => {
  const events = [check('1', 'paso-1'), check('2', 'paso-2'), undo('3', '2')];
  assert.deepEqual(getActiveEvents(events).map((event) => event.id), ['1']);
});

test('deshacer varias veces va anulando hacia atrás', () => {
  const events = [check('1', 'paso-1'), check('2', 'paso-2')];
  assert.equal(getLastUndoableEvent(events, everything).id, '2');
  events.push(undo('3', '2'));
  assert.equal(getLastUndoableEvent(events, everything).id, '1');
  events.push(undo('4', '1'));
  assert.equal(getLastUndoableEvent(events, everything), null);
});

test('getLastUndoableEvent regresa null sin historial', () => {
  assert.equal(getLastUndoableEvent([], everything), null);
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

test('descartar un proceso limpia su checklist como terminarlo, y deshacerlo lo recupera', () => {
  const discard = { id: '3', type: 'process_discarded', processId: 'limpieza-semanal', createdAt: '2026-11-13T11:30:00.000Z' };
  const events = [check('1', 'paso-1'), check('2', 'paso-2'), discard];
  assert.equal(getCheckedStepIds(events, 'limpieza-semanal').size, 0);
  assert.equal(getLastDoneIso(events, 'limpieza-semanal'), null, 'descartar no cuenta como terminado');
  events.push(undo('4', '3'));
  assert.equal(getCheckedStepIds(events, 'limpieza-semanal').size, 2);
});

test('el Deshacer de una tarea solo alcanza los registros de hoy de esa tarea', () => {
  const now = new Date('2026-11-13T20:00:00.000Z');
  const inTask = (event) => isEventInUndoScope(event, { processId: 'limpieza-semanal' }, now);
  const otherTask = { ...check('1', 'paso-1'), processId: 'pozole-rojo' };
  const meal = { id: '2', type: 'meal_planned', processId: 'limpieza-semanal', createdAt: '2026-11-13T10:00:00.000Z' };
  const lastWeek = { ...finish('3'), createdAt: '2026-11-06T18:00:00.000Z' };
  assert.equal(inTask(check('4', 'paso-1')), true);
  assert.equal(inTask(otherTask), false, 'otra tarea no se toca');
  assert.equal(inTask(meal), false, 'el menú no se toca aunque la receta sea la misma');
  assert.equal(inTask(lastWeek), false, 'el terminado de la semana pasada no se toca');
  assert.equal(getLastUndoableEvent([lastWeek, check('4', 'paso-1'), otherTask, meal], inTask).id, '4');
});

test('el Deshacer de una sección solo alcanza los registros de esa sección', () => {
  const now = new Date('2026-11-13T20:00:00.000Z');
  const meal = { id: '1', type: 'meal_planned', createdAt: '2026-11-01T10:00:00.000Z' };
  assert.equal(isEventInUndoScope(meal, { area: 'planner' }, now), true);
  assert.equal(isEventInUndoScope(meal, { area: 'freezer' }, now), false);
  assert.equal(isEventInUndoScope(check('2', 'paso-1'), { area: 'planner' }, now), false);
});
