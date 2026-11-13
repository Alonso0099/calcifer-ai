# Calcifer

La app de la cocina de Alonso y Tita: el manual de cocina convertido en procesos que se siguen como checklist, con limpieza, mantenimiento, notas y tiempos reales.

Esta versión fue construida con [Claude Code](https://claude.com/claude-code). Las reglas del proyecto están en [`CLAUDE.md`](CLAUDE.md).

## Estado

Fase 1, en construcción. Ya existen el proyecto base, el contenido del manual, la capa de datos y dos pantallas: procesos como tarjetas con checklist, cronómetro y Deshacer, y la vista semanal. Faltan búsqueda, mantenimiento, respaldo y notas.

## Cómo correrla

Necesitas Node 22.23.4 (la versión está fijada en `.node-version`).

```bash
npm install        # instala las dependencias (solo la primera vez)
npm run dev        # abre la app en modo desarrollo
npm run validate   # revisa el contenido de src/content/ y lista los pendientes
npm test           # corre las pruebas de src/lib/ y de la capa de datos
npm run build      # valida el contenido y empaqueta la app en dist/
```

## Dónde está cada cosa

| Carpeta | Qué contiene |
| --- | --- |
| `docs/source/` | El manual v0 (fuente oficial) y el PDF original |
| `src/content/` | El contenido en JSON: procesos por categoría, semana tipo y zonas |
| `src/data/` | La capa de datos: el único camino para leer contenido y guardar eventos |
| `src/lib/` | Funciones puras (cálculos sobre los eventos, búsqueda, respaldo) |
| `src/app/`, `src/shared/`, `src/styles/` | El marco de la app, los textos, las constantes y los colores |
| `scripts/` | El validador de contenido |
| `tests/` | Las pruebas |

## Decisiones

Una línea por decisión importante, con su porqué.

### Proyecto base

- **Archivos de Vite escritos a mano**, no con la plantilla: la plantilla trae logos, CSS de ejemplo y ESLint, que no está entre las dependencias permitidas.
- **Versiones exactas en `package.json`** (sin `^`): la app se construye igual hoy que dentro de un año.
- **Node fijado en `.node-version` y en `engines`**: Render usa la misma versión con la que se probó.
- **Las pantallas son una lista en `src/app/routes.jsx`**: agregar o quitar una funcionalidad es tocar una sola línea.
- **Tipografía del sistema**: no hay que descargar nada y funciona sin conexión.

### Contenido

- **Un JSON por categoría** en `src/content/processes/`: archivos más fáciles de revisar que uno solo con 111 procesos.
- **Sin dueños**: ningún JSON tiene `owner`; quién hizo algo es solo la nota opcional `doneBy` de un evento.
- **`estimatedMinutes` y `minutes` son cosas distintas**: el primero es el rango que estima el manual; el segundo, un tiempo medido en la cocina. Nunca se mezclan.
- **`frequencyDays` y `frequencyLabel`**: el número sirve para calcular el vencimiento; el texto conserva las palabras del manual. Mensual = 30 días y, en un rango, el número menor, para que el aviso llegue temprano.
- **Las tareas diarias llevan `frequencyDays: null`**: la regla R5 del manual solo registra "última vez" en tareas no diarias.
- **Estufa y horno son una sola zona** (`estufa-horno`): son el mismo aparato.
- **La fila "cada 3–6 meses" son 5 procesos**, uno por zona: el manual dice que se hace en bloques.
- **Recetas traducidas, nombres de platos intactos**: la interfaz va en español, pero un plato se busca como se le dice en casa.
- **`notes` guarda lo que no es ingrediente ni paso** (rendimiento, compatibilidad de marinadas, armado de Tita y de Alonso): sin ese campo se perdía.
- **Lo que el manual no dice no se inventa**: va en `null` o `[]` y se lista en `pending`. Mientras ningún paso esté medido, basta una entrada `steps.minutes`.
- **Las reglas de compra se escribieron como checklist**: la v0 no da pasos para las compras, solo reglas, y así se pueden seguir en la tienda.
- **Los ids describen el proceso, no el día** (`revision-semanal`, no "del domingo"): un id nunca se renombra, y el día sí puede cambiar.

### Validador

- **`npm run build` corre `npm run validate` primero**: contenido roto no se publica.
- **`pending` se revisa contra los datos reales**: no puede decir que falta algo que ya está, ni callar algo que falta.
- **Avisa de campos desconocidos**: un error de dedo en una clave no pasa en silencio.

### Capa de datos

- **Todas las funciones son asíncronas** aunque `localStorage` no lo necesita: una base de datos futura sí, y así los componentes no cambian ese día.
- **El adaptador recibe el almacenamiento y el contenido como parámetros**: las pruebas usan un almacenamiento falso en memoria.
- **El estado se calcula de los eventos** con funciones puras de `src/lib/`: nada derivado se guarda.
- **Terminar un proceso limpia su checklist**: los pasos marcados son los posteriores al último "terminado", sin borrar ningún evento.
- **Deshacer anula el último evento vigente** y se puede repetir hacia atrás; no hay "rehacer" porque no se pidió.
- **Un respaldo inválido no toca el historial**: el archivo se revisa completo antes de reemplazar nada.
- **Los errores del respaldo son códigos**, no frases: los textos que ve el usuario viven en `src/shared/text.js`.
- **Si lo guardado en el dispositivo está dañado, la app falla en vez de empezar en blanco**: empezar en blanco borraría el historial en el siguiente guardado.
- **Pruebas con `node --test`**: viene con Node, no agrega dependencias.

### Procesos (tarjetas, checklist y cronómetro)

- **El filtro de categoría vive en la dirección** (`/?categoria=limpieza`), no en la memoria del componente: al abrir un proceso y volver, el filtro sigue igual.
- **"Preparar" se muestra por grupos** (pollo, cerdo, sopas...): son 87 procesos y en una sola lista no se encuentra nada.
- **Cada paso marcado se guarda al momento** y la pantalla vuelve a leer el proceso: lo que se ve siempre sale de los eventos guardados.
- **El cronómetro guarda la hora de arranque y calcula la diferencia**, en vez de sumar segundos: no se atrasa si el navegador pausa la pestaña.
- **El cronómetro en curso se guarda en el dispositivo, fuera del historial**: no se pierde al recargar la página, y si estaba corriendo sigue contando. No es un evento porque no es algo que "pasó": no entra a Deshacer ni al respaldo.
- **Al terminar, los minutos vienen llenos pero se pueden editar**: a veces se olvida iniciar o pausar el cronómetro.
- **"¿Quién lo hizo?" ofrece Nano, Tita o Ambos, y viene en "Ambos"**: `doneBy` es una nota de historial, nunca una asignación.
- **Pantalla encendida con Wake Lock**, que se vuelve a pedir al regresar a la app; si el dispositivo no lo soporta, se avisa con texto.
- **Deshacer dice qué deshizo**: anula el último registro de toda la app, que podría no ser de la pantalla abierta.
- **`--color-on-primary` (blanco) se agregó a la paleta**: `CLAUDE.md` pide texto blanco sobre los botones salvia, pero no había variable para escribirlo sin un color directo.
- **`global.css` se importa antes que los componentes**: así el estilo de un componente puede ajustar el estilo base de un botón.

### Vista semanal

- **Sin nombres ni totales por persona**: en esta cocina nadie tiene tareas asignadas.
- **Cada bloque abre el checklist de su proceso**: la semana sirve para empezar a trabajar, no solo para leerla.
- **No hay total de minutos por día**: la compra de frescos toca cada 2 semanas, así que un solo total diría de más o de menos.
- **El menú sale de `routes.jsx`** (las rutas con `menuLabel`): agregar una pantalla al menú es la misma línea que la crea.
- **`getWeekPlan()` ya trae el nombre de cada proceso**: la pantalla de semana no necesita importar nada de la de procesos.
