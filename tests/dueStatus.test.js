// Pruebas del vencimiento: días restantes en la hora de la casa, estados, barra y zonas.
import test from 'node:test';
import assert from 'node:assert/strict';
import { compareByUrgency, getDaysUntilDue, getDueProgress, getDueStatus } from '../src/lib/dueStatus.js';
import { buildZoneBoards } from '../src/lib/maintenance.js';

// Mediodía en Denver del 13 de noviembre de 2026 (19:00 UTC).
const today = new Date('2026-11-13T19:00:00.000Z');

test('getDaysUntilDue cuenta días del calendario de Denver', () => {
  assert.equal(getDaysUntilDue(null, 7, today), null);
  assert.equal(getDaysUntilDue('2026-11-13T15:00:00.000Z', 7, today), 7);
  assert.equal(getDaysUntilDue('2026-11-06T19:00:00.000Z', 7, today), 0);
  assert.equal(getDaysUntilDue('2026-11-01T19:00:00.000Z', 7, today), -5);
});

test('algo hecho de noche en Denver cuenta como ese día, aunque en UTC ya sea el siguiente', () => {
  // 03:30 UTC del 7 de noviembre son las 8:30 pm del 6 de noviembre en Denver.
  assert.equal(getDaysUntilDue('2026-11-07T03:30:00.000Z', 7, today), 0);
});

test('getDueStatus usa el umbral de 3 días para "vence pronto"', () => {
  assert.equal(getDueStatus(null), 'none');
  assert.equal(getDueStatus(-1), 'late');
  assert.equal(getDueStatus(0), 'today');
  assert.equal(getDueStatus(3), 'soon');
  assert.equal(getDueStatus(4), 'ok');
});

test('getDueProgress va de 0 (recién hecha) a 1 (vencida) y no se sale de ahí', () => {
  assert.equal(getDueProgress(null, 7), 0);
  assert.equal(getDueProgress(7, 7), 0);
  assert.equal(getDueProgress(0, 7), 1);
  assert.equal(getDueProgress(-20, 7), 1);
  assert.equal(getDueProgress(15, 30), 0.5);
});

test('compareByUrgency ordena: atrasada, hoy, pronto, sin registro, al día', () => {
  const tasks = [
    { status: 'ok', daysUntilDue: 20 }, { status: 'none', daysUntilDue: null }, { status: 'late', daysUntilDue: -2 },
    { status: 'soon', daysUntilDue: 2 }, { status: 'late', daysUntilDue: -9 }, { status: 'today', daysUntilDue: 0 },
  ];
  assert.deepEqual(tasks.sort(compareByUrgency).map((task) => task.daysUntilDue), [-9, -2, 0, 2, null, 20]);
});

test('buildZoneBoards agrupa por zona, deja fuera lo que no aplica y pone primero lo más atrasado', () => {
  const zones = [{ id: 'cocina-general', name: 'Cocina' }, { id: 'refri', name: 'Refri' }, { id: 'piso', name: 'Piso' }];
  const task = (id, zone, frequencyDays, category = 'mantenimiento') => ({ id, name: id, zone, frequencyDays, category });
  const processes = [
    task('limpieza-semanal', 'cocina-general', 7, 'limpieza'),
    task('mantenimiento-mensual', 'cocina-general', 30),
    task('cierre-diario', 'cocina-general', null, 'limpieza'),
    task('refri-a-fondo', 'refri', 90),
    task('conteo-congelador', 'refri', 30, 'compra'),
  ];
  const lastDone = { 'limpieza-semanal': '2026-11-12T19:00:00.000Z', 'refri-a-fondo': '2026-07-01T19:00:00.000Z' };
  const boards = buildZoneBoards(zones, processes, lastDone, today);

  assert.deepEqual(boards.map((board) => board.zone.id), ['refri', 'cocina-general']);
  assert.equal(boards[0].worstTask.status, 'late');
  assert.deepEqual(boards[0].tasks.map((item) => item.process.id), ['refri-a-fondo']);
  assert.deepEqual(boards[1].tasks.map((item) => [item.process.id, item.status]), [['mantenimiento-mensual', 'none'], ['limpieza-semanal', 'ok']]);
});
