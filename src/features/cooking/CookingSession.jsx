// La sesión de cocina de una receta: ingredientes, un paso a la vez y la confirmación final.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { finishProcess, toggleStep } from '../../data/index.js';
import { formatStopwatch } from '../../lib/time.js';
import UndoButton from '../../shared/components/UndoButton.jsx';
import { FOLLOW_UP_ROUTE_BY_PROCESS_ID } from '../../shared/constants.js';
import { text } from '../../shared/text.js';
import { useStopwatch } from '../../shared/useStopwatch.js';
import { useWakeLock } from '../../shared/useWakeLock.js';
import CookingStep from './CookingStep.jsx';
import FinishPanel from './FinishPanel.jsx';
import IngredientsPanel from './IngredientsPanel.jsx';
import TimerBar from './TimerBar.jsx';
import { useTimers } from './useTimers.js';
import './CookingSession.css';

/**
 * Decide dónde empieza la sesión. Si se cierra la app a la mitad, los pasos ya marcados se
 * conservan (son eventos), y al volver empieza en el primer paso que falta.
 *
 * @param {{steps: Array<{checked: boolean}>, ingredients?: object[]}} process - La receta.
 * @returns {{stage: string, stepIndex: number}} La pantalla inicial y el paso.
 */
function getStartingPoint(process) {
  const firstPending = process.steps.findIndex((step) => !step.checked);
  if (firstPending === -1) return { stage: 'finish', stepIndex: process.steps.length - 1 };
  const hasIngredients = (process.ingredients ?? []).length > 0;
  return { stage: firstPending === 0 && hasIngredients ? 'ingredients' : 'steps', stepIndex: firstPending };
}

/**
 * La sesión completa. Usa el mismo cronómetro y las mismas casillas de pasos que la pantalla
 * de la receta, así que lo que se avanza aquí también se ve allá.
 *
 * @param {object} props
 * @param {object} props.process - La receta, con cada paso marcado o no (de getProcess).
 * @param {() => Promise<void>} props.reload - Vuelve a leer la receta después de un cambio.
 * @returns {JSX.Element} La pantalla del modo de cocina.
 */
export default function CookingSession({ process, reload }) {
  const navigate = useNavigate();
  const stopwatch = useStopwatch(process.id);
  const canKeepScreenOn = useWakeLock();
  const timersApi = useTimers();
  const [start] = useState(() => getStartingPoint(process));
  const [stage, setStage] = useState(start.stage);
  const [stepIndex, setStepIndex] = useState(start.stepIndex);
  const [factor, setFactor] = useState(1);
  const total = process.steps.length;
  const hasIngredients = (process.ingredients ?? []).length > 0;

  /** Pasa de los ingredientes al primer paso y arranca el cronómetro si no estaba corriendo. */
  function beginSteps() {
    setStage('steps');
    if (!stopwatch.isRunning && stopwatch.elapsedMs === 0) stopwatch.start();
  }

  /** Avanza al siguiente paso, o a la confirmación final después del último. */
  function goNext() {
    if (stepIndex >= total - 1) {
      stopwatch.pause();
      setStage('finish');
    } else setStepIndex(stepIndex + 1);
  }

  /** Marca el paso actual (si no estaba marcado), se guarda al momento, y avanza. */
  async function handleDone() {
    if (!process.steps[stepIndex].checked) {
      await toggleStep(process.id, process.steps[stepIndex].id);
      await reload();
    }
    goNext();
  }

  /** Regresa un paso, o a los ingredientes si ya era el primero. */
  function handlePrevious() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
    else if (hasIngredients) setStage('ingredients');
  }

  /** Registra que se terminó, deja el cronómetro en cero y sale del modo de cocina. */
  async function handleFinish(minutes, doneBy) {
    await finishProcess(process.id, minutes, doneBy);
    stopwatch.reset();
    navigate(FOLLOW_UP_ROUTE_BY_PROCESS_ID[process.id] ?? '/');
  }

  return (
    <div className="cooking">
      <header className="cooking-header">
        <h2>{process.name}</h2>
        <div className="cooking-clock">
          <span className="cooking-clock-time" role="timer">{formatStopwatch(stopwatch.elapsedMs)}</span>
          <button type="button" className="button" onClick={stopwatch.isRunning ? stopwatch.pause : stopwatch.start}>
            {stopwatch.isRunning ? text.cooking.pause : text.cooking.resume}
          </button>
          <Link className="button" to={`/procesos/${process.id}`}>
            {text.cooking.exit}
          </Link>
        </div>
      </header>
      {!canKeepScreenOn && <p className="cooking-notice">{text.wakeLock.unsupported}</p>}
      <TimerBar {...timersApi} defaultLabel={text.cooking.stepLabel(stepIndex + 1)} onAdd={timersApi.addTimer} onRemove={timersApi.removeTimer} />
      {stage === 'ingredients' && (
        <>
          <IngredientsPanel ingredients={process.ingredients} factor={factor} onFactorChange={setFactor} />
          <button type="button" className="button button-primary cooking-begin" onClick={beginSteps}>
            {text.cooking.begin}
          </button>
        </>
      )}
      {stage === 'steps' && (
        <>
          {hasIngredients && (
            <details className="cooking-ingredients">
              <summary>{text.cooking.showIngredients}</summary>
              <IngredientsPanel ingredients={process.ingredients} factor={factor} onFactorChange={setFactor} />
            </details>
          )}
          <CookingStep step={process.steps[stepIndex]} index={stepIndex} total={total} onDone={handleDone} onSkip={goNext} onPrevious={handlePrevious} />
        </>
      )}
      {stage === 'finish' && <FinishPanel process={process} elapsedMs={stopwatch.elapsedMs} onConfirm={handleFinish} onBack={() => { setStage('steps'); setStepIndex(total - 1); }} />}
      <UndoButton onUndone={reload} />
    </div>
  );
}
