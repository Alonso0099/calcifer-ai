// Pruebas de la búsqueda: sin distinguir mayúsculas ni acentos, por nombre y por pasos.
import test from 'node:test';
import assert from 'node:assert/strict';
import { findMatchingStepText, normalizeText, processMatchesSearch } from '../src/lib/searchText.js';

const process = { name: 'Limpieza semanal', steps: [{ text: 'Backsplash: jabón suave y microfibra' }] };

test('normalizeText quita mayúsculas, acentos y espacios sobrantes', () => {
  assert.equal(normalizeText('  JABÓN Suave '), 'jabon suave');
  assert.equal(normalizeText('Albóndigas de Yayi'), 'albondigas de yayi');
});

test('encuentra por nombre y por texto de un paso', () => {
  assert.equal(processMatchesSearch(process, 'LIMPIEZA'), true);
  assert.equal(processMatchesSearch(process, 'jabon'), true);
  assert.equal(processMatchesSearch(process, 'pozole'), false);
});

test('una búsqueda vacía no coincide con nada', () => {
  assert.equal(processMatchesSearch(process, '   '), false);
});

test('findMatchingStepText regresa el paso que coincide solo si el nombre no coincide', () => {
  assert.equal(findMatchingStepText(process, 'JABON'), 'Backsplash: jabón suave y microfibra');
  assert.equal(findMatchingStepText(process, 'limpieza'), null);
  assert.equal(findMatchingStepText(process, ''), null);
});
