// Pantalla de limpieza y mantenimiento: una tarjeta por zona con sus tareas y su vencimiento.
import { getLastDone, getProcesses, getZones } from '../../data/index.js';
import { buildZoneBoards } from '../../lib/maintenance.js';
import { MAINTENANCE_CATEGORIES } from '../../shared/constants.js';
import { text } from '../../shared/text.js';
import { useLoadedData } from '../../shared/useLoadedData.js';
import ZoneCard from './ZoneCard.jsx';
import './MaintenancePage.css';

/**
 * Pide a la capa de datos todo lo que la pantalla necesita y lo arma por zonas.
 * El vencimiento no se guarda en ningún lado: se calcula aquí, cada vez, con la
 * última vez de cada tarea y su frecuencia.
 *
 * @returns {Promise<object[]>} Las zonas con sus tareas, listas para dibujar.
 */
async function loadZoneBoards() {
  const [zones, processes] = await Promise.all([getZones(), getProcesses()]);
  const tasks = processes.filter((process) => MAINTENANCE_CATEGORIES.includes(process.category));
  // Promise.all espera varias peticiones a la vez: aquí, la última vez de cada tarea.
  const lastDoneDates = await Promise.all(tasks.map((process) => getLastDone(process.id)));
  const lastDoneByProcessId = {};
  tasks.forEach((process, index) => {
    lastDoneByProcessId[process.id] = lastDoneDates[index];
  });
  return buildZoneBoards(zones, processes, lastDoneByProcessId, new Date());
}

/**
 * La pantalla de limpieza y mantenimiento.
 *
 * @returns {JSX.Element} Una tarjeta por zona, de la más atrasada a la que está al día.
 */
export default function MaintenancePage() {
  const { data: boards, isLoading, hasError } = useLoadedData(loadZoneBoards, []);

  if (isLoading) return <p>{text.common.loading}</p>;
  if (hasError) return <p>{text.common.loadError}</p>;
  return (
    <>
      <h2 className="maintenance-title">{text.maintenance.title}</h2>
      <p className="maintenance-intro">{text.maintenance.intro}</p>
      <div className="maintenance-zones">
        {boards.map((board) => (
          <ZoneCard key={board.zone.id} board={board} />
        ))}
      </div>
    </>
  );
}
