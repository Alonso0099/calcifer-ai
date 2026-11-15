// Hook que mantiene la pantalla encendida mientras un proceso está abierto (Wake Lock API).
import { useEffect } from 'react';

/**
 * Pide al dispositivo que no apague la pantalla mientras el componente está visible.
 * El dispositivo suelta ese permiso solo cuando se cambia de app o de pestaña; por
 * eso se vuelve a pedir cada vez que la página regresa a estar visible.
 *
 * @returns {boolean} true si el dispositivo soporta mantener la pantalla encendida.
 */
export function useWakeLock() {
  const isSupported = 'wakeLock' in navigator;

  useEffect(() => {
    if (!isSupported) return undefined;
    // El "candado" activo se guarda para poder soltarlo al salir de la pantalla.
    let currentLock = null;
    let isLeaving = false;

    /** Pide el candado de pantalla. Puede fallar (por ejemplo, con batería baja); no es grave. */
    async function requestLock() {
      try {
        const lock = await navigator.wakeLock.request('screen');
        // Si la pantalla se cerró mientras llegaba la respuesta, se suelta de inmediato.
        if (isLeaving) lock.release();
        else currentLock = lock;
      } catch {
        currentLock = null;
      }
    }

    /** Al volver a la app, el candado anterior ya no sirve: se pide otro. */
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') requestLock();
    }

    requestLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      isLeaving = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (currentLock) currentLock.release();
    };
  }, [isSupported]);

  return isSupported;
}
