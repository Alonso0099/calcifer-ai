// Pantalla de un proceso: sus datos, el checklist, el cronómetro y el registro al terminar.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { finishProcess, getLastDone, getProcess, toggleStep } from '../../data/index.js';
import { getMinutesFromElapsed } from '../../lib/time.js';
import UndoButton from '../../shared/components/UndoButton.jsx';
import { text } from '../../shared/text.js';
import { useLoadedData } from '../../shared/useLoadedData.js';
import FinishForm from './FinishForm.jsx';
import ProcessSummary from './ProcessSummary.jsx';
import StepChecklist from './StepChecklist.jsx';
import Stopwatch from './Stopwatch.jsx';
import TextList from './TextList.jsx';
import { useStopwatch } from './useStopwatch.js';
import { useWakeLock } from './useWakeLock.js';
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
  // Se piden juntos el proceso y su última vez; reload los vuelve a pedir tras cada cambio.
  const { data, isLoading, hasError, reload } = useLoadedData(
    async () => ({ process: await getProcess(processId), lastDoneIso: await getLastDone(processId) }),
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
    setIsFinishing(true);
  }

  /** Guarda el registro, deja el cronómetro en cero y el checklist limpio para la próxima vez. */
  async function handleConfirmFinish(minutes, doneBy) {
    await finishProcess(processId, minutes, doneBy);
    stopwatch.reset();
    setIsFinishing(false);
    setSavedMessage(text.finish.saved(minutes));
    await reload();
  }

  if (isLoading) return <p>{text.common.loading}</p>;
  if (hasError) return <p>{text.common.loadError}</p>;
  const backLink = (
    <Link className="process-detail-back" to="/">
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

  const { process, lastDoneIso } = data;
  return (
    <article className="process-detail">
      {backLink}
      <ProcessSummary process={process} lastDoneIso={lastDoneIso} />
      <p className="process-detail-notice">{canKeepScreenOn ? text.wakeLock.active : text.wakeLock.unsupported}</p>
      <TextList title={text.processDetail.ingredients} items={process.ingredients} />
      <TextList title={text.processDetail.notes} items={process.notes} />
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
      </p>
      <UndoButton onUndone={reload} />
    </article>
  );
}
