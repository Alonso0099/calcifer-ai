// Pantalla de respaldo: descargar el historial en un archivo y restaurarlo.
import { useState } from 'react';
import { exportBackup } from '../../data/index.js';
import { getHouseDayText } from '../../lib/dates.js';
import { BACKUP_FILE_PREFIX } from '../../shared/constants.js';
import { text } from '../../shared/text.js';
import RestoreSection from './RestoreSection.jsx';
import { downloadTextFile } from './downloadTextFile.js';
import './BackupPage.css';

/**
 * La pantalla de respaldo. Existe porque el historial vive solo en este dispositivo:
 * si se pierde o se cambia de tablet, el respaldo es la única copia.
 *
 * @returns {JSX.Element} La sección de descargar y la de restaurar.
 */
export default function BackupPage() {
  const [message, setMessage] = useState('');

  /** Pide el historial a la capa de datos y lo descarga con la fecha de hoy en el nombre. */
  async function handleDownload() {
    const backupText = await exportBackup();
    const fileName = `${BACKUP_FILE_PREFIX}-${getHouseDayText(new Date())}.json`;
    downloadTextFile(fileName, backupText, 'application/json');
    setMessage(text.backup.downloaded);
  }

  return (
    <>
      <h2 className="backup-title">{text.backup.title}</h2>
      <p className="backup-intro">{text.backup.intro}</p>
      <section className="backup-section">
        <h3>{text.backup.downloadTitle}</h3>
        <p>{text.backup.downloadHelp}</p>
        <button type="button" className="button button-primary" onClick={handleDownload}>
          {text.backup.download}
        </button>
        <p className="backup-message" role="status">
          {message}
        </p>
      </section>
      <RestoreSection />
    </>
  );
}
