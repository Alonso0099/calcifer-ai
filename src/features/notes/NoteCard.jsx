// La tarjeta de una nota en la lista: título, inicio del texto, fecha y proceso ligado.
import { Link } from 'react-router-dom';
import { formatHouseDate } from '../../lib/dates.js';
import { text } from '../../shared/text.js';
import './NoteCard.css';

/**
 * Una tarjeta que abre la hoja de la nota.
 *
 * @param {object} props
 * @param {{id: string, title: string, body: string, updatedAt: string}} props.note - La nota.
 * @param {string|null} props.processName - El nombre del proceso ligado, o null si no tiene.
 * @returns {JSX.Element} La tarjeta como enlace.
 */
export default function NoteCard({ note, processName }) {
  return (
    <Link className="note-card" to={`/notas/${note.id}`}>
      <span className="note-card-title">{note.title || text.notes.untitled}</span>
      {/* El CSS corta el texto a dos renglones; aquí se pasa completo. */}
      <span className="note-card-body">{note.body}</span>
      <span className="note-card-details">
        {text.notes.updated(formatHouseDate(note.updatedAt))}
        {processName ? ` · ${text.notes.linkedTo(processName)}` : ''}
      </span>
    </Link>
  );
}
