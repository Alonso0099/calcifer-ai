// El cronómetro en pantalla: el reloj y sus botones.
import { formatStopwatch } from '../../lib/time.js';
import { text } from '../../shared/text.js';
import './Stopwatch.css';

/**
 * Dibuja el cronómetro. La cuenta la lleva el hook useStopwatch, que vive en la
 * pantalla del proceso; este componente solo la muestra y avisa de los toques.
 *
 * @param {object} props
 * @param {{elapsedMs: number, isRunning: boolean, start: Function, pause: Function, reset: Function}} props.stopwatch
 *   Lo que regresa useStopwatch.
 * @returns {JSX.Element} El reloj y los botones Iniciar/Pausar y Reiniciar.
 */
export default function Stopwatch({ stopwatch }) {
  const { elapsedMs, isRunning, start, pause, reset } = stopwatch;
  const startLabel = elapsedMs > 0 ? text.stopwatch.resume : text.stopwatch.start;
  return (
    <section className="stopwatch">
      <h3>{text.stopwatch.title}</h3>
      {/* role="timer" indica a un lector de pantalla que este número es un reloj. */}
      <p className="stopwatch-clock" role="timer">
        {formatStopwatch(elapsedMs)}
      </p>
      <div className="stopwatch-buttons">
        {isRunning ? (
          <button type="button" className="button" onClick={pause}>
            {text.stopwatch.pause}
          </button>
        ) : (
          <button type="button" className="button button-primary" onClick={start}>
            {startLabel}
          </button>
        )}
        <button type="button" className="button" onClick={reset} disabled={elapsedMs === 0}>
          {text.stopwatch.reset}
        </button>
      </div>
    </section>
  );
}
