// Los temporizadores del modo de cocina: los que están corriendo y botones para poner uno nuevo.
import { useState } from 'react';
import { formatStopwatch } from '../../lib/time.js';
import { getRemainingMs, isTimerDone } from '../../lib/timers.js';
import { playTestSound, unlockAlertSound } from '../../shared/beep.js';
import { TIMER_PRESET_MINUTES } from '../../shared/constants.js';
import { text } from '../../shared/text.js';
import './TimerBar.css';

/**
 * Muestra la cuenta regresiva de cada temporizador y deja poner uno nuevo con un toque
 * (5, 10, 15 o 30 minutos) o con los minutos que se quiera. Cuando uno termina, avisa por
 * escrito que se revise la comida: un temporizador no confirma que algo esté cocido.
 *
 * @param {object} props
 * @param {object[]} props.timers - Los temporizadores (de useTimers).
 * @param {number} props.now - La hora actual, en milisegundos.
 * @param {string} props.defaultLabel - A qué se refiere un temporizador nuevo ("Paso 3").
 * @param {boolean} props.isFull - Si ya no caben más temporizadores.
 * @param {(label: string, minutes: number) => void} props.onAdd - Pone un temporizador.
 * @param {(timerId: string) => void} props.onRemove - Quita un temporizador.
 * @returns {JSX.Element} La franja de temporizadores.
 */
export default function TimerBar({ timers, now, defaultLabel, isFull, onAdd, onRemove }) {
  const [customMinutes, setCustomMinutes] = useState('');

  /** Pone un temporizador. Como es un toque, aprovecha para dejar listo el sonido del aviso. */
  function addTimer(minutes) {
    unlockAlertSound();
    onAdd(defaultLabel, minutes);
  }

  /** Pone un temporizador con los minutos escritos y vacía el campo. */
  function handleCustom(event) {
    event.preventDefault();
    const minutes = Number(customMinutes);
    if (minutes > 0) addTimer(minutes);
    setCustomMinutes('');
  }

  return (
    <section className="timer-bar" aria-label={text.cooking.timersTitle}>
      <ul className="timer-list">
        {timers.map((timer) => {
          const isDone = isTimerDone(timer, now);
          return (
            <li key={timer.id} className={isDone ? 'card timer timer-done' : 'card timer'}>
              <span className="timer-label">{timer.label}</span>
              <span className="timer-clock">{isDone ? text.cooking.timerDone : formatStopwatch(getRemainingMs(timer, now))}</span>
              <button type="button" className="button timer-remove" onClick={() => onRemove(timer.id)}>
                {text.cooking.timerRemove}
              </button>
              {/* role="alert" hace que un lector de pantalla lo anuncie en cuanto aparece. */}
              {isDone && <span className="timer-check" role="alert">{text.cooking.timerCheck}</span>}
            </li>
          );
        })}
      </ul>
      <div className="timer-add">
        <span className="timer-add-title">{text.cooking.timerAdd(defaultLabel)}</span>
        {TIMER_PRESET_MINUTES.map((minutes) => (
          <button key={minutes} type="button" className="button" disabled={isFull} onClick={() => addTimer(minutes)}>
            {text.cooking.minutes(minutes)}
          </button>
        ))}
        <form className="timer-custom" onSubmit={handleCustom}>
          <input className="field" type="number" inputMode="numeric" min="1" step="1" aria-label={text.cooking.customMinutes} placeholder={text.cooking.customMinutes} value={customMinutes} onChange={(event) => setCustomMinutes(event.target.value)} />
          <button type="submit" className="button" disabled={isFull}>
            {text.cooking.timerStart}
          </button>
        </form>
        <button type="button" className="button" onClick={playTestSound}>
          {text.cooking.testSound}
        </button>
      </div>
      <p className="timer-help">{text.cooking.soundHelp}</p>
    </section>
  );
}
