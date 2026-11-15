// Hook de los temporizadores del modo de cocina: varios a la vez, guardados en el dispositivo.
import { useEffect, useRef, useState } from 'react';
import { getTimers, saveTimers } from '../../data/index.js';
import { createTimer, isTimerDone, sortTimers } from '../../lib/timers.js';
import { alertTimerDone } from '../../shared/beep.js';
import { MAX_TIMERS, MS_PER_SECOND } from '../../shared/constants.js';

/**
 * Lleva la cuenta de los temporizadores. Cada uno guarda la hora en que termina, así que
 * siguen bien aunque se recargue la página. Al terminar uno suena un pitido una sola vez;
 * lo que ya había terminado antes de abrir la pantalla no vuelve a sonar.
 *
 * @returns {{timers: object[], now: number, addTimer: Function, removeTimer: Function, isFull: boolean}}
 *   Los temporizadores (el que termina antes, primero), la hora actual y las acciones.
 */
export function useTimers() {
  const [timers, setTimers] = useState([]);
  const [now, setNow] = useState(() => Date.now());
  // useRef guarda un valor que sobrevive a los dibujados sin provocar uno nuevo al cambiar.
  const alertedIds = useRef(new Set());

  // Al abrir la pantalla, recupera los temporizadores guardados.
  useEffect(() => {
    getTimers().then((saved) => {
      const loadedAt = Date.now();
      for (const timer of saved) if (isTimerDone(timer, loadedAt)) alertedIds.current.add(timer.id);
      setNow(loadedAt);
      setTimers(saved);
    });
  }, []);

  // Mientras haya temporizadores, actualiza la hora cada segundo para que la cuenta se mueva.
  useEffect(() => {
    if (timers.length === 0) return undefined;
    const intervalId = setInterval(() => setNow(Date.now()), MS_PER_SECOND);
    return () => clearInterval(intervalId);
  }, [timers.length]);

  // Cuando un temporizador termina, avisa una sola vez.
  useEffect(() => {
    for (const timer of timers) {
      if (isTimerDone(timer, now) && !alertedIds.current.has(timer.id)) {
        alertedIds.current.add(timer.id);
        alertTimerDone();
      }
    }
  }, [timers, now]);

  /** Cambia la lista en pantalla y la guarda en el dispositivo. */
  function update(nextTimers) {
    setTimers(nextTimers);
    saveTimers(nextTimers);
  }

  /** Pone un temporizador nuevo de cierta cantidad de minutos. */
  function addTimer(label, minutes) {
    if (timers.length >= MAX_TIMERS) return;
    update([...timers, createTimer(crypto.randomUUID(), label, minutes, Date.now())]);
  }

  /** Quita un temporizador (terminado o no). */
  function removeTimer(timerId) {
    update(timers.filter((timer) => timer.id !== timerId));
  }

  return { timers: sortTimers(timers), now, addTimer, removeTimer, isFull: timers.length >= MAX_TIMERS };
}
