// Una nota ya escrita, mostrada como hoja de papel (solo lectura), con enlace para editarla.
// Es compartida para que un proceso pueda mostrar sus notas sin importar nada de features/notes/.
import { Link } from 'react-router-dom';
import { formatHouseDate } from '../../lib/dates.js';
import { text } from '../text.js';
import NotePaper from './NotePaper.jsx';
import './NoteSheet.css';

/**
 * Muestra una nota: título, fecha del último cambio y texto sobre los renglones.
 *
 * @param {object} props
 * @param {{id: string, title: string, body: string, updatedAt: string}} props.note - La nota, como la regresa getNotes.
 * @returns {JSX.Element} La hoja con la nota.
 */
export default function NoteSheet({ note }) {
  return (
    <NotePaper>
      <h4 className="note-paper-title">{note.title || text.notes.untitled}</h4>
      <p className="note-paper-lines">{note.body}</p>
      <p className="note-sheet-footer">
        <span>{text.notes.updated(formatHouseDate(note.updatedAt))}</span>
        <Link className="note-sheet-edit" to={`/notas/${note.id}`}>
          {text.notes.edit}
        </Link>
      </p>
    </NotePaper>
  );
}
