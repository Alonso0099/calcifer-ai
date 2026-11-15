// Pantalla de un proceso: sus datos, el checklist, el cronómetro y el registro al terminar.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { finishProcess, getLastDone, getNotes, toggleStep } from '../../data/index.js';
import { getStepByStepKind } from '../../lib/stepByStep.js';
import { getMinutesFromElapsed } from '../../lib/time.js';
import { FOLLOW_UP_ROUTE_BY_PROCESS_ID, STEP_BY_STEP_PATH } from '../../shared/constants.js';
import FinishForm from '../../shared/components/FinishForm.jsx';
import LinkedNotes from '../../shared/components/LinkedNotes.jsx';
import Stopwatch from '../../shared/components/Stopwatch.jsx';
import UndoButton from '../../shared/components/UndoButton.jsx';
import { text } from '../../shared/text.js';
import { loadProcessForToday } from '../../shared/loadProcessForToday.js';
import { useLoadedData } from '../../shared/useLoadedData.js';
import { useStopwatch } from '../../shared/useStopwatch.js';
import { useWakeLock } from '../../shared/useWakeLock.js';
import ProcessSummary from './ProcessSummary.jsx';
import StepChecklist from './StepChecklist.jsx';
import TextList from './TextList.jsx';
import './ProcessDetailPage.css';

/**
 * El detalle de un proceso. Mientras está abierta, pide al dispositivo que no
 * apague la pantalla, porque se usa con las manos ocupadas.
 *
 * @returns {JSX.Element} La pantalla completa del proceso.
 */
export default function ProcessDetailPage() {
  // useParams lee la parte variable de la dirección: en /procesos/pozole-rojo, processId es "pozole-rojo".
  const { processId } = useParams();
  const stopwatch = useStopwatch(processId);
  const canKeepScreenOn = useWakeLock();
  const [isFinishing, setIsFinishing] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [followUpRoute, setFollowUpRoute] = useState(null);
  // Se piden juntos el proceso, su última vez y sus notas; reload los vuelve a pedir tras cada cambio.
  const { data, isLoading, hasError, reload } = useLoadedData(
    async () => ({
      // Solo los pasos que tocan hoy (empacar almuerzo no aparece viernes ni sábado).
      process: (await loadProcessForToday(processId)).process,
      lastDoneIso: await getLastDone(processId),
      notes: await getNotes(processId),
    }),
    [processId],
  );

  /** Marca o desmarca un paso. Se guarda al momento y se vuelve a leer el proceso. */
  async function handleToggle(stepId) {
    await toggleStep(processId, stepId);
    await reload();
  }

  /** Abre el formulario de terminar; el cronómetro se pausa para que los minutos no cambien. */
  function handleOpenFinish() {
    stopwatch.pause();
    setSavedMessage('');
    setFollowUpRoute(null);
    setIsFinishing(true);
  }

  /** Guarda el registro, deja el cronómetro en cero y el checklist limpio para la próxima vez. */
  async function handleConfirmFinish(minutes, doneBy) {
    await finishProcess(processId, minutes, doneBy);
    stopwatch.reset();
    setIsFinishing(false);
    setSavedMessage(text.finish.saved(minutes));
    // Algunos procesos tienen un siguiente paso en otra pantalla (la preparación de carnes, el congelador).
    setFollowUpRoute(FOLLOW_UP_ROUTE_BY_PROCESS_ID[processId] ?? null);
    await reload();
  }

  if (isLoading) return <p>{text.common.loading}</p>;
  if (hasError) return <p>{text.common.loadError}</p>;
  const backLink = (
    <Link className="process-detail-back" to="/procesos">
      ← {text.common.back}
    </Link>
  );
  if (!data.process) {
    return (
      <>
        {backLink}
        <p>{text.processDetail.notFound}</p>
      </>
    );
  }

  const { process, lastDoneIso, notes } = data;
  return (
    <article className="process-detail">
      {backLink}
      <ProcessSummary process={process} lastDoneIso={lastDoneIso} />
      <p className="process-detail-notice">{canKeepScreenOn ? text.wakeLock.active : text.wakeLock.unsupported}</p>
      <TextList title={text.processDetail.ingredients} items={process.ingredients?.map((ingredient) => ingredient.text)} />
      <TextList title={text.processDetail.notes} items={process.notes} />
      {process.steps.length > 0 && (
        <Link className="button button-primary process-detail-cook" to={`${STEP_BY_STEP_PATH}/${processId}`}>
          {text.cooking.stepByStep[getStepByStepKind(process)]}
        </Link>
      )}
      <StepChecklist steps={process.steps} onToggle={handleToggle} />
      <Stopwatch stopwatch={stopwatch} />
      {isFinishing ? (
        <FinishForm
          initialMinutes={getMinutesFromElapsed(stopwatch.elapsedMs)}
          onConfirm={handleConfirmFinish}
          onCancel={() => setIsFinishing(false)}
        />
      ) : (
        <button type="button" className="button button-primary process-detail-finish" onClick={handleOpenFinish}>
          {text.finish.open}
        </button>
      )}
      <p className="process-detail-saved" role="status">
        {savedMessage}
        {followUpRoute && (
          <>
            {' '}
            <Link to={followUpRoute}>{text.finish.followUpFreezer}</Link>
          </>
        )}
      </p>
      <UndoButton scope={{ processId }} onUndone={reload} />
      <LinkedNotes processId={processId} notes={notes} />
    </article>
  );
}
