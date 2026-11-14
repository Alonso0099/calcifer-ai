# CLAUDE.md — Calcifer, la app de la cocina

Este archivo explica qué es esta app, qué reglas son fijas y cómo trabajar en ella. Léelo completo antes de cada tarea.

El nombre de la app es **Calcifer** (repo `calcifer-ai`). Es solo el nombre: la app no usa imágenes, logos, personajes ni arte de ninguna película, y ningún ícono o muñequito puede parecerse a un personaje existente.

## Qué es la app

El manual de cocina de Alonso y Christa (Tita), convertido en una app. Sirve para:

- Consultar los procesos de la cocina: compra → guardar → preparar, más limpieza, mantenimiento y seguridad.
- Seguir cada proceso como checklist mientras se hace.
- Ver la semana tipo: qué se hace cada día y cuánto tiempo toma. Nadie tiene tareas asignadas (ver "Sin dueños").
- Saber qué limpieza o mantenimiento está al día y qué está vencido.
- Medir los tiempos reales para mejorar el manual.

Quien mantiene el código es Alonso, estudiante de desarrollo de software (BYU-Pathway). Sabe HTML, CSS y JavaScript; está aprendiendo React con esta app. **El código tiene que poder leerlo y modificarlo él.**

## Fuente del contenido

- `docs/source/kitchen-manual-v0.md` es la **fuente oficial**. Si algo choca con otra fuente, manda la v0.
- `docs/source/Kitchen_Manual_Final.pdf` (241 páginas) solo aporta el detalle de procedimientos y recetas (capítulos 5–8). Sus capítulos 1–4, 9 y 10 fueron reemplazados por la v0: no tomes de ahí reglas, productos de limpieza, temperaturas ni lugares de trabajo.
- **Nunca inventes datos.** Si a un proceso le falta algo (tiempo, frecuencia, zona), el valor va en `null` y el nombre del campo se agrega a la lista `pending` de ese proceso. La app muestra esos datos como "Pendiente".

## Fase actual: fase 1

Un solo dispositivo (la tablet o el teléfono de la cocina). Sin cuentas, sin servidor, sin base de datos.

Funciones de la fase 1, y nada más:

1. Procesos como tarjetas, con checklist de pasos, cronómetro y pantalla siempre encendida mientras se cocina.
2. Vista semanal: qué se hace cada día y cuánto tiempo estimado toma, sin nombres de personas ni totales por persona.
3. Búsqueda de procesos.
4. Limpieza y mantenimiento: tarjetas por zona con un indicador de color y barras de vencimiento ("Vence en 3 días", "Atrasada 5 días").
5. Deshacer el último registro.
6. Respaldo: descargar el historial en un archivo y restaurarlo.
7. Notas: crear, editar y borrar notas de texto (título y cuerpo), con la opción de ligarlas a un proceso. Un proceso muestra sus notas ligadas: las pide con `getNotes(processId)` y las dibuja con un componente de `src/shared/components/`, nunca importando archivos de `features/notes/`. La página de notas se ve como una hoja de papel con renglones (ver "Diseño de las notas").

Fuera de alcance por ahora (no lo construyas aunque parezca útil): inventario, lista de compras, cuentas, sincronizar entre dispositivos, asignar o rotar tareas, gamificación, escalar porciones, códigos de barras, notificaciones, fotos o archivos en las notas.

## Stack fijo

- React + Vite, en **JavaScript** (no TypeScript).
- CSS normal en archivos `.css`. Sin Tailwind ni librerías de componentes.
- Dependencias permitidas: `react`, `react-dom`, `react-router-dom`, `vite`, `@vitejs/plugin-react`. Cualquier otra dependencia necesita aprobación de Alonso antes de instalarse.
- Publicación: GitHub + Render como **Static Site**. Build command `npm install && npm run build` (Render empieza sin dependencias instaladas), publish directory `dist`, y una regla de rewrite de `/*` a `/index.html` para que funcionen las rutas de React Router.

