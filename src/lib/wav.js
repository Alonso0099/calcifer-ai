// Función pura que genera un archivo de sonido WAV con pitidos, sin descargar nada.
// Se genera en la app porque así funciona sin conexión y no hace falta guardar un archivo de audio.

const BYTES_PER_SAMPLE = 2; // audio de 16 bits
const HEADER_BYTES = 44; // tamaño fijo de la cabecera de un WAV simple
const MAX_AMPLITUDE = 32767; // el valor más alto que cabe en 16 bits con signo

/**
 * Escribe un texto de 4 letras (como "RIFF") en los bytes del archivo.
 *
 * @param {DataView} view - Los bytes del archivo.
 * @param {number} offset - Dónde empezar a escribir.
 * @param {string} letters - Las letras.
 */
function writeLetters(view, offset, letters) {
  for (let index = 0; index < letters.length; index += 1) view.setUint8(offset + index, letters.charCodeAt(index));
}

/**
 * Genera los bytes de un WAV con varios pitidos seguidos y silencios entre ellos.
 *
 * @param {{frequencyHz: number, volume: number, seconds: number, count: number, gapSeconds: number, sampleRate: number}} beep
 *   Cómo es el pitido (ver BEEP en constants.js).
 * @returns {Uint8Array} El archivo WAV completo.
 */
export function createBeepWav({ frequencyHz, volume, seconds, count, gapSeconds, sampleRate }) {
  const toneSamples = Math.round(seconds * sampleRate);
  const gapSamples = Math.round(gapSeconds * sampleRate);
  const totalSamples = count * toneSamples + (count - 1) * gapSamples;
  const dataBytes = totalSamples * BYTES_PER_SAMPLE;
  const view = new DataView(new ArrayBuffer(HEADER_BYTES + dataBytes));

  // Cabecera WAV: formato PCM, 1 canal, 16 bits.
  writeLetters(view, 0, 'RIFF');
  view.setUint32(4, HEADER_BYTES - 8 + dataBytes, true);
  writeLetters(view, 8, 'WAVE');
  writeLetters(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * BYTES_PER_SAMPLE, true);
  view.setUint16(32, BYTES_PER_SAMPLE, true);
  view.setUint16(34, 8 * BYTES_PER_SAMPLE, true);
  writeLetters(view, 36, 'data');
  view.setUint32(40, dataBytes, true);

  // Los pitidos: una onda senoidal en cada tramo de tono; ceros en cada silencio.
  for (let sample = 0; sample < totalSamples; sample += 1) {
    const positionInCycle = sample % (toneSamples + gapSamples);
    const isTone = positionInCycle < toneSamples;
    const value = isTone ? Math.sin((2 * Math.PI * frequencyHz * positionInCycle) / sampleRate) * volume : 0;
    view.setInt16(HEADER_BYTES + sample * BYTES_PER_SAMPLE, Math.round(value * MAX_AMPLITUDE), true);
  }
  return new Uint8Array(view.buffer);
}
