// La tarjeta "En curso" de Hoy: lo que se empezó y no se terminó, para no perderlo.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { discardProgress, saveStopwatch } from '../../data/index.js';
import { getElapsedMs, formatStopwatch } from '../../lib/time.js';
import { getRemainingMs } from '../../lib/timers.js';
import { MS_PER_SECOND, STEP_BY_STEP_PATH } from '../../shared/constants.js';
import { text } from '../../shared/text.js';
import './InProgressCard.css';

/**
 * Muestra cada proceso empezado: su avance, su cronómetro (con Pausar o Seguir) y sus
 * temporizadores. "Continuar" abre el paso a paso donde se quedó; "Descartar" pide confirmación.
 *
 * @param {object} props
 * @param {object[]} props.sessions - Lo que está en curso (de getInProgress).
 * @param {() => Promise<void>} props.onChange - Vuelve a leer Hoy después de un cambio.
 * @returns {JSX.Element|null} La tarjeta, o null si no hay nada en curso.
 */
export default function InProgressCard({ sessions, onChange }) {
  const [now, setNow] = useState(() => Date.now());
  const [confirmingId, setConfirmingId] = useState(null);
  const needsTicking = sessions.some((session) => session.isRunning || session.timers.length > 0);

  // Mientras algo corre, la hora se actualiza cada segundo para que los relojes se muevan.
  useEffect(() => {
    if (!needsTicking) return undefined;
    const intervalId = setInterval(() => setNow(Date.now()), MS_PER_SECOND);
    return () => clearInterval(intervalId);
  }, [needsTicking]);

  if (sessions.length === 0) return null;

  /** Pausa el cronómetro si corre, o lo vuelve a arrancar si estaba en pausa. */
  async function togglePause(session) {
    const elapsedMs = getElapsedMs(session.stopwatch, Date.now());
    await saveStopwatch(session.processId, { accumulatedMs: elapsedMs, startedAt: session.isRunning ? null : Date.now() });
    await onChange();
  }

  /** Descarta lo empezado (ya confirmado) y vuelve a leer Hoy. */
  async function discard(processId) {
    await discardProgress(processId);
    setConfirmingId(null);
    await onChange();
  }

  return (
    <section className="card today-card in-progress">
      <h3>{text.inProgress.title}</h3>
      <ul className="in-progress-list">
        {sessions.map((session) => {
          const continueTo = session.totalSteps > 0 ? `${STEP_BY_STEP_PATH}/${session.processId}` : `/procesos/${session.processId}`;
          return (
            <li key={session.processId} className="in-progress-item">
              <p className="in-progress-name">{session.name}</p>
              <p className="in-progress-details">
                {session.totalSteps > 0 && text.inProgress.steps(session.checkedCount, session.totalSteps)}
                {session.stopwatch && ` · ${formatStopwatch(getElapsedMs(session.stopwatch, now))} · ${session.isRunning ? text.inProgress.running : text.inProgress.paused}`}
              </p>
              {session.timers.map((timer) => (
                <p key={timer.id} className={getRemainingMs(timer, now) === 0 ? 'in-progress-timer in-progress-timer-done' : 'in-progress-timer'}>
                  {text.inProgress.timer(timer.label, getRemainingMs(timer, now) === 0 ? text.cooking.timerDone : formatStopwatch(getRemainingMs(timer, now)))}
                </p>
              ))}
              {confirmingId === session.processId ? (
                <div className="in-progress-confirm" role="alertdialog" aria-label={text.inProgress.confirmTitle}>
                  <p>{text.inProgress.confirmBody}</p>
                  <div className="in-progress-buttons">
                    <button type="button" className="button button-primary" onClick={() => discard(session.processId)}>{text.inProgress.confirmYes}</button>
                    <button type="button" className="button" onClick={() => setConfirmingId(null)}>{text.inProgress.confirmNo}</button>
                  </div>
                </div>
              ) : (
                <div className="in-progress-buttons">
                  <Link className="button button-primary" to={continueTo}>{text.inProgress.continue}</Link>
                  {session.stopwatch && (
                    <button type="button" className="button" onClick={() => togglePause(session)}>
                      {session.isRunning ? text.inProgress.pause : text.inProgress.resume}
                    </button>
                  )}
                  <button type="button" className="button" onClick={() => setConfirmingId(session.processId)}>{text.inProgress.discard}</button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
