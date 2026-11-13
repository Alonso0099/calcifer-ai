// Hook del cronómetro: lleva la cuenta del tiempo mientras se hace un proceso.
import { useEffect, useState } from 'react';
import { getStopwatch, saveStopwatch } from '../../data/index.js';
import { getElapsedMs } from '../../lib/time.js';
import { MS_PER_SECOND } from '../../shared/constants.js';

const EMPTY_STOPWATCH = { accumulatedMs: 0, startedAt: null };

/**
 * Un cronómetro que se puede iniciar, pausar y reiniciar, y que no se pierde al
 * recargar la página: cada cambio se guarda en el dispositivo.
 * No suma de segundo en segundo: guarda la hora en que arrancó y calcula la
 * diferencia. Así no se atrasa si el navegador pausa la pestaña, y si la página
 * se recarga mientras corre, sigue contando desde la hora en que arrancó.
 *
 * @param {string} processId - El proceso al que pertenece el cronómetro.
 * @returns {{elapsedMs: number, isRunning: boolean, start: () => void, pause: () => void, reset: () => void}}
 *   El tiempo transcurrido, si está corriendo, y las tres acciones.
 */
export function useStopwatch(processId) {
  // accumulatedMs: lo sumado antes de la última pausa. startedAt: hora de arranque, o null en pausa.
  const [stopwatch, setStopwatch] = useState(EMPTY_STOPWATCH);
  const [now, setNow] = useState(() => Date.now());
  const isRunning = stopwatch.startedAt !== null;

  // Al abrir el proceso, recupera el cronómetro que se había guardado (si lo hay).
  // "isCurrent" evita usar una respuesta que llega tarde, cuando ya se cambió de proceso.
  useEffect(() => {
    let isCurrent = true;
    getStopwatch(processId).then((saved) => {
      if (!isCurrent) return;
      setNow(Date.now());
      setStopwatch(saved ?? EMPTY_STOPWATCH);
    });
    return () => {
      isCurrent = false;
    };
  }, [processId]);

  // Mientras corre, actualiza "now" cada segundo para que el reloj se vuelva a dibujar.
  // La función que regresa useEffect es la "limpieza": React la llama al pausar o al
  // salir de la pantalla, y ahí se apaga el intervalo para que no siga corriendo solo.
  useEffect(() => {
    if (!isRunning) return undefined;
    const intervalId = setInterval(() => setNow(Date.now()), MS_PER_SECOND);
    return () => clearInterval(intervalId);
  }, [isRunning]);

  /** Cambia el cronómetro en pantalla y lo guarda (null lo borra del dispositivo). */
  function update(nextStopwatch) {
    setNow(Date.now());
    setStopwatch(nextStopwatch ?? EMPTY_STOPWATCH);
    saveStopwatch(processId, nextStopwatch);
  }

  /** Arranca o continúa el cronómetro. */
  function start() {
    if (!isRunning) update({ ...stopwatch, startedAt: Date.now() });
  }

  /** Pausa y guarda lo que llevaba. */
  function pause() {
    if (isRunning) update({ accumulatedMs: getElapsedMs(stopwatch, Date.now()), startedAt: null });
  }

  /** Regresa el cronómetro a cero. */
  function reset() {
    update(null);
  }

  return { elapsedMs: getElapsedMs(stopwatch, now), isRunning, start, pause, reset };
}
