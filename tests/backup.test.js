// Pruebas del respaldo: lo que se exporta se puede volver a leer, y lo ajeno se rechaza.
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBackup, parseBackup } from '../src/lib/backup.js';
import { BACKUP_ERRORS } from '../src/shared/constants.js';

const events = [{ id: '1', type: 'note_saved', noteId: 'a', processId: null, title: 'T', body: 'B', createdAt: '2026-11-13T10:00:00.000Z' }];

test('un respaldo exportado se lee de vuelta igual', () => {
  assert.deepEqual(parseBackup(buildBackup(events, '2026-11-13T12:00:00.000Z')), events);
});

test('rechaza archivos que no son un respaldo de la app', () => {
  assert.throws(() => parseBackup('esto no es json'), { message: BACKUP_ERRORS.notJson });
  assert.throws(() => parseBackup('null'), { message: BACKUP_ERRORS.wrongApp });
  assert.throws(() => parseBackup('{"app":"otra","events":[]}'), { message: BACKUP_ERRORS.wrongApp });
  assert.throws(() => parseBackup('{"app":"calcifer","schemaVersion":99,"events":[]}'), { message: BACKUP_ERRORS.unknownVersion });
  assert.throws(() => parseBackup('{"app":"calcifer","schemaVersion":1}'), { message: BACKUP_ERRORS.invalidEvents });
  assert.throws(() => parseBackup('{"app":"calcifer","schemaVersion":1,"events":[{"type":"raro"}]}'), { message: BACKUP_ERRORS.invalidEvents });
});