## Reglas de producto

- Pensada primero para celular y tablet. Botones de al menos 44 px, texto legible a un brazo de distancia.
- Interfaz en español. Código en inglés (archivos, componentes, funciones, variables, claves del JSON). Los textos que ve el usuario van en un solo archivo: `src/shared/text.js`.
- La app se instala en la pantalla de inicio (incluye `manifest.webmanifest` e íconos). Safari puede borrar los datos de un sitio que no está instalado; por eso la app muestra un aviso si no se abrió como app instalada.
- Zona horaria de la casa: `America/Denver`. Las fechas se guardan en UTC (ISO 8601) y "hoy" se calcula en `America/Denver`.

### Sin dueños

Ninguna tarea tiene un dueño fijo: quién hace cada cosa se decide en el momento, entre Alonso y Tita. Por eso:

- No existe el campo `owner` en ningún JSON, y la app nunca muestra "a cargo de", "le toca a" ni totales por persona.
- Al terminar un proceso, la app pregunta "¿Quién lo hizo?" con tres opciones: Nano, Tita o Ambos (viene elegido "Ambos"). Se guarda como `doneBy` en el evento `process_finished`.
- `doneBy` es solo una **nota de historial**. No asigna nada, no cambia el estado de vencimiento y no se usa para repartir ni rotar tareas. Si se muestra, es como texto pequeño ("Lo hizo Tita"), nunca como un campo de la tarea.

## Colores

La paleta es fija. Todos los colores se definen una sola vez como variables en `src/styles/global.css`, y ningún componente escribe un color directo (`#...`): siempre usa la variable. Así, cambiar un color es cambiar una sola línea.

Los contrastes están medidos con la fórmula WCAG (mínimo 4.5:1 para texto, 3:1 para barras y puntos). No uses un color en un papel distinto al de esta tabla sin revisar su contraste.

```css
:root {
  /* Fondos */
  --color-bg: #F4ECE1;            /* papel: fondo de la app */
  --color-surface: #FBF7F0;       /* tarjetas y paneles */
  --color-border: #C5A993;        /* arena: bordes y divisores (nunca texto) */

  /* Texto */
  --color-text: #202137;          /* azul noche: texto principal (14.7:1) */
  --color-text-strong: #4A3427;   /* café: títulos y énfasis (10.9:1) */
  --color-text-muted: #546D80;    /* azul acero: texto secundario (5.1:1) */

  /* Acciones */
  --color-primary: #5E7660;       /* salvia: botones principales, con texto blanco (5.0:1) */
  --color-primary-hover: #4F6451; /* salvia oscuro: botón presionado (6.4:1) */
  --color-on-primary: #FFFFFF;    /* blanco: texto sobre los botones salvia (5.0:1) */
  --color-highlight: #D1B174;     /* mostaza: fondo de resaltado, con texto café (5.7:1) */

  /* Estado de tareas (barras de vencimiento) */
  --color-ok: #8D9531;            /* oliva: barra "al día" (3.0:1, solo barra) */
  --color-ok-text: #575C1E;       /* oliva oscuro: texto "al día" (6.7:1) */
  --color-due: #D1B174;           /* mostaza: barra "vence pronto" (no es texto; siempre va con etiqueta) */
  --color-due-text: #68583A;      /* mostaza oscuro: texto "vence pronto" (6.5:1) */
  --color-late: #CB7673;          /* salmón: barra "atrasada" (3.1:1, solo barra) */
  --color-late-text: #6C3332;     /* vino: texto "atrasada" (9.1:1) */

  /* Categorías (punto de color junto al nombre; el texto siempre va en --color-text) */
  --color-cat-compra: #546D80;        /* azul acero */
  --color-cat-guardar: #5E7660;       /* salvia */
  --color-cat-preparar: #CB7673;      /* salmón */
  --color-cat-limpieza: #905F72;      /* malva */
  --color-cat-mantenimiento: #D1B174; /* mostaza */
  --color-cat-seguridad: #6C3332;     /* vino */
}
```

