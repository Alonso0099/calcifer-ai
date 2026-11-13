// Junta los archivos JSON de src/content/ en un solo objeto para la capa de datos.
// Es el único lugar de la app que importa el contenido.
import compra from '../content/processes/compra.json';
import guardar from '../content/processes/guardar.json';
import preparar from '../content/processes/preparar.json';
import limpieza from '../content/processes/limpieza.json';
import mantenimiento from '../content/processes/mantenimiento.json';
import seguridad from '../content/processes/seguridad.json';
import week from '../content/week.json';

/** Todos los procesos, en el orden del flujo de la cocina, y la semana tipo. */
export const content = {
  processes: [compra, guardar, preparar, limpieza, mantenimiento, seguridad].flatMap((file) => file.processes),
  week,
};
