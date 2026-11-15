# Calcifer

La app de la cocina de Alonso y Tita: el manual de cocina convertido en procesos que se siguen como checklist, con limpieza, mantenimiento, notas y tiempos reales.

Esta versión fue construida con [Claude Code](https://claude.com/claude-code). Las reglas del proyecto están en [`CLAUDE.md`](CLAUDE.md).

## Estado

La fase 1 está terminada y publicada: procesos con checklist, cronómetro y Deshacer; semana tipo; búsqueda; limpieza y mantenimiento por zona; respaldo; y notas.

La fase 2 está en construcción (el orden completo está en `CLAUDE.md`). Ya funcionan: el uso sin conexión, la pantalla **Hoy**, el **menú de la semana**, los ingredientes con cantidad y unidad, el **inventario del congelador**, las **compras** y el **modo de cocina**. Falta: etiquetas imprimibles, bitácora de incidencias, indicadores, y sincronizar dos dispositivos (esto último se deja para el final, porque necesita una cuenta en un servicio externo).

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
- **Service worker escrito a mano** (`public/sw.js`), sin librerías: guarda la app para abrirla sin conexión. La página se pide primero a internet (para ver siempre la versión nueva) y los archivos de `/assets/` salen de la copia guardada, porque su nombre cambia cuando cambia su contenido.
- **Los colores del manifest y de `theme-color` están escritos directo**: esos archivos no pueden leer las variables de CSS.

### Pasos de los preps mensuales (capítulos 3 y 4 del PDF)

- **De esos capítulos solo se tomaron los pasos de preparación**: el lugar de trabajo, los productos, el formato de etiqueta y las reglas siguen saliendo de la v0.
- **La estación de carne va sobre la mesa de IKEA**, no sobre la KARLBY como decía el PDF: la v0 lo cambió (registro de cambios, fila 1).
- **Cada procedimiento con pasos propios es un proceso aparte** (filetes de pechuga, moler carne, papas de desayuno, brócoli para congelar...): así cada uno tiene su checklist y su cronómetro.
- **Dos grupos nuevos en "preparar"**, `prep-carnes` y `prep-verduras`: separan los procedimientos de prep de las recetas.
- **No se copiaron las temperaturas ni las reglas de almacenamiento del PDF** (refri y congelador, air fryer, ajo en aceite): `CLAUDE.md` pide no tomarlas de esos capítulos; si hacen falta, se agregan primero a la v0.
- **Los cortes que el PDF describe sin pasos** (chuletas, cubitos, tilapia...) quedaron como notas del prep de carnes, no como procesos vacíos.

### Fase 2: lenguaje, paleta y uso sin conexión

- **Tareas en lenguaje claro**: cada paso es una acción que se entiende sola, sin palabras del manual que solo conoce quien lo escribió.
- **Sin marcas de aparatos ni nombres propios** en los textos ("la campana", no su marca); el validador las rechaza. Las marcas se quedan en productos de limpieza, que es como se buscan en la tienda.
- **Los ids no cambiaron** aunque algunos lleven una marca (`karlby`, `mesa-ikea`): un id nunca se renombra, y el usuario no lo ve.
- **Paleta cálida de crema, madera y fuego**, con contraste medido: se lee de un vistazo y se siente como una cocina de cuento.
- **Botones y campos con borde fuerte** (`--color-border-strong`, 4.2:1): se ve dónde se puede tocar.
- **Títulos con la tipografía con remates del dispositivo**: aire de libro ilustrado sin descargar fuentes.
- **La app abre sin conexión**: el historial ya vivía en el dispositivo; ahora también la app.

### Fase 2: Hoy y menú de la semana

- **La app abre en "Hoy"**: la comida planeada, las tareas del día y qué descongelar para mañana, sin tener que buscarlo. La lista de recetas y tareas pasó a `/procesos`.
- **Las tareas de hoy se calculan, no se guardan**: salen del menú, de la semana tipo y de las tareas de limpieza vencidas, con una función pura (`buildTodayTasks`).
- **Una tarea se marca hecha sola** cuando su proceso se termina ese día: no hay una segunda casilla que mantener.
- **Si hoy se cocina, aparecen "Limpiar después de cocinar" y "Cerrar la cocina"**; si se come afuera o sobras, no aparece ninguna tarea de cocina.
- **Planear una comida es un evento `meal_planned`**: cambiar o quitar se puede deshacer, entra al respaldo y se sincronizará igual que lo demás.
- **Un momento de comida puede llevar una receta o una opción sin receta** (sobras, comer afuera, algo rápido): el menú real no siempre es una receta.
- **El aviso de descongelar no supone nada**: solo nombra la receta de mañana si es de pollo, cerdo, res o pescado; cuál bolsa sacar lo decide quien cocina.
- **"Lo habitual este día" viene de la semana tipo del manual**: orienta sin obligar; la rotación es flexible.
- **La semana empieza en domingo**, que es el día en que se planea el menú.
- **La semana tipo salió del menú principal** y se abre desde el menú de la semana: con siete secciones la barra ya está llena.

### Fase 2: diseño con relieve y en un solo lugar

- **El diseño vive en dos archivos**: `global.css` tiene los valores (colores y medidas) y `components.css` el aspecto de botones, tarjetas, campos, casillas y barras. Cambiar el estilo de toda la app no toca ninguna pantalla.
- **Las pantallas usan clases compartidas** (`card`, `button`, `tile`, `field`) y su CSS solo acomoda: antes cada tarjeta repetía su borde, fondo y sombra en su propio archivo.
- **Nada es plano**: los botones sobresalen con un canto sólido y se hunden al presionarlos; las tarjetas tienen canto y sombra; campos y barras están hundidos.
- **El relieve se hace con sombras de CSS**, sin imágenes: pesa nada, se ve nítido en cualquier pantalla y sale de las mismas variables de color.
- **Casillas y opciones dibujadas a mano** (32 px, con palomita): grandes, con relieve e iguales en todos los dispositivos.
- **Un filtro elegido se ve hundido y dorado** usando `aria-pressed`: el mismo dato sirve para el lector de pantalla y para el estilo.
- **`prefers-reduced-motion` apaga el movimiento** de los botones.

### Fase 2: ingredientes con cantidad y unidad

- **Cada ingrediente guarda las palabras del manual (`text`) y, aparte, sus piezas** (`name`, `amount`, `unit`): la pantalla sigue mostrando el texto original, y las piezas sirven para sumar cantidades y armar compras.
- **Si el manual no da cantidad, `amount` es `null`**: de 559 ingredientes, 289 traen cantidad; a los demás ("Sal", "Aguacate") no se les inventó una.
- **Los rangos se guardan completos** (`amount` y `amountMax`): "1–1½ lb" no se redondea a un solo número.
- **Las unidades son una lista cerrada** que revisa el validador: un error de dedo en una unidad no pasa.

### Fase 2: inventario del congelador

- **Se cuenta por unidades de proteína, no por gramos**: es como lo cuenta el manual (1 unidad = 4 platos) y no pide báscula.
- **Las metas (10, 6, 5 y 4) y los tiempos máximos están en `freezer.json`**, tomados del manual: cambiar una meta es cambiar un número del contenido.
- **Lo que falta por comprar se calcula** (meta − existencia, nunca menos de cero); no se guarda en ningún lado.
- **La fecha límite de cada bolsa se calcula** con su día de preparación y el tiempo máximo de su corte; una marinada usa el límite de marinadas si es más corto.
- **El inventario solo cambia con una confirmación**: "La usé", "La tiré" o "Agregar al congelador". Cocinar una receta no descuenta nada por su cuenta.
- **Lo más viejo va primero** en cada proteína, y se avisa con palabras cuando una bolsa ya venció o le queda un mes.
- **Varias bolsas iguales se registran de una vez**: al terminar la preparación mensual, 6 bolsas de filetes son un solo formulario.
- **Una bolsa puede valer más de 1 unidad**: en pescado, mariscos y paquetes grandes se cuenta la comida, no las bolsas.
- **Sacar o registrar una bolsa se puede deshacer**: son eventos, como todo lo demás.

### Fase 2: compras

- **La lista no se arma a mano: se calcula** con la proteína que falta en el congelador (meta − existencia), los ingredientes de las recetas del menú de los próximos 7 días y lo que se anote a mano.
- **Los ingredientes del menú se suman** por nombre y unidad (2 dientes de ajo + 3 dientes de ajo = 5), y una receta planeada dos veces cuenta doble.
- **No entran los ingredientes opcionales, las unidades de proteína ni las líneas que solo remiten a otra receta**: la proteína ya sale del congelador, y duplicarla confundiría.
- **No resta lo que hay en la despensa, porque no hay inventario de despensa**: la persona marca lo que ya tiene. Un inventario de despensa se decide más adelante.
- **Marcar una casilla es un evento** y marcarla dos veces no duplica nada; se puede deshacer.
- **Terminar la compra no cambia el congelador**: comprar proteína no es lo mismo que porcionarla y congelarla; las bolsas se registran al terminar la preparación mensual.
- **Lo anotado a mano sale de la lista cuando se compra**; lo que no se compró se queda para la siguiente.
- **El menú pasó a tener "Más"**: con nueve secciones la barra de abajo ya no cabía. En teléfono sigue siendo una sola lista; en tablet, "Más" abre un panel encima de la barra.

### Fase 2: conexiones entre pantallas

- **"Hoy" avisa qué hay en el congelador de la proteína de mañana**: cuántas unidades y cuál es la bolsa más vieja. Si no hay ninguna registrada, lo dice. No decide qué bolsa sacar.
- **Al terminar la preparación mensual de carnes se ofrece registrar las bolsas**: un enlace al congelador, no un registro automático, porque el inventario solo cambia con una confirmación.
- **Los enlaces de "siguiente paso" salen de una tabla** (`FOLLOW_UP_ROUTE_BY_PROCESS_ID` en `constants.js`): agregar otro es una línea.

### Fase 2: modo de cocina

- **Un paso a la vez, con letra grande y botones de 64 px**: se usa con las manos ocupadas. "Listo, siguiente" marca el paso (se guarda al momento), "Saltar" avanza sin marcar y "Anterior" regresa.
- **Comparte el cronómetro y las casillas con la pantalla de la receta**: lo que se avanza en el modo de cocina se ve en la receta, y al revés. Por eso el cronómetro, la pantalla encendida y el formulario de terminar se movieron a `src/shared/`.
- **Si se cierra la app a la mitad, se retoma**: los pasos marcados son eventos y la sesión empieza en el primer paso que falta.
- **Los temporizadores los pone la persona** (5, 10, 15, 30 minutos u otros): el manual no da tiempo por paso y no se inventan. Se pueden tener varios a la vez y sobreviven a recargar, porque guardan la hora de término.
- **Un temporizador que termina avisa por escrito, con pitido y con vibración si el dispositivo puede, y dice que se revise la comida**: un temporizador no confirma que algo esté cocido.
- **El sonido se prepara en el toque que pone el temporizador**: Safari y Chrome no dejan sonar audio que no nace de un toque, y la primera versión creaba el sonido al terminar, sin toque, así que en el iPhone nunca sonaba.
- **Los pitidos son un archivo de audio generado en la app** (`lib/wav.js`), sin descargar nada: funciona sin conexión.
- **Botón "Probar sonido"** junto a los temporizadores, y aviso visual fuerte: la tarjeta late y el título de la pestaña cambia.
- **En iPhone no hay vibración**: Safari no permite que una página web vibre. Con la app cerrada tampoco hay aviso: necesitaría notificaciones con un servidor, que se dejan para el final.
- **Los temporizadores no se pueden avisar con la app cerrada**: eso requeriría notificaciones, que están pendientes de decidir.
- **Antes de registrar hay que confirmar**: "revisé que está bien cocida (la temperatura la medí yo)" y "guardé lo que sobró y empaqué los almuerzos". Solo aparecen las que aplican a esa receta.
- **El ajuste de tamaño (la mitad, normal, el doble) solo cambia las cantidades que se muestran** y la pantalla lo dice: no ajusta pasos, tiempos ni temperaturas. Sin unidad se escribe "cebolla en tiras: 2" porque no se pone un nombre en plural de forma segura.
- **El aviso de "app no instalada" se oculta en el modo de cocina**: ahí estorba.

### Ajustes después de probar en casa

- **El botón del modo paso a paso dice lo que se va a hacer**: "Cocinar", "Preparar", "Limpiar", "Guardar", "Revisar" o "Seguir paso a paso", según el tipo de proceso. Los textos están en una tabla de `text.js`, y la dirección pasó de `/cocinar` a `/paso-a-paso`, porque no todo es cocinar.
- **Los almuerzos se empacan de domingo a jueves**: el dato vive en `week.json` (`packLunchForTomorrow`), como lo dice la semana tipo del manual, y no escondido en el código.
- **Un paso puede depender de ese dato** (`onlyIfPackingLunch`): el viernes y el sábado no aparecen "empacar los almuerzos" ni su confirmación, y no cuentan en el avance.
- **La confirmación final se separó en dos**: "Guardé lo que sobró" sale siempre en las recetas que dejan sobras; "Empaqué los 2 almuerzos" solo los días en que se empaca.
- **Las dos pantallas cargan el proceso igual** (`loadProcessForToday` en `shared/`): la receta y el paso a paso muestran exactamente los mismos pasos.
- **"En curso" en Hoy**: todo lo empezado y no terminado (pasos marcados, cronómetro con tiempo o temporizadores) aparece arriba, con su avance y su reloj, para no perderlo. Se puede continuar donde se quedó, pausar o descartar.
- **Descartar es un solo evento (`process_discarded`)**: desmarca todos los pasos de una vez y Deshacer los recupera de un toque. También pone el cronómetro en cero y quita los temporizadores de ese proceso, pero nunca borra la tarea, sus pasos ni el historial.
- **Cada temporizador recuerda de qué proceso es**: así aparece debajo del proceso correcto en "En curso".
- **El adaptador local se dividió**: notas y respaldo pasaron a sus propios archivos para que ninguno pase de 150 líneas.

