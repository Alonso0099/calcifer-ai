// Pruebas de los ajustes del dispositivo (tema, letra, sonido, movimiento).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createSettingsFunctions } from '../src/data/adapters/settingsStore.js';
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '../src/shared/constants.js';

/** Un almacenamiento en memoria que se comporta como localStorage. */
function createMemoryStorage() {
  const items = new Map();
  return { getItem: (key) => (items.has(key) ? items.get(key) : null), setItem: (key, value) => items.set(key, value) };
}

test('sin nada guardado, los ajustes son los predeterminados: tema oscuro', async () => {
  const { getSettings } = createSettingsFunctions(createMemoryStorage());
  assert.deepEqual(await getSettings(), DEFAULT_SETTINGS);
  assert.equal((await getSettings()).theme, 'dark');
});

test('lo guardado se lee de vuelta, y un ajuste que falta toma su valor predeterminado', async () => {
  const storage = createMemoryStorage();
  const { getSettings, saveSettings } = createSettingsFunctions(storage);
  await saveSettings({ ...DEFAULT_SETTINGS, theme: 'light', timerSound: false });
  assert.equal((await getSettings()).theme, 'light');
  assert.equal((await getSettings()).timerSound, false);
  storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ textSize: 'large' }));
  assert.deepEqual(await getSettings(), { ...DEFAULT_SETTINGS, textSize: 'large' });
});