Reglas de uso:

- El estado de una tarea nunca se comunica solo con color: la barra siempre va con su texto ("Atrasada 5 días"), para que se entienda aunque el color no se distinga bien.
- Mostaza, arena, salmón y oliva nunca se usan como color de texto sobre los fondos claros; para texto se usan sus variables `-text`.
- Por ahora solo hay modo claro. Un modo oscuro (con azul noche y café de fondo) es para una fase futura.

### Diseño de las notas

- La página de una nota se ve como una hoja de papel: fondo `--color-surface`, renglones finos en `--color-border` hechos con CSS (`repeating-linear-gradient`), y el texto alineado sobre los renglones.
- Un solo adorno original en una esquina: una ramita de hierbas de cocina (por ejemplo, romero o albahaca) dibujada como SVG simple con `--color-cat-guardar` y `--color-ok`. Es decorativo (`aria-hidden="true"`) y no debe tapar el texto.
- Nunca uses imágenes, personajes, lugares ni ilustraciones de películas, series o de otros artistas, ni copies el diseño de una hoja o plantilla existente. Todo el arte de la app es original y simple.

## Arquitectura

### Regla 1: contenido y estado separados

- **Contenido** (procesos, pasos, semana tipo, zonas): archivos JSON en `src/content/`. Solo se leen; la app nunca los modifica.
- **Estado** (qué se hizo, cuándo, cuánto tardó): eventos guardados en el dispositivo. Solo se accede a ellos a través de la capa de datos.

### Regla 2: capa de datos única

Ningún componente lee `localStorage` ni importa el JSON directamente. Todo pasa por `src/data/index.js`, que expone exactamente estas funciones:

| Función | Qué hace |
| --- | --- |
| `getProcesses()` | Todos los procesos activos |
| `getProcess(id)` | Un proceso con sus pasos |
| `searchProcesses(text)` | Búsqueda por nombre, pasos e ingredientes, sin distinguir mayúsculas ni acentos |
| `getZones()` | Las zonas de la cocina (`id`, `name`) |
| `getWeekPlan()` | La semana tipo: bloques por día con minutos estimados, sin dueños |
| `toggleStep(processId, stepId)` | Marca o desmarca un paso; se guarda al momento |
| `finishProcess(processId, minutes, doneBy?)` | Registra que se terminó y cuánto tardó; `doneBy` ("Nano", "Tita" o "Ambos"; `null` si no se manda) es solo una nota |
| `getLastDone(processId)` | Fecha de la última vez que se terminó |
| `getNotes(processId?)` | Todas las notas, o solo las de un proceso; la más reciente primero |
| `saveNote(note)` | Crea una nota o guarda los cambios de una existente |
| `deleteNote(noteId)` | Borra una nota (se puede recuperar con Deshacer) |
| `undoLastEvent()` | Anula el último evento |
| `getStopwatch(processId)` / `saveStopwatch(processId, stopwatch)` | Lee y guarda el cronómetro en curso de un proceso, para que no se pierda al recargar la página. No es un evento: no entra al historial, al Deshacer ni al respaldo |
| `exportBackup()` / `importBackup(file)` | Respaldo y restauración del historial |

`src/data/index.js` elige el adaptador con la variable `VITE_DATA_SOURCE` (por ahora solo existe `local`). Un adaptador futuro (por ejemplo, PostgreSQL en Neon) debe implementar las mismas funciones con los mismos parámetros y resultados, sin cambiar ningún componente.

### Regla 3: eventos, no estados sobrescritos

Cada acción se guarda como un evento nuevo; nunca se edita ni se borra uno anterior.

