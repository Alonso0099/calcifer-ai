// El formulario de una nota, sobre la hoja de papel: título, texto y proceso ligado.
import { useState } from 'react';
import NotePaper from '../../shared/components/NotePaper.jsx';
import { text } from '../../shared/text.js';
import ProcessSelect from './ProcessSelect.jsx';
import './NoteForm.css';

/**
 * Formulario para crear o editar una nota. Guarda lo que se escribe en su propio
 * estado y solo avisa a la pantalla al tocar Guardar o Borrar.
 *
 * @param {object} props
 * @param {{title: string, body: string, processId: string|null}} props.initialNote - Con qué empieza el formulario.
 * @param {object[]} props.processes - Los procesos a los que se puede ligar la nota.
 * @param {(note: {title: string, body: string, processId: string|null}) => void} props.onSave - Se llama al guardar.
 * @param {(() => void)|null} props.onDelete - Se llama al borrar; null si la nota es nueva y no hay qué borrar.
 * @returns {JSX.Element} El formulario.
 */
export default function NoteForm({ initialNote, processes, onSave, onDelete }) {
  const [title, setTitle] = useState(initialNote.title);
  const [body, setBody] = useState(initialNote.body);
  const [processId, setProcessId] = useState(initialNote.processId ?? '');
  // Una nota vacía no se guarda: debe tener al menos título o texto.
  const isEmpty = title.trim() === '' && body.trim() === '';

  /** Manda la nota a la pantalla. preventDefault evita que el formulario recargue la página. */
  function handleSubmit(event) {
    event.preventDefault();
    onSave({ title: title.trim(), body, processId: processId === '' ? null : processId });
  }

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <NotePaper>
        <input
          className="note-paper-title note-form-title"
          type="text"
          value={title}
          placeholder={text.notes.titlePlaceholder}
          aria-label={text.notes.titleLabel}
          onChange={(event) => setTitle(event.target.value)}
        />
        <textarea
          className="note-paper-lines note-form-body"
          value={body}
          rows={10}
          placeholder={text.notes.bodyPlaceholder}
          aria-label={text.notes.bodyLabel}
          onChange={(event) => setBody(event.target.value)}
        />
      </NotePaper>
      <ProcessSelect processes={processes} value={processId} onChange={setProcessId} />
      <div className="note-form-buttons">
        <button type="submit" className="button button-primary" disabled={isEmpty}>
          {text.notes.save}
        </button>
        {onDelete && (
          <button type="button" className="button note-form-delete" onClick={onDelete}>
            {text.notes.delete}
          </button>
        )}
      </div>
    </form>
  );
}
