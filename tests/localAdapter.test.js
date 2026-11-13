// Pruebas del adaptador local con un almacenamiento falso que vive en memoria.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocalAdapter } from '../src/data/adapters/localAdapter.js';

const content = {
  processes: [
    { id: 'limpieza-semanal', name: 'Limpieza semanal', active: true, steps: [{ id: 'paso-1', text: 'Campana', minutes: null }, { id: 'paso-2', text: 'Trapear', minutes: null }] },
    { id: 'retirado', name: 'Proceso retirado', active: false, steps: [] },
  ],
  zones: [{ id: 'cocina-general', name: 'Cocina en general' }],
  week: { schemaVersion: 1, days: [{ id: 'viernes', name: 'Viernes', meal: null, blocks: [{ processId: 'limpieza-semanal', estimatedMinutes: { min: 45, max: 60 } }] }] },
};

/** Crea un adaptador nuevo con un almacenamiento vacío, para que cada prueba empiece limpia. */
function createTestAdapter() {
  const saved = new Map();
  const storage = { getItem: (key) => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) };
  return createLocalAdapter({ storage, content });
}

test('getProcesses solo regresa los activos; getProcess regresa null si no existe', async () => {
  const data = createTestAdapter();
  assert.deepEqual((await data.getProcesses()).map((process) => process.id), ['limpieza-semanal']);
  assert.equal(await data.getProcess('no-existe'), null);
});

test('toggleStep marca, desmarca y se puede deshacer', async () => {
  const data = createTestAdapter();
  assert.equal(await data.toggleStep('limpieza-semanal', 'paso-1'), true);
  assert.equal((await data.getProcess('limpieza-semanal')).steps[0].checked, true);
  assert.equal(await data.toggleStep('limpieza-semanal', 'paso-1'), false);
  await data.undoLastEvent();
  assert.equal((await data.getProcess('limpieza-semanal')).steps[0].checked, true);
  await assert.rejects(data.toggleStep('limpieza-semanal', 'paso-99'));
});

test('finishProcess guarda la última vez y doneBy solo como nota', async () => {
  const data = createTestAdapter();
  assert.equal(await data.getLastDone('limpieza-semanal'), null);
  const event = await data.finishProcess('limpieza-semanal', 52, 'Tita');
  assert.equal(event.doneBy, 'Tita');
  assert.equal(await data.getLastDone('limpieza-semanal'), event.createdAt);
  assert.equal((await data.finishProcess('limpieza-semanal', 40)).doneBy, null);
  assert.equal((await data.finishProcess('limpieza-semanal', 40, 'Ambos')).doneBy, 'Ambos');
  await assert.rejects(data.finishProcess('limpieza-semanal', 40, 'Alonso'));
});

test('notas: crear, editar, borrar y recuperar con Deshacer', async () => {
  const data = createTestAdapter();
  const note = await data.saveNote({ title: 'Idea', body: 'Probar con más ajo', processId: 'limpieza-semanal' });
  await data.saveNote({ id: note.id, title: 'Idea 2', body: 'Menos ajo', processId: 'limpieza-semanal' });
  assert.equal((await data.getNotes('limpieza-semanal'))[0].title, 'Idea 2');
  await data.deleteNote(note.id);
  assert.equal((await data.getNotes()).length, 0);
  await data.undoLastEvent();
  assert.equal((await data.getNotes()).length, 1);
});

test('getWeekPlan agrega el nombre del proceso a cada bloque', async () => {
  const week = await createTestAdapter().getWeekPlan();
  assert.equal(week.days[0].blocks[0].processName, 'Limpieza semanal');
});

test('el respaldo de un dispositivo se restaura en otro, con notas incluidas', async () => {
  const first = createTestAdapter();
  await first.toggleStep('limpieza-semanal', 'paso-2');
  await first.saveNote({ title: 'Nota', body: 'Texto' });
  const backupText = await first.exportBackup();

  const second = createTestAdapter();
  assert.equal(await second.importBackup({ text: async () => backupText }), 2);
  assert.equal((await second.getProcess('limpieza-semanal')).steps[1].checked, true);
  assert.equal((await second.getNotes()).length, 1);
  await assert.rejects(second.importBackup({ text: async () => 'basura' }));
  assert.equal((await second.getNotes()).length, 1, 'un archivo inválido no borra el historial');
});

test('el cronómetro se guarda por proceso, fuera del historial', async () => {
  const data = createTestAdapter();
  assert.equal(await data.getStopwatch('limpieza-semanal'), null);
  await data.saveStopwatch('limpieza-semanal', { accumulatedMs: 60000, startedAt: null });
  assert.deepEqual(await data.getStopwatch('limpieza-semanal'), { accumulatedMs: 60000, startedAt: null });
  assert.equal(await data.undoLastEvent(), null, 'guardar el cronómetro no crea eventos');
  await data.saveStopwatch('limpieza-semanal', null);
  assert.equal(await data.getStopwatch('limpieza-semanal'), null);
});