```js
{
  id: 'uuid generado con crypto.randomUUID()',
  type: 'step_checked' | 'step_unchecked' | 'process_finished' | 'note_saved' | 'note_deleted' | 'event_undone',
  processId: 'limpieza-semanal',  // en notas es opcional: null si la nota no está ligada a un proceso
  stepId: 'paso-3',        // solo en eventos de pasos
  minutes: 42,             // solo en process_finished
  doneBy: 'Tita',          // solo en process_finished; 'Nano' | 'Tita' | 'Ambos' | null. Es una nota, no una asignación
  noteId: 'uuid',          // solo en eventos de notas; el mismo id en todas las versiones de una nota
  title: '...',            // solo en note_saved
  body: '...',             // solo en note_saved
  targetEventId: '...',    // solo en event_undone
  createdAt: '2026-11-13T02:15:00.000Z'
}
```

Una nota se ve siempre en su versión más reciente (el último `note_saved` con su `noteId`), a menos que exista un `note_deleted` posterior.

Los valores derivados nunca se guardan: la última vez, la próxima fecha, si algo está vencido y el progreso de un checklist se calculan a partir de los eventos y del JSON. Así, cambiar una frecuencia en el JSON recalcula todo solo.

### Regla 4: ids que nunca cambian

Cada proceso, paso y zona tiene un id en formato slug (`limpieza-semanal`, `paso-3`). Un id nunca se renombra ni se reutiliza. Para retirar un proceso se marca `"active": false`; no se borra del JSON.

## Estructura del contenido

Los procesos van en **un archivo por categoría** dentro de `src/content/processes/`: `compra.json`, `guardar.json`, `preparar.json`, `limpieza.json`, `mantenimiento.json` y `seguridad.json`. Todos tienen la misma forma. Ejemplo, `limpieza.json`:

```json
{
  "schemaVersion": 1,
  "processes": [
    {
      "id": "limpieza-semanal",
      "name": "Limpieza semanal",
      "category": "limpieza",
      "zone": "cocina-general",
      "frequencyDays": 7,
      "frequencyLabel": "Semanal (viernes)",
      "estimatedMinutes": { "min": 45, "max": 60 },
      "active": true,
      "source": "Kitchen Manual v0, sección 6",
      "steps": [
        { "id": "paso-1", "text": "Campana: exterior con Krud Kutter si hay grasa, luego Weiman Stainless", "minutes": null }
      ],
      "pending": ["steps.minutes"]
    }
  ]
}
```

Campos obligatorios de cada proceso:

- `id`, `name`, `active`, `source`: como en el ejemplo. Los nombres de los platos se quedan como se usan en casa (`Beef & Broccoli`); el resto del texto va en español.
- `category`: `compra` | `guardar` | `preparar` | `limpieza` | `mantenimiento` | `seguridad`. Debe coincidir con el archivo donde está el proceso.
- `zone`: el id de una zona de `zones.json`, o `null` si el proceso no pertenece a una zona (por ejemplo, una receta).
- `frequencyDays`: número de días, o `null` si el proceso no se repite por calendario (una receta) o si es una tarea diaria (las diarias no llevan registro de "última vez"). Conversión fija: mensual = 30 días; si el manual da un rango, se usa el número menor ("cada 2–3 meses" = 60).
- `frequencyLabel`: la frecuencia con las palabras del manual ("Cada 2–3 meses", "Diario"), o `null`. Es el texto que ve el usuario; `frequencyDays` es el número con el que se calcula el vencimiento.
- `estimatedMinutes`: `{ "min": 45, "max": 60 }`, el estimado del manual para el proceso completo, o `null` si el manual no lo da. Un estimado de un solo número lleva `min` y `max` iguales.
- `steps`: lista de pasos (`id`, `text`, `minutes`). Si el manual todavía no da los pasos, va `[]` y se agrega `"steps"` a `pending`.
- `minutes` de cada paso: un solo número **medido** en la cocina, o `null` mientras no se mida. Nunca se llena con un estimado.
- `pending`: los nombres de los campos que faltan (`"estimatedMinutes"`, `"steps"`, `"steps.minutes"`). Lista vacía si no falta nada. Un `null` permitido por diseño no es un pendiente: `zone` en una receta, o `frequencyDays` en una receta o en una tarea diaria.
- Minutos por paso en `pending`: mientras ningún paso esté medido, va una sola entrada `"steps.minutes"`. Cuando se mide el primero, esa entrada se cambia por una por cada paso que todavía falte (`"steps.paso-2.minutes"`, `"steps.paso-5.minutes"`).

