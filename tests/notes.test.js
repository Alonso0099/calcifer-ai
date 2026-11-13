// Pruebas de las notas: versión más reciente, borrado, deshacer y filtro por proceso.
import test from 'node:test';
import assert from 'node:assert/strict';
import { getCurrentNotes } from '../src/lib/notes.js';

const save = (id, noteId, title, processId = null) => ({ id, type: 'note_saved', noteId, processId, title, body: 'texto', createdAt: `2026-11-13T10:0${id}:00.000Z` });
const remove = (id, noteId) => ({ id, type: 'note_deleted', noteId, createdAt: '2026-11-13T11:00:00.000Z' });
const undo = (id, targetEventId) => ({ id, type: 'event_undone', targetEventId, createdAt: '2026-11-13T12:00:00.000Z' });

test('una nota se ve en su versión más reciente', () => {
  const notes = getCurrentNotes([save('1', 'a', 'Borrador'), save('2', 'a', 'Final')]);
  assert.equal(notes.length, 1);
  assert.equal(notes[0].title, 'Final');
  assert.equal(notes[0].updatedAt, '2026-11-13T10:02:00.000Z');
});

test('la nota editada más recientemente va primero', () => {
  const notes = getCurrentNotes([save('1', 'a', 'A'), save('2', 'b', 'B'), save('3', 'a', 'A editada')]);
  assert.deepEqual(notes.map((note) => note.id), ['a', 'b']);
});

test('una nota borrada desaparece y vuelve al deshacer el borrado', () => {
  const events = [save('1', 'a', 'A'), remove('2', 'a')];
  assert.equal(getCurrentNotes(events).length, 0);
  events.push(undo('3', '2'));
  assert.equal(getCurrentNotes(events)[0].title, 'A');
});

test('deshacer una edición regresa la versión anterior', () => {
  const events = [save('1', 'a', 'Original'), save('2', 'a', 'Editada'), undo('3', '2')];
  assert.equal(getCurrentNotes(events)[0].title, 'Original');
});

test('con processId solo regresa las notas ligadas a ese proceso', () => {
  const events = [save('1', 'a', 'Suelta'), save('2', 'b', 'Del pozole', 'pozole-rojo')];
  assert.deepEqual(getCurrentNotes(events, 'pozole-rojo').map((note) => note.id), ['b']);
  assert.equal(getCurrentNotes(events).length, 2);
});
