// Ordena la lista de procesos en secciones con título, para dibujarla por partes.
import { CATEGORIES, PREPARE_GROUPS } from '../../shared/constants.js';
import { text } from '../../shared/text.js';

/**
 * Parte los procesos en secciones. Si se ven todas las categorías, hay una sección
 * por categoría. Si se eligió "preparar" (la más grande), se divide por grupo:
 * pollo, cerdo, sopas... y los de operación, que no tienen grupo, van primero.
 *
 * @param {object[]} processes - Todos los procesos activos.
 * @param {string|null} category - La categoría elegida, o null para todas.
 * @returns {Array<{title: string, processes: object[]}>} Las secciones que sí tienen procesos.
 */
export function groupProcesses(processes, category) {
  let sections;
  if (category === null) {
    sections = CATEGORIES.map((name) => ({
      title: text.categories[name],
      processes: processes.filter((process) => process.category === name),
    }));
  } else if (category === 'preparar') {
    const inCategory = processes.filter((process) => process.category === 'preparar');
    sections = [
      { title: text.groups.none, processes: inCategory.filter((process) => !process.group) },
      ...PREPARE_GROUPS.map((group) => ({
        title: text.groups[group],
        processes: inCategory.filter((process) => process.group === group),
      })),
    ];
  } else {
    sections = [{ title: text.categories[category], processes: processes.filter((process) => process.category === category) }];
  }
  return sections.filter((section) => section.processes.length > 0);
}