Campos opcionales (solo se escriben cuando aplican):

- `ingredients`: lista de textos, uno por ingrediente con su cantidad (`"2 chiles dulces en tiras"`). Para recetas y marinadas.
- `notes`: lista de textos con lo que el manual dice del proceso y no es ingrediente ni paso: rendimiento ("Rinde 1 unidad"), con qué proteína es compatible una marinada, cuánto puede esperar después de descongelar, o el armado de Tita y el de Alonso en un desayuno. Son contenido del manual, de solo lectura; no confundir con las notas que escribe el usuario (funcionalidad 7).
- `group`: solo en `preparar`, para dividir la categoría en la pantalla: `pollo` | `cerdo` | `res` | `seafood` | `sopas` | `flex` | `desayunos` | `marinadas`. Los procesos de `preparar` que no son recetas no lo llevan.

No hay campo de dueño (ver "Sin dueños").

El tiempo que muestra la app para un proceso: si todos sus pasos tienen `minutes`, es la suma (tiempo medido); si no, es el rango de `estimatedMinutes` ("45–60 min"); si tampoco existe, se muestra "Pendiente".

`src/content/week.json`: la semana tipo.

```json
{
  "schemaVersion": 1,
  "days": [
    {
      "id": "miercoles",
      "name": "Miércoles",
      "meal": "Cena: cerdo",
      "blocks": [
        { "processId": "servicio-diario", "estimatedMinutes": { "min": 50, "max": 90 } },
        { "processId": "compra-de-frescos", "estimatedMinutes": { "min": 45, "max": 45 }, "everyWeeks": 2 }
      ]
    }
  ]
}
```

- `meal`: la comida del sistema de ese día, con las palabras del manual, o `null`.
- `blocks`: los bloques del día, cada uno con `processId` y `estimatedMinutes` (misma forma que en los procesos, o `null`). Un día de descanso lleva `[]`.
- `everyWeeks`: opcional; cada cuántas semanas toca el bloque. Si no está, el bloque es de todas las semanas.

`src/content/zones.json`: las zonas de la cocina (`id`, `name`), por ejemplo `estufa-horno`, `refri`, `fregadero`, `piso`, `karlby` y `mesa-ikea`. La estufa y el horno son una sola zona.

`scripts/validate-content.js` (Node, sin dependencias) revisa que los ids no se repitan entre todos los archivos, que cada `processId` y `zone` exista, que `category` sea válida y coincida con su archivo, que `group` sea válido, que en `estimatedMinutes` `min` no sea mayor que `max`, que no exista ningún campo `owner`, y que `pending` coincida con lo que de verdad falta. Imprime cuántos procesos hay y la lista de pendientes. Se corre con `npm run validate` y también antes de `npm run build`.

## Estructura de carpetas

El código se organiza **por funcionalidad**. Cada función de la app vive en su propia carpeta dentro de `src/features/`. Para quitar una funcionalidad se borra su carpeta y su línea en `src/app/routes.jsx`; para agregar una, se crea una carpeta nueva con la misma forma.

