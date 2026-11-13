// Las notas ligadas a un proceso, para mostrarlas dentro del detalle de ese proceso.
import { Link } from 'react-router-dom';
import { text } from '../text.js';
import NoteSheet from './NoteSheet.jsx';
import './LinkedNotes.css';

/**
 * Lista las notas de un proceso y ofrece agregar otra. Vive en shared porque la usa
 * la pantalla de procesos, que no puede importar archivos de features/notes/.
 *
 * @param {object} props
 * @param {string} props.processId - El proceso al que pertenecen las notas.
 * @param {object[]} props.notes - Las notas ligadas, como las regresa getNotes(processId).
 * @returns {JSX.Element} El título, las hojas de las notas y el enlace para agregar una.
 */
export default function LinkedNotes({ processId, notes }) {
  return (
    <section className="linked-notes">
      <h3>{text.notes.linkedTitle}</h3>
      {notes.length === 0 && <p className="linked-notes-empty">{text.notes.linkedEmpty}</p>}
      {notes.map((note) => (
        <NoteSheet key={note.id} note={note} />
      ))}
      {/* La dirección lleva el id del proceso para que la nota nueva ya venga ligada a él. */}
      <Link className="button linked-notes-add" to={`/notas/nueva?proceso=${processId}`}>
        {text.notes.addToProcess}
      </Link>
    </section>
  );
}
