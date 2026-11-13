// Un "hook" compartido para pedir datos a la capa de datos y saber si ya llegaron.
import { useCallback, useEffect, useState } from 'react';

/**
 * Pide datos con una función asíncrona y avisa cuando llegan.
 *
 * Un hook es una función que empieza con "use" y le da memoria a un componente.
 * Aquí se usan tres:
 * - useState guarda un valor entre un dibujado y otro; al cambiarlo, React vuelve a dibujar.
 * - useEffect corre código después de dibujar; aquí, pedir los datos.
 * - useCallback guarda una función para no crear una nueva en cada dibujado.
 *
 * @param {() => Promise<any>} loadData - La función que pide los datos (por ejemplo, getProcesses).
 * @param {any[]} dependencies - Valores de los que depende la petición; si cambian, se pide de nuevo.
 * @returns {{data: any, isLoading: boolean, hasError: boolean, reload: () => Promise<void>}}
 *   Los datos (null mientras llegan), si está cargando, si falló, y una función para volver a pedir.
 */
export function useLoadedData(loadData, dependencies) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // La lista de dependencias la da quien usa el hook, por eso no se escribe aquí a mano.
  const reload = useCallback(async () => {
    try {
      setData(await loadData());
      setHasError(false);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, dependencies);

  // Pide los datos al mostrar el componente y cada vez que cambian las dependencias.
  useEffect(() => {
    reload();
  }, [reload]);

  return { data, isLoading, hasError, reload };
}