```
src/
├── app/
│   ├── App.jsx            (layout y menú)
│   └── routes.jsx         (la lista de pantallas: una línea por funcionalidad)
├── features/
│   ├── processes/         (tarjetas, detalle, checklist, cronómetro)
│   ├── week/              (vista semanal)
│   ├── search/            (búsqueda)
│   ├── maintenance/       (zonas y barras de vencimiento)
│   ├── notes/             (lista de notas, hoja de una nota)
│   └── backup/            (respaldo y restauración)
├── data/
│   ├── index.js           (la capa de datos: las funciones de la tabla)
│   └── adapters/
│       └── localAdapter.js
├── content/               (los JSON)
├── lib/                   (funciones puras: fechas, vencimiento, sumas de tiempo)
├── shared/
│   ├── components/        (piezas usadas por 2 o más funcionalidades)
│   ├── constants.js       (números con nombre: umbrales de color, minutos, etc.)
│   └── text.js            (todos los textos de la interfaz)
└── styles/
    └── global.css         (variables de color, tipografía y base)
```

Reglas de estructura:

- Una funcionalidad nunca importa archivos de otra funcionalidad. Si dos necesitan lo mismo, eso se mueve a `src/shared/` o a `src/lib/`.
- Un componente por archivo, con el mismo nombre que el archivo (`ProcessCard.jsx` → `ProcessCard`), y su CSS al lado (`ProcessCard.css`).
- Si un archivo pasa de unas 150 líneas, se divide.
- Los cálculos (días desde la última vez, color de la barra, progreso del checklist) van en `src/lib/` como funciones puras: reciben datos y regresan un resultado, sin leer ni guardar nada.
- Nada de números mágicos: cualquier umbral o valor fijo va con nombre en `src/shared/constants.js`.

## Reglas de código y comentarios

- Cada archivo empieza con un comentario de 1–3 líneas que dice qué contiene y para qué sirve.
- Cada función y cada componente lleva un comentario JSDoc encima: qué hace, qué recibe, qué regresa y, si no es obvio, **por qué** existe.
- Cuando uses un concepto de React (`useState`, `useEffect`, props, `key`, rutas), agrega un comentario corto que lo explique para alguien que viene de JavaScript sin React.
- Comenta el **porqué**, no lo obvio. No escribas `// suma 1` encima de `count + 1`.
- Nombres claros y completos: `getDaysSinceLastDone`, no `gdsld`.
- Sin código duplicado: si escribes la misma lógica dos veces, va a `src/lib/`.
- Sin código comentado ni archivos sin usar. Si algo se quita, se borra; Git guarda la historia.

Ejemplo del nivel de comentario esperado:

```js
/**
 * Calcula cuántos días faltan para que una tarea venza.
 * Un número negativo significa que la tarea está atrasada.
 *
 * @param {string|null} lastDoneIso - Fecha ISO (UTC) de la última vez que se hizo, o null si nunca.
 * @param {number} frequencyDays - Cada cuántos días se repite la tarea.
 * @param {Date} today - El día de hoy en America/Denver (se recibe como parámetro para poder probarla).
 * @returns {number|null} Días restantes, o null si nunca se ha hecho.
 */
export function getDaysUntilDue(lastDoneIso, frequencyDays, today) { ... }
```

## Forma de trabajo

1. **Plan antes de código.** Antes de escribir código para cualquier tarea, muestra el plan: qué archivos vas a crear o cambiar y por qué. Espera la aprobación de Alonso.
2. **Explica cada decisión** en lenguaje simple, sobre todo las de React.
3. **Una funcionalidad a la vez.** Termina, prueba y haz commit antes de empezar la siguiente.
4. **No agregues funciones que no se pidieron.** Si ves una mejora, propónla al final como sugerencia; no la construyas.
5. **Si algo es ambiguo, pregunta** en vez de suponer.
6. **Commits pequeños** con mensaje en inglés que diga qué cambió (`Add process card checklist`).
7. Al terminar cada funcionalidad, actualiza la sección "Decisiones" del `README.md` con una línea por decisión importante y su porqué.
8. El README dice que esta versión fue construida con Claude Code.
