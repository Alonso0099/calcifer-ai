// Convierte el estado de una tarea en el texto que acompaña a su barra y a su punto.
import { text } from '../../shared/text.js';

/**
 * Escribe el estado de una tarea con palabras. El color nunca va solo: este texto
 * siempre lo acompaña, para que se entienda aunque el color no se distinga bien.
 *
 * @param {{status: string, daysUntilDue: number|null}} task - Una tarea de buildZoneBoards.
 * @returns {string} "Al día", "Vence hoy", "Vence en 3 días", "Atrasada 5 días" o "Sin registro".
 */
export function getDueLabel(task) {
  if (task.status === 'soon') return text.due.soon(task.daysUntilDue);
  if (task.status === 'late') return text.due.late(Math.abs(task.daysUntilDue));
  return text.due[task.status];
}
