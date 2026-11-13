// Hook del cronómetro: lleva la cuenta del tiempo mientras se hace un proceso.
import { useEffect, useState } from 'react';
import { MS_PER_SECOND } from '../../shared/constants.js';

/**
 * Un cronómetro que se puede iniciar, pausar y reiniciar.
 * No suma de segundo en segundo: guarda la hora en que arrancó y calcula la
 * diferencia. Así no se atrasa si el navegador pausa la pestaña un momento.
 *
 * @returns {{elapsedMs: number, isRunning: boolean, start: () => void, pause: () => void, reset: () => void}}
 *   El tiempo transcurrido, si está corriendo, y las tres acciones.
 */
export function useStopwatch() {
  const [accumulatedMs, setAccumulatedMs] = useState(0); // lo sumado antes de la última pausa
  const [startedAt, setStartedAt] = useState(null); // hora en que arrancó, o null si está en pausa
  const [now, setNow] = useState(() => Date.now());
  const isRunning = startedAt !== null;

  // Mientras corre, actualiza "now" cada segundo para que el reloj se vuelva a dibujar.
  // La función que regresa useEffect es la "limpieza": React la llama al pausar o al
  // salir de la pantalla, y ahí se apaga el intervalo para que no siga corriendo solo.
  useEffect(() => {
    if (!isRunning) return undefined;
    const intervalId = setInterval(() => setNow(Date.now()), MS_PER_SECOND);
    return () => clearInterval(intervalId);
  }, [isRunning]);

  const elapsedMs = accumulatedMs + (isRunning ? Math.max(0, now - startedAt) : 0);

  /** Arranca o continúa el cronómetro. */
  function start() {
    const currentTime = Date.now();
    setNow(currentTime);
    setStartedAt(currentTime);
  }

  /** Pausa y guarda lo que llevaba. */
  function pause() {
    if (!isRunning) return;
    setAccumulatedMs(accumulatedMs + (Date.now() - startedAt));
    setStartedAt(null);
  }

  /** Regresa el cronómetro a cero. */
  function reset() {
    setAccumulatedMs(0);
    setStartedAt(null);
  }

  return { elapsedMs, isRunning, start, pause, reset };
}
