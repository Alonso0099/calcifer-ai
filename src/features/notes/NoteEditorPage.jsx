// Pantalla de una nota: la hoja de papel para crearla, editarla o borrarla.
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { deleteNote, getNotes, getProcesses, saveNote } from '../../data/index.js';
import { text } from '../../shared/text.js';
import { useLoadedData } from '../../shared/useLoadedData.js';
import NoteForm from './NoteForm.jsx';
import './NoteEditorPage.css';

const EMPTY_NOTE = { title: '', body: '', processId: null };

/**
 * La hoja de una nota. Sirve para dos direcciones:
 * - /notas/nueva crea una nota (con ?proceso=id ya viene ligada a ese proceso).
 * - /notas/:noteId edita una nota existente.
 *
 * @returns {JSX.Element} El formulario de la nota, o un aviso si la nota no existe.
 */
export default function NoteEditorPage() {
  const { noteId } = useParams(); // undefined en /notas/nueva
  const [searchParams] = useSearchParams();
  // useNavigate da una función para cambiar de pantalla desde el código (no desde un enlace).
  const navigate = useNavigate();
  const fromProcessId = searchParams.get('proceso');
  const isNew = noteId === undefined;

  const { data, isLoading, hasError } = useLoadedData(async () => {
    const [notes, processes] = await Promise.all([getNotes(), getProcesses()]);
    const existingNote = notes.find((note) => note.id === noteId) ?? null;
    return { existingNote, processes };
  }, [noteId]);

  /** Guarda la nota y regresa a donde se empezó: al proceso si se vino de uno, o a la lista. */
  async function handleSave(note) {
    await saveNote(isNew ? note : { ...note, id: noteId });
    navigate(isNew && fromProcessId ? `/procesos/${fromProcessId}` : '/notas');
  }

  /** Borra la nota y regresa a la lista, donde el botón Deshacer permite recuperarla. */
  async function handleDelete() {
    await deleteNote(noteId);
    navigate('/notas', { state: { noteDeleted: true } });
  }

  if (isLoading) return <p>{text.common.loading}</p>;
  if (hasError) return <p>{text.common.loadError}</p>;
  const backLink = (
    <Link className="note-editor-back" to="/notas">
      ← {text.notes.back}
    </Link>
  );
  if (!isNew && !data.existingNote) {
    return (
      <>
        {backLink}
        <p>{text.notes.notFound}</p>
      </>
    );
  }

  // Una nota nueva abierta desde un proceso ya viene ligada a él (si ese proceso existe).
  const linkedProcess = data.processes.find((process) => process.id === fromProcessId);
  const initialNote = isNew ? { ...EMPTY_NOTE, processId: linkedProcess ? linkedProcess.id : null } : data.existingNote;
  return (
    <>
      {backLink}
      <h2 className="note-editor-title">{isNew ? text.notes.createTitle : text.notes.editTitle}</h2>
      {/* "key" obliga a React a crear un formulario nuevo al cambiar de nota, en vez de
          reusar el anterior con el texto de la otra nota. */}
      <NoteForm
        key={noteId ?? 'nueva'}
        initialNote={initialNote}
        processes={data.processes}
        onSave={handleSave}
        onDelete={isNew ? null : handleDelete}
      />
    </>
  );
}
