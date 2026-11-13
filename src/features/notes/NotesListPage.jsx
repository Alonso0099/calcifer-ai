// Pantalla de notas: la lista de todas las notas, la más reciente primero.
import { Link, useLocation } from 'react-router-dom';
import { getNotes, getProcesses } from '../../data/index.js';
import UndoButton from '../../shared/components/UndoButton.jsx';
import { text } from '../../shared/text.js';
import { useLoadedData } from '../../shared/useLoadedData.js';
import NoteCard from './NoteCard.jsx';
import './NotesListPage.css';

/**
 * Pide las notas y los nombres de los procesos, para decir a cuál está ligada cada nota.
 *
 * @returns {Promise<{notes: object[], processNamesById: Record<string, string>}>}
 */
async function loadNotes() {
  const [notes, processes] = await Promise.all([getNotes(), getProcesses()]);
  const processNamesById = {};
  for (const process of processes) processNamesById[process.id] = process.name;
  return { notes, processNamesById };
}

/**
 * La lista de notas. Aquí vive el botón Deshacer de las notas: después de borrar
 * una, la app regresa a esta pantalla y desde aquí se puede recuperar.
 *
 * @returns {JSX.Element} El botón de nota nueva, las tarjetas y Deshacer.
 */
export default function NotesListPage() {
  const { data, isLoading, hasError, reload } = useLoadedData(loadNotes, []);
  // useLocation da la dirección actual y el "state": un dato que la pantalla anterior
  // puede mandar al navegar. Aquí, el aviso de que se acaba de borrar una nota.
  const location = useLocation();

  if (isLoading) return <p>{text.common.loading}</p>;
  if (hasError) return <p>{text.common.loadError}</p>;
  return (
    <>
      <h2 className="notes-title">{text.notes.title}</h2>
      <Link className="button button-primary notes-new" to="/notas/nueva">
        {text.notes.create}
      </Link>
      {location.state?.noteDeleted && (
        <p className="notes-deleted" role="status">
          {text.notes.deleted}
        </p>
      )}
      {data.notes.length === 0 && <p>{text.notes.empty}</p>}
      <ul className="notes-list">
        {data.notes.map((note) => (
          <li key={note.id}>
            <NoteCard note={note} processName={data.processNamesById[note.processId] ?? null} />
          </li>
        ))}
      </ul>
      <UndoButton onUndone={reload} />
    </>
  );
}
