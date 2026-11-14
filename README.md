# Calcifer

La app de la cocina de Alonso y Tita: el manual de cocina convertido en procesos que se siguen como checklist, con limpieza, mantenimiento, notas y tiempos reales.

Esta versión fue construida con [Claude Code](https://claude.com/claude-code). Las reglas del proyecto están en [`CLAUDE.md`](CLAUDE.md).

## Estado

Fase 1, en construcción. Ya existen el proyecto base, el contenido del manual, la capa de datos y las seis funcionalidades: procesos como tarjetas con checklist, cronómetro y Deshacer; la vista semanal; la búsqueda; limpieza y mantenimiento por zona; el respaldo; y las notas. La app se puede instalar en la pantalla de inicio. Falta publicarla.

## Cómo correrla

Necesitas Node 22.23.4 (la versión está fijada en `.node-version`).

```bash
npm install        # instala las dependencias (solo la primera vez)
npm run dev        # abre la app en modo desarrollo
npm run validate   # revisa el contenido de src/content/ y lista los pendientes
npm test           # corre las pruebas de src/lib/ y de la capa de datos
npm run build      # valida el contenido y empaqueta la app en dist/
```

## Publicación

La app está publicada en Render como **Static Site**, desde la rama `main`. Cada cambio que llega a `main` se publica solo.

| Ajuste en Render | Valor |
| --- | --- |
| Branch | `main` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Redirects/Rewrites | `/*` → `/index.html`, acción **Rewrite** |

- `npm install` va en el comando porque Render empieza con la carpeta sin dependencias; sin él, Vite no existe y el build falla.
- La regla de rewrite hace que direcciones como `/semana` abran la app en vez de dar "Not Found".
- No hace falta ninguna variable de entorno en Render: `VITE_DATA_SOURCE=local` viene en el archivo `.env` del repo.

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

- **Un JSON por categoría** en `src/content/processes/`: archivos más fáciles de revisar que uno solo con todos los procesos.
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
- **"Preparar" se muestra por grupos** (preps, pollo, cerdo, sopas...): son más de cien procesos y en una sola lista no se encuentra nada.
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

### Búsqueda

- **Lo que se busca vive en la dirección** (`/buscar?q=limon`): al abrir un resultado y volver, la búsqueda sigue ahí.
- **Busca mientras se escribe**, sin botón: el contenido está en el dispositivo y la respuesta es inmediata.
- **También busca en los ingredientes**: "limón" encuentra las marinadas que lo llevan.
- **Si coincidió un paso o un ingrediente y no el nombre, se muestra ese texto**: así se entiende por qué apareció el proceso.
- **`ProcessCard`, `CategoryDot` y `ProcessTime` se movieron a `src/shared/components/`**: ahora los usan dos funcionalidades, y una no puede importar archivos de otra.

### Limpieza y mantenimiento

- **Entran los procesos de limpieza y mantenimiento que tienen zona y frecuencia**: las tareas diarias no llevan "última vez" (regla R5 del manual).
- **Solo se muestran las zonas que tienen tareas**: una tarjeta vacía no dice nada.
- **Los días se cuentan en el calendario de Denver**, no en horas: algo hecho a las 8 pm cuenta como ese día aunque en UTC ya sea el siguiente.
- **"Vence pronto" es a 3 días o menos** (`DUE_SOON_THRESHOLD_DAYS` en `constants.js`): el manual no da el número; lo eligió Alonso.
- **"Sin registro" va antes que "al día"** al ordenar: si no se sabe cuándo se hizo, conviene revisarla.
- **Las zonas se ordenan de la más atrasada a la que está al día**: el manual dice que lo vencido va primero.
- **El estado siempre va escrito** junto al punto y a la barra: el color nunca es la única señal.
- **Para registrar una tarea se abre su proceso y se termina**: así hay un solo lugar donde se guarda un "terminado".
- **`getZones()` se agregó a la capa de datos**: la pantalla necesita las zonas y ningún componente puede importar el JSON.

### Respaldo

- **El respaldo es un archivo JSON con todos los eventos**: como el estado se calcula de los eventos, restaurarlos lo recupera todo, incluidas las notas.
- **El nombre del archivo lleva la fecha de la casa** (`calcifer-respaldo-2026-11-13.json`): varios respaldos se ordenan solos.
- **Restaurar pide confirmación después de elegir el archivo**, mostrando su nombre: es la única acción de la app que reemplaza datos y Deshacer no la revierte.
- **Un archivo que no es un respaldo válido no cambia nada**, y el mensaje lo dice.
- **Los cronómetros en curso no entran al respaldo**: no son parte del historial.

### Notas

- **Una nota es una serie de eventos** (`note_saved`, `note_deleted`): editar no sobrescribe, y por eso borrar o editar se puede deshacer y las notas entran solas al respaldo.
- **La hoja de papel está hecha con CSS**: los renglones son un `repeating-linear-gradient` y el texto usa el mismo alto de línea, así que cae sobre las rayas.
- **La ramita es un SVG original dibujado en código** (un tallo y ocho hojas), con los colores de la paleta; es decorativa y el título le deja libre su esquina.
- **`NotePaper`, `NoteSheet`, `LinkedNotes` y `HerbSprig` viven en `src/shared/components/`**: el detalle de un proceso muestra sus notas sin importar nada de `features/notes/`.
- **Borrar no pide confirmación**: regresa a la lista, que avisa y tiene el botón Deshacer para recuperarla.
- **Una nota nueva abierta desde un proceso ya viene ligada a él** y al guardar regresa a ese proceso.
- **Ligar a un proceso es opcional** y se puede cambiar o quitar al editar.
- **Una nota vacía no se guarda**: debe tener título o texto.

### Menú

- **En teléfono es un botón "Menú" que despliega las secciones; en tablet (700 px o más) es una barra fija abajo**: con seis secciones, el menú de arriba ocupaba dos filas en el teléfono, y en la tablet la barra de abajo queda al alcance de los pulgares.
- **Es un solo componente (`MainMenu`) y el cambio lo hace el CSS** con `@media`: no hay dos menús que mantener.
- **El menú desplegable se cierra al elegir una sección.**

### Instalación

- **`manifest.webmanifest` más las etiquetas de Apple en `index.html`**: Android y Chrome usan el manifest; iPad y iPhone usan sus propias etiquetas.
- **El ícono es la misma ramita de las notas**, dibujada en `public/icons/icon.svg`: arte original y simple, sin personajes. Los PNG se generaron a partir de ese SVG.
- **El dibujo queda dentro del centro del ícono**: así el mismo archivo sirve aunque el sistema lo recorte en círculo ("maskable").
- **El aviso de "no instalada" sale mientras la app se use desde el navegador** y no se puede cerrar: desaparece solo al abrirla instalada, que es cuando el riesgo de perder datos baja.
- **Sin service worker**: la app necesita conexión para abrir. Funcionar sin conexión no está en la fase 1.
- **Los colores del manifest y de `theme-color` están escritos directo**: esos archivos no pueden leer las variables de CSS.

### Pasos de los preps mensuales (capítulos 3 y 4 del PDF)

- **De esos capítulos solo se tomaron los pasos de preparación**: el lugar de trabajo, los productos, el formato de etiqueta y las reglas siguen saliendo de la v0.
- **La estación de carne va sobre la mesa de IKEA**, no sobre la KARLBY como decía el PDF: la v0 lo cambió (registro de cambios, fila 1).
- **Cada procedimiento con pasos propios es un proceso aparte** (filetes de pechuga, moler carne, papas de desayuno, brócoli para congelar...): así cada uno tiene su checklist y su cronómetro.
- **Dos grupos nuevos en "preparar"**, `prep-carnes` y `prep-verduras`: separan los procedimientos de prep de las recetas.
- **No se copiaron las temperaturas ni las reglas de almacenamiento del PDF** (refri y congelador, air fryer, ajo en aceite): `CLAUDE.md` pide no tomarlas de esos capítulos; si hacen falta, se agregan primero a la v0.
- **Los cortes que el PDF describe sin pasos** (chuletas, cubitos, tilapia...) quedaron como notas del prep de carnes, no como procesos vacíos.
