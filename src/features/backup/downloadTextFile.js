// Hace que el navegador descargue un texto como archivo.

/**
 * Descarga un texto como archivo. El navegador no tiene una función directa para
 * esto: se crea un enlace invisible que apunta al contenido y se le hace "clic".
 *
 * @param {string} fileName - El nombre que tendrá el archivo.
 * @param {string} content - El texto del archivo.
 * @param {string} mimeType - El tipo de contenido (por ejemplo, "application/json").
 */
export function downloadTextFile(fileName, content, mimeType) {
  // Un Blob es el contenido "empaquetado" como archivo; createObjectURL le da una dirección temporal.
  const fileUrl = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  // La dirección temporal se libera para no dejar el archivo ocupando memoria.
  URL.revokeObjectURL(fileUrl);
}
