// Pruebas del menú y de "Hoy": días de la semana, lo planeado y las tareas del día.
import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, formatDayLong, getWeekDays, getWeekdayId } from '../src/lib/dates.js';
import { getMealPlanByDay } from '../src/lib/mealPlan.js';
import { buildTodayTasks, getRecipesToThaw } from '../src/lib/today.js';

const plan = (id, day, slot, kind, processId = null) => ({ id, type: 'meal_planned', day, slot, kind, processId, createdAt: `2026-11-13T10:0${id}:00.000Z` });
const undo = (id, targetEventId) => ({ id, type: 'event_undone', targetEventId, createdAt: '2026-11-13T12:00:00.000Z' });

test('addDays cruza meses y años sin perder el día', () => {
  assert.equal(addDays('2026-11-30', 1), '2026-12-01');
  assert.equal(addDays('2027-01-01', -1), '2026-12-31');
});

test('la semana va de domingo a sábado', () => {
  assert.equal(getWeekdayId('2026-11-13'), 'viernes');
  assert.deepEqual(getWeekDays('2026-11-13'), ['2026-11-08', '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14']);
  assert.equal(formatDayLong('2026-11-13'), 'viernes, 13 de noviembre');
});

test('el menú muestra lo último planeado; quitar lo vacía y deshacer lo regresa', () => {
  const events = [plan('1', '2026-11-16', 'dinner', 'recipe', 'pollo-sudado'), plan('2', '2026-11-16', 'dinner', 'recipe', 'chuletas')];
  assert.equal(getMealPlanByDay(events)['2026-11-16'].dinner.processId, 'chuletas');
  events.push(plan('3', '2026-11-16', 'dinner', 'none'));
  assert.deepEqual(getMealPlanByDay(events)['2026-11-16'], {});
  events.push(undo('4', '3'));
  assert.equal(getMealPlanByDay(events)['2026-11-16'].dinner.processId, 'chuletas');
});

const processesById = {
  'pollo-sudado': { id: 'pollo-sudado', name: 'Pollo Sudado', group: 'pollo' },
  quesadillas: { id: 'quesadillas', name: 'Quesadillas', group: 'flex' },
  'limpieza-de-cada-vez': { id: 'limpieza-de-cada-vez', name: 'Limpiar después de cocinar' },
  'cierre-diario': { id: 'cierre-diario', name: 'Cerrar la cocina por la noche' },
  'limpieza-semanal': { id: 'limpieza-semanal', name: 'Limpieza semanal de la cocina' },
  'servicio-diario': { id: 'servicio-diario', name: 'Cocinar la cena' },
};
const now = new Date('2026-11-13T19:00:00.000Z');

test('si hoy se cocina, tocan la receta, limpiar y cerrar; sin duplicar ni repetir el servicio diario', () => {
  const tasks = buildTodayTasks({
    todayMeals: { dinner: { kind: 'recipe', processId: 'pollo-sudado' } },
    todayBlocks: [{ processId: 'servicio-diario' }, { processId: 'limpieza-semanal' }],
    overdueProcessIds: ['limpieza-semanal'],
    processesById,
    lastDoneByProcessId: { 'pollo-sudado': '2026-11-13T18:00:00.000Z', 'cierre-diario': '2026-11-12T03:00:00.000Z' },
    now,
  });
  assert.deepEqual(tasks.map((task) => [task.processId, task.reason, task.isDone]), [
    ['pollo-sudado', 'meal', true],
    ['limpieza-de-cada-vez', 'daily', false],
    ['cierre-diario', 'daily', false],
    ['limpieza-semanal', 'week', false],
  ]);
});

test('si hoy se come afuera, no aparecen tareas de cocina', () => {
  const tasks = buildTodayTasks({ todayMeals: { dinner: { kind: 'eat_out', processId: null } }, todayBlocks: [], overdueProcessIds: [], processesById, lastDoneByProcessId: {}, now });
  assert.deepEqual(tasks, []);
});

test('getRecipesToThaw avisa solo de recetas con proteína del congelador', () => {
  const tomorrow = { dinner: { kind: 'recipe', processId: 'pollo-sudado' }, lunch: { kind: 'recipe', processId: 'quesadillas' }, breakfast: { kind: 'leftovers', processId: null } };
  assert.deepEqual(getRecipesToThaw(tomorrow, processesById).map((process) => process.id), ['pollo-sudado']);
});
