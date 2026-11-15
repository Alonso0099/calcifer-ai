// Pantalla de ajustes: colores, tamaño de letra, sonido de los temporizadores, movimiento
// de los botones y el acceso al respaldo. Los ajustes son de este dispositivo, no del historial.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSettings, saveSettings } from '../../data/index.js';
import { playTestSound, unlockAlertSound } from '../../shared/beep.js';
import { TEXT_SIZE_OPTIONS, THEME_OPTIONS } from '../../shared/constants.js';
import { applySettings } from '../../shared/deviceSettings.js';
import { text } from '../../shared/text.js';
import OptionGroup from './OptionGroup.jsx';
import './SettingsPage.css';

const ON_OFF_OPTIONS = [true, false];

/**
 * Dice "Encendido" o "Apagado".
 *
 * @param {boolean} isOn - El valor del ajuste.
 * @returns {string} El texto para el botón.
 */
function getOnOffName(isOn) {
  return isOn ? text.settings.on : text.settings.off;
}

/**
 * La pantalla de ajustes. Cada cambio se aplica y se guarda al momento: no hay botón "Guardar".
 *
 * @returns {JSX.Element} Las secciones de ajustes.
 */
export default function SettingsPage() {
  // useState guarda un dato que, al cambiar, hace que React vuelva a dibujar la pantalla.
  const [settings, setSettings] = useState(null);

  // useEffect corre después de dibujar; con [] corre una sola vez, al abrir la pantalla.
  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  if (!settings) return <p>{text.common.loading}</p>;

  /**
   * Cambia un ajuste: lo pinta en la página, lo guarda y actualiza la pantalla.
   *
   * @param {string} name - El nombre del ajuste ('theme', 'textSize', 'timerSound' o 'motion').
   * @param {string|boolean} value - El valor nuevo.
   */
  function change(name, value) {
    const nextSettings = { ...settings, [name]: value };
    applySettings(nextSettings);
    saveSettings(nextSettings);
    setSettings(nextSettings);
  }

  /** Al encender el sonido se aprovecha el toque para dejarlo listo (Safari lo pide). */
  function changeSound(isOn) {
    if (isOn) unlockAlertSound();
    change('timerSound', isOn);
  }

  return (
    <>
      <h2 className="settings-title">{text.settings.title}</h2>
      <p className="settings-intro">{text.settings.intro}</p>

      <section className="card settings-section">
        <h3>{text.settings.themeTitle}</h3>
        <OptionGroup label={text.settings.themeTitle} options={THEME_OPTIONS} value={settings.theme} getName={(option) => text.settings.themeNames[option]} onChange={(option) => change('theme', option)} />
        <p className="settings-help">{text.settings.themeHelp}</p>
      </section>

      <section className="card settings-section">
        <h3>{text.settings.textSizeTitle}</h3>
        <OptionGroup label={text.settings.textSizeTitle} options={TEXT_SIZE_OPTIONS} value={settings.textSize} getName={(option) => text.settings.textSizeNames[option]} onChange={(option) => change('textSize', option)} />
      </section>

      <section className="card settings-section">
        <h3>{text.settings.soundTitle}</h3>
        <OptionGroup label={text.settings.soundTitle} options={ON_OFF_OPTIONS} value={settings.timerSound} getName={getOnOffName} onChange={changeSound} />
        <button type="button" className="button settings-test" onClick={playTestSound}>
          {text.cooking.testSound}
        </button>
        <p className="settings-help">{text.cooking.soundHelp}</p>
      </section>

      <section className="card settings-section">
        <h3>{text.settings.movementTitle}</h3>
        <OptionGroup label={text.settings.movementTitle} options={ON_OFF_OPTIONS} value={settings.motion} getName={getOnOffName} onChange={(option) => change('motion', option)} />
        <p className="settings-help">{text.settings.movementHelp}</p>
      </section>

      <section className="card settings-section">
        <h3>{text.settings.backupTitle}</h3>
        <p className="settings-help">{text.settings.backupHelp}</p>
        {/* Link cambia de pantalla sin recargar la página, igual que el menú. */}
        <Link className="button" to="/respaldo">
          {text.settings.backupLink}
        </Link>
      </section>
    </>
  );
}
