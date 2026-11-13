// La parte de "restaurar" de la pantalla de respaldo: elegir archivo, confirmar y reemplazar.
import { useRef, useState } from 'react';
import { importBackup } from '../../data/index.js';
import { text } from '../../shared/text.js';

/**
 * Permite elegir un archivo de respaldo y, solo después de confirmar, reemplaza
 * el historial con el suyo. Si el archivo no es válido, no se cambia nada.
 *
 * @returns {JSX.Element} El selector de archivo, la confirmación y el mensaje del resultado.
 */
export default function RestoreSection() {
  const [chosenFile, setChosenFile] = useState(null); // el archivo elegido, en espera de confirmación
  const [result, setResult] = useState(null); // { isError, message } después de intentar restaurar
  // useRef guarda una referencia al <input> real de la página, para poder vaciarlo.
  const fileInputRef = useRef(null);

  /** Olvida el archivo elegido y vacía el selector, para poder elegir el mismo archivo otra vez. */
  function clearChosenFile() {
    setChosenFile(null);
    fileInputRef.current.value = '';
  }

  /** Guarda el archivo elegido; todavía no se restaura nada. */
  function handleFileChange(event) {
    setResult(null);
    setChosenFile(event.target.files[0] ?? null);
  }

  /** Ya con la confirmación, reemplaza el historial y muestra qué pasó. */
  async function handleConfirm() {
    try {
      const restoredCount = await importBackup(chosenFile);
      setResult({ isError: false, message: text.backup.restored(restoredCount) });
    } catch (error) {
      // La capa de datos avisa con un código; aquí se traduce a un texto para el usuario.
      setResult({ isError: true, message: text.backup.errors[error.message] ?? text.backup.errors.unknown });
    }
    clearChosenFile();
  }

  return (
    <section className="backup-section">
      <h3>{text.backup.restoreTitle}</h3>
      <p>{text.backup.restoreHelp}</p>
      <label className="backup-file">
        {text.backup.chooseFile}
        <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFileChange} />
      </label>
      {chosenFile && (
        // role="alertdialog" avisa a un lector de pantalla que esto pide una decisión importante.
        <div className="backup-confirm" role="alertdialog" aria-labelledby="backup-confirm-title">
          <h4 id="backup-confirm-title">{text.backup.confirmTitle}</h4>
          <p>{text.backup.confirmBody(chosenFile.name)}</p>
          <div className="backup-buttons">
            <button type="button" className="button button-primary" onClick={handleConfirm}>
              {text.backup.confirm}
            </button>
            <button type="button" className="button" onClick={clearChosenFile}>
              {text.backup.cancel}
            </button>
          </div>
        </div>
      )}
      <p className={result?.isError ? 'backup-message backup-message-error' : 'backup-message'} role="status">
        {result?.message}
      </p>
    </section>
  );
}
