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
- **Excepción: capítulos 3 y 4.** De ahí sí se toman los **pasos de preparación** del prep mensual de carnes y del prep de verduras, bases y frutas (qué se hace y en qué orden, cortes y tiempos de blanqueado). Todo lo demás de esos capítulos sigue reemplazado por la v0: el lugar de trabajo, los productos, las temperaturas, el formato de etiqueta y las reglas de almacenamiento salen de la v0.
- **Nunca inventes datos.** Si a un proceso le falta algo (tiempo, frecuencia, zona), el valor va en `null` y el nombre del campo se agrega a la lista `pending` de ese proceso. La app muestra esos datos como "Pendiente".

## Fases

La meta de la app es **quitarle carga mental a quien cocina**: la app recuerda, la persona confirma y el sistema se actualiza. Se construye por fases, y cada paso se prueba en la cocina antes de empezar el siguiente.

### Fase 1 (terminada y publicada)

Un solo dispositivo, sin cuentas ni servidor.

1. Procesos como tarjetas, con checklist de pasos, cronómetro y pantalla siempre encendida mientras se cocina.
2. Vista semanal: qué se hace cada día y cuánto tiempo estimado toma, sin nombres de personas ni totales por persona.
3. Búsqueda de procesos.
4. Limpieza y mantenimiento: tarjetas por zona con un indicador de color y barras de vencimiento ("Vence en 3 días", "Atrasada 5 días").
5. Deshacer el último registro.
6. Respaldo: descargar el historial en un archivo y restaurarlo.
7. Notas: crear, editar y borrar notas de texto (título y cuerpo), con la opción de ligarlas a un proceso. Un proceso muestra sus notas ligadas: las pide con `getNotes(processId)` y las dibuja con un componente de `src/shared/components/`, nunca importando archivos de `features/notes/`. La página de notas se ve como una hoja de papel con renglones (ver "Diseño de las notas").

### Fase 2 (en construcción), en este orden

El ciclo que debe funcionar completo es: planear → revisar qué hay → cocinar → empacar → actualizar → cerrar la cocina.

1. **Base.** Funcionar sin conexión; sincronizar el historial entre dos dispositivos (un adaptador nuevo de la capa de datos, sobre los mismos eventos); ingredientes con nombre, cantidad y unidad por separado.
2. **Hoy y menú.** Una pantalla de inicio que dice qué toca hoy (comida, tareas, qué descongelar, almuerzos por empacar) y un menú semanal que se puede cambiar: asignar recetas, mover días, cancelar.
3. **Inventario del congelador** por unidades, con "25 − existencia = a comprar", y la preparación mensual que lo actualiza al confirmar.
4. **Compras**: la lista sale sola del menú y del congelador, y se puede anotar a mano. Terminar la compra no toca el inventario: la proteína entra al congelador cuando se porciona y se registran sus bolsas.
5. **Modo de cocina** (un paso a la vez, con temporizadores; ya construido), etiquetas imprimibles, bitácora de incidencias y los seis indicadores del manual.

Reglas de la fase 2:

- La app nunca cambia el inventario ni marca algo como hecho por suposición: siempre pide confirmación.
- Una tarea aparece cuando toca; no se muestran todas las posibles a la vez.
- Lo que se registra en un lugar no se vuelve a pedir en otro.
- Todo lo nuevo se guarda como eventos (Regla 3): así se puede deshacer, respaldar y sincronizar sin conflictos.
- Seguridad de alimentos: no se inventan tiempos de conservación, un temporizador no confirma que algo está cocido, y las mediciones reales (temperatura, peso) las confirma la persona.

Fuera de alcance (no lo construyas aunque parezca útil): asignar o rotar tareas, perfiles públicos o funciones sociales, gamificación, códigos de barras, publicidad o analíticas de terceros, fotos o archivos en las notas, y una mascota o arte basados en personajes existentes. Las notificaciones se deciden cuando llegue su paso. Escalar porciones: en el modo de cocina hay un ajuste de tamaño (la mitad, normal, el doble) que solo cambia las cantidades que se muestran en los ingredientes; no cambia pasos, tiempos ni temperaturas, ni se guarda.

## Stack fijo

- React + Vite, en **JavaScript** (no TypeScript).
- CSS normal en archivos `.css`. Sin Tailwind ni librerías de componentes.
- Dependencias permitidas: `react`, `react-dom`, `react-router-dom`, `vite`, `@vitejs/plugin-react`. Cualquier otra dependencia necesita aprobación de Alonso antes de instalarse.
- Publicación: GitHub + Render como **Static Site**. Build command `npm install && npm run build` (Render empieza sin dependencias instaladas), publish directory `dist`, y una regla de rewrite de `/*` a `/index.html` para que funcionen las rutas de React Router.

## Reglas de producto

- Pensada primero para celular y tablet. Botones de al menos 44 px, texto legible a un brazo de distancia.
- Interfaz en español. Código en inglés (archivos, componentes, funciones, variables, claves del JSON). Los textos que ve el usuario van en un solo archivo: `src/shared/text.js`.
- La app se instala en la pantalla de inicio (incluye `manifest.webmanifest` e íconos). Safari puede borrar los datos de un sitio que no está instalado; por eso la app muestra un aviso si no se abrió como app instalada.
- **Lenguaje claro.** Cada tarea se escribe como una acción que se entiende sola ("Limpiar el fregadero con ECOS"), sin palabras técnicas ni abreviaturas del manual. Los aparatos, muebles y materiales se nombran por lo que son ("la campana", "la encimera de madera", "la licuadora"), sin marca ni modelo, y no se mencionan nombres de personas ajenas a la casa. Las marcas sí se usan en productos de limpieza ("Krud Kutter") y en ingredientes que se compran por marca. El validador rechaza las marcas de aparatos. Los ids no cambian aunque contengan una marca.
- Funciona sin conexión: un service worker (`public/sw.js`) guarda la app en el dispositivo.
- Zona horaria de la casa: `America/Denver`. Las fechas se guardan en UTC (ISO 8601) y "hoy" se calcula en `America/Denver`.

### Sin dueños

Ninguna tarea tiene un dueño fijo: quién hace cada cosa se decide en el momento, entre Alonso y Tita. Por eso:

- No existe el campo `owner` en ningún JSON, y la app nunca muestra "a cargo de", "le toca a" ni totales por persona.
- Al terminar un proceso, la app pregunta "¿Quién lo hizo?" con tres opciones: Nano, Tita o Ambos (viene elegido "Ambos"). Se guarda como `doneBy` en el evento `process_finished`.
- `doneBy` es solo una **nota de historial**. No asigna nada, no cambia el estado de vencimiento y no se usa para repartir ni rotar tareas. Si se muestra, es como texto pequeño ("Lo hizo Tita"), nunca como un campo de la tarea.

## Colores

La paleta es cálida y acogedora: madera, crema y tonos de fuego, como una cocina de cuento ilustrado. Hay **dos temas fijos**: el **oscuro brasa** (el predeterminado: fondo café rojizo, rojos y naranjas en lo importante y el amarillo solo en detalles pequeños como "Vence pronto") y el **claro crema**. Se eligen en Ajustes (oscuro, claro o como el dispositivo). Todos los colores se definen una sola vez como variables en `src/styles/global.css`, y ningún componente escribe un color directo (`#...`): siempre usa la variable. Así, cambiar un color es cambiar una sola línea.

### El diseño vive en dos archivos

Para cambiar cómo se ve la app no hay que tocar las pantallas:

- `src/styles/global.css`: los **valores**. Colores, y también las medidas del diseño como variables: `--radius-card`, `--radius-control`, `--depth` (cuánto sobresale un botón), `--depth-card`, las tipografías y las sombras.
- `src/styles/components.css`: el **aspecto** de las piezas que se repiten: `.button`, `.card`, `.tile` (renglón tocable), `.field` (campo), casillas, opciones y barras.

El CSS de cada funcionalidad solo acomoda (espacios, columnas, tamaños de texto). Nunca vuelve a definir bordes, fondos, esquinas ni sombras de una tarjeta, un botón o un campo: usa la clase compartida.

El estilo es **con relieve, no plano**: lo que se puede tocar sobresale y se hunde al presionarlo; las tarjetas descansan como tablas, con un canto abajo; los campos y las barras están hundidos. El movimiento es breve y se apaga si el dispositivo pide menos movimiento o si se apaga en Ajustes.

Los contrastes están medidos con la fórmula WCAG sobre el fondo más claro de cada tema (en el oscuro, el café rojizo `--color-bg`) (mínimo 4.5:1 para texto, 3:1 para barras, puntos y bordes de botones y campos). El contraste alto es un requisito, no un adorno: la app tiene que leerse de un vistazo. No uses un color en un papel distinto al de esta tabla sin revisar su contraste.

El tema oscuro va en `:root` y el claro en `:root[data-theme='light']`; `src/shared/deviceSettings.js` pone `data-theme` en `<html>`. Los dos temas definen las mismas variables.

```css
:root {
  /* TEMA OSCURO BRASA (predeterminado): rojos y naranjas; el amarillo solo en detalles */
  --color-bg: #4E2A1E;            /* café rojizo: fondo de la app */
  --color-surface: #33170F;       /* madera vino: tarjetas, encabezado y barra de abajo */
  --color-border: #6E3A28;        /* madera rojiza: divisores (nunca texto) */
  --color-border-strong: #D4A57E; /* madera clara: borde de botones y campos (5.7:1) */
  --color-text: #FFF2D9;          /* crema hogar (11.3:1) */
  --color-text-strong: #FF9966;   /* coral: títulos (6.0:1) */
  --color-text-muted: #E2BFA0;    /* taupe claro (7.3:1) */
  --color-brand: #FF6A3D;         /* rojo brasa: el nombre de la app (5.8:1 sobre el encabezado) */
  --color-brand-flame: #FF9966;   /* coral: las llamas dentro del nombre */
  --color-brand-tip: #FFB27A;     /* durazno: la punta de esas llamas */
  --color-primary: #FF6A3D;       /* rojo brasa, con texto café oscuro (6.1:1) */
  --color-primary-hover: #FF8A5C; /* brasa clara: presionado */
  --color-primary-edge: #B8321A;  /* rojo profundo: canto del botón principal (solo adorno) */
  --color-on-primary: #2B140C;    /* café oscuro */
  --color-highlight: #FFB27A;     /* durazno: avisos y botones elegidos */
  --color-on-highlight: #2B140C;  /* texto sobre el durazno (9.9:1) */
  --color-accent: #FFD84D;        /* amarillo luz: solo adornos pequeños */
  --color-ok: #A8C08A;  --color-ok-text: #A8C08A;    /* verde salvia (6.3:1) */
  --color-due: #FF8A00; --color-due-text: #FFD84D;   /* barra 5.3:1 / texto 9.1:1 */
  --color-late: #E84B2A; --color-late-text: #E79A9A; /* barra 3.3:1 / rosa cálido 5.7:1 */
  --color-cat-compra: #8CBED9; --color-cat-guardar: #A8C08A; --color-cat-preparar: #FF8A00;
  --color-cat-limpieza: #C9B6E4; --color-cat-mantenimiento: #FFD84D; --color-cat-seguridad: #E79A9A;
  /* Además: --shadow-soft, --shine, --sunken y --glow (resplandor de brasas detrás del encabezado). */
}

:root[data-theme='light'] {
  /* TEMA CLARO: fondos de crema cálida */
  --color-bg: #FFF4DF;            /* crema: fondo de la app */
  --color-surface: #FFFBF2;       /* marfil: tarjetas y paneles */
  --color-border: #DDBF94;        /* trigo: divisores y bordes de tarjetas (nunca texto) */
  --color-border-strong: #9A6B3F; /* madera: borde de botones y campos, para que se distingan (4.2:1) */

  /* Texto */
  --color-text: #33241C;          /* café tostado: texto principal (13.7:1) */
  --color-text-strong: #6B2A12;   /* caoba: títulos y énfasis (9.8:1) */
  --color-text-muted: #6A5345;    /* café con leche: texto secundario (6.6:1) */
  --color-brand: #8E2C0E;         /* brasa oscura: el nombre de la app (8.0:1) */
  --color-brand-flame: #B23A15;   /* brasa: las llamas dentro del nombre */
  --color-brand-tip: #D2432A;     /* rojo fuego: la punta de esas llamas (el nombre es texto grande) */

  /* Acciones */
  --color-primary: #B23A15;       /* brasa: botones principales, con texto blanco (6.0:1) */
  --color-primary-hover: #8E2C0E; /* brasa oscura: botón presionado (8.3:1) */
  --color-on-primary: #FFFFFF;    /* blanco: texto sobre los botones brasa */
  --color-primary-edge: #8E2C0E;  /* brasa oscura: canto del botón principal */
  --color-highlight: #F7C65B;     /* dorado: fondo de resaltado */
  --color-on-highlight: #6B2A12;  /* caoba: texto sobre el resaltado (6.7:1) */
  --color-accent: #F47735;        /* llama: solo adornos; nunca texto ni lo único que comunica algo */

  /* Estado de tareas (barras de vencimiento) */
  --color-ok: #5E8A2E;            /* hoja: barra "al día" (3.7:1, solo barra) */
  --color-ok-text: #3A5A14;       /* hoja oscura: texto "al día" (7.3:1) */
  --color-due: #BF7600;           /* ámbar: barra "vence pronto" (3.3:1, solo barra) */
  --color-due-text: #7A4A00;      /* ámbar oscuro: texto "vence pronto" (6.9:1) */
  --color-late: #D2432A;          /* rojo fuego: barra "atrasada" (4.2:1, solo barra) */
  --color-late-text: #8A1F10;     /* rojo ladrillo: texto "atrasada" (8.4:1) */

  /* Categorías (punto de color junto al nombre; el texto siempre va en --color-text) */
  --color-cat-compra: #2F6F93;        /* azul cielo */
  --color-cat-guardar: #3F6B33;       /* verde hierba */
  --color-cat-preparar: #D9622B;      /* naranja fuego */
  --color-cat-limpieza: #8E4F7C;      /* ciruela */
  --color-cat-mantenimiento: #B98300; /* latón */
  --color-cat-seguridad: #A32626;     /* rojo */
  /* --glow: none */
}
```

Reglas de uso:

- El estado de una tarea nunca se comunica solo con color: la barra siempre va con su texto ("Atrasada 5 días"), para que se entienda aunque el color no se distinga bien.
- Los colores de barra (ok, due, late), el borde suave y el adorno nunca se usan como color de texto; para texto se usan sus variables `-text`.
- El texto sobre `--color-highlight` usa `--color-on-highlight`, y el texto sobre `--color-primary` usa `--color-on-primary`. El canto de un botón principal usa `--color-primary-edge`.
- Botones y campos llevan borde `--color-border-strong`, para que se vea dónde se puede tocar.
- `--color-accent` (llama) es solo para adornos pequeños.
- El nombre de la app lleva llamas hechas solo con CSS (`src/app/App.css`): degradados recortados con la forma de las letras que suben y bajan. Son abstractas (sin cara ni ojos) y se quedan quietas si el movimiento está apagado.
- Un color nuevo se agrega en los dos temas, con su contraste medido en cada uno.
- Solo se usan los códigos de color de la paleta; ninguna ilustración ni personaje de la imagen de referencia entra en la app.

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
| `getMealPlan()` | El menú: qué comida está planeada en cada día y momento (desayuno, almuerzo, cena) |
| `planMeal(day, slot, meal)` | Planea, cambia o quita una comida; `meal` es una receta (`kind: "recipe"` y su `processId`), `"leftovers"`, `"eat_out"`, `"quick"` o `"none"` para quitar |
| `getFreezerCatalog()` | Metas de proteína, cortes y tiempos máximos en el congelador (de `freezer.json`) |
| `getFreezer()` | Las bolsas que hay hoy en el congelador |
| `saveFreezerItem(item)` | Registra una bolsa o corrige una existente: corte, si va marinada, unidades y día de preparación |
| `removeFreezerItem(itemId, reason)` | Saca una bolsa: `"cooked"`, `"discarded"` o `"correction"` |
| `getShoppingState()` | Lo anotado a mano en la lista de compras, las casillas marcadas y cuándo se terminó la última compra |
| `addShoppingItem(name)` / `removeShoppingItem(itemId)` | Anota a mano algo que comprar, o lo quita |
| `setShoppingItemChecked(key, isChecked)` | Marca o desmarca un renglón de la lista; si ya está en ese estado no guarda nada |
| `completeShopping()` | Termina la compra: vacía las casillas y saca lo anotado a mano que se compró. No cambia el congelador |
| `undoLastEvent(scope)` | Anula el último evento **del lugar desde donde se tocó Deshacer**, y nada más. `scope` es una tarea (`{ processId }`: solo sus pasos y su terminado o descartado, y solo los de hoy) o una sección (`{ area }`: `planner`, `freezer`, `shopping` o `notes`). Si ahí no queda nada, regresa `null` y no toca nada |
| `getStopwatch(processId)` / `saveStopwatch(processId, stopwatch)` | Lee y guarda el cronómetro en curso de un proceso, para que no se pierda al recargar la página. No es un evento: no entra al historial, al Deshacer ni al respaldo |
| `getAllStopwatches()` | Todos los cronómetros guardados, por proceso |
| `getInProgress()` | Lo empezado y no terminado: procesos con pasos marcados, cronómetro con tiempo o temporizadores puestos |
| `discardProgress(processId)` | Descarta lo empezado: desmarca los pasos (un evento `process_discarded`, que Deshacer revierte), pone el cronómetro en cero y quita sus temporizadores. Nunca borra el proceso, sus pasos ni el historial |
| `getTimers()` / `saveTimers(timers)` | Lee y guarda los temporizadores en curso del modo de cocina. Como el cronómetro, no son eventos: no entran al historial, al Deshacer ni al respaldo |
| `getSettings()` / `saveSettings(settings)` | Lee y guarda los ajustes del dispositivo: `theme` (`dark` · `light` · `auto`), `textSize` (`normal` · `large`), `timerSound` y `motion`. No son eventos: no entran al historial, al Deshacer ni al respaldo |
| `exportBackup()` / `importBackup(file)` | Respaldo y restauración del historial |

`src/data/index.js` elige el adaptador con la variable `VITE_DATA_SOURCE` (por ahora solo existe `local`). Un adaptador futuro (por ejemplo, PostgreSQL en Neon) debe implementar las mismas funciones con los mismos parámetros y resultados, sin cambiar ningún componente.

### Regla 3: eventos, no estados sobrescritos

Cada acción se guarda como un evento nuevo; nunca se edita ni se borra uno anterior.

```js
{
  id: 'uuid generado con crypto.randomUUID()',
  type: 'step_checked' | 'step_unchecked' | 'process_finished' | 'process_discarded' | 'note_saved' | 'note_deleted' | 'meal_planned' | 'freezer_item_saved' | 'freezer_item_removed' | 'shopping_item_added' | 'shopping_item_removed' | 'shopping_item_checked' | 'shopping_item_unchecked' | 'shopping_completed' | 'event_undone',
  processId: 'limpieza-semanal',  // en notas es opcional: null si la nota no está ligada a un proceso. En process_discarded, el proceso cuyos pasos se desmarcan
  stepId: 'paso-3',        // solo en eventos de pasos
  minutes: 42,             // solo en process_finished
  doneBy: 'Tita',          // solo en process_finished; 'Nano' | 'Tita' | 'Ambos' | null. Es una nota, no una asignación
  noteId: 'uuid',          // solo en eventos de notas; el mismo id en todas las versiones de una nota
  title: '...',            // solo en note_saved
  body: '...',             // solo en note_saved
  day: '2026-11-16',       // solo en meal_planned: el día de la casa, sin hora
  slot: 'dinner',          // solo en meal_planned: 'breakfast' | 'lunch' | 'dinner'
  kind: 'recipe',          // solo en meal_planned: 'recipe' | 'leftovers' | 'eat_out' | 'quick' | 'none' (quitar)
  itemId: 'uuid',          // solo en eventos del congelador y de renglones anotados a mano: el mismo id mientras exista
  name: 'Pilas',           // solo en shopping_item_added: lo que se anotó a mano
  key: 'protein:pollo',    // solo en shopping_item_checked/unchecked: qué renglón ('protein:id', 'menu:nombre|unidad' o 'manual:itemId')
  checkedCount: 3,         // solo en shopping_completed: cuántos renglones estaban marcados
  cutId: 'pollo-filetes',  // solo en freezer_item_saved: un corte de freezer.json
  marinated: false,        // solo en freezer_item_saved
  units: 1,                // solo en freezer_item_saved: cuántas unidades trae la bolsa
  prepDay: '2026-11-07',   // solo en freezer_item_saved: día de preparación
  reason: 'cooked',        // solo en freezer_item_removed: 'cooked' | 'discarded' | 'correction'
  targetEventId: '...',    // solo en event_undone
  createdAt: '2026-11-13T02:15:00.000Z'
}
```

En el menú, cada día y momento muestra el último `meal_planned` guardado ahí (`kind: 'none'` lo deja vacío).

Una bolsa del congelador existe desde su último `freezer_item_saved` hasta un `freezer_item_removed`. Lo que falta por comprar (meta − existencia) y la fecha límite de cada bolsa se calculan; no se guardan.

La lista de compras no se guarda: se arma cada vez con lo que falta en el congelador, los ingredientes de las recetas del menú de los próximos 7 días y lo anotado a mano. Las casillas marcadas son eventos y se vacían con `shopping_completed`.

Una nota se ve siempre en su versión más reciente (el último `note_saved` con su `noteId`), a menos que exista un `note_deleted` posterior.

Deshacer nunca es global: cada botón solo anula registros de su tarea o de su sección (`src/lib/undoScope.js`). Por eso deshacer de más en una tarea no puede quitar una comida del plan de hoy ni tocar otra tarea; el plan solo cambia desde el Menú.

Los pasos marcados de un proceso son los posteriores a su último `process_finished` o `process_discarded`. Descartar no cuenta como terminado.

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
- `steps`: lista de pasos (`id`, `text`, `minutes`). Si el manual todavía no da los pasos, va `[]` y se agrega `"steps"` a `pending`. Un paso puede llevar `"onlyIfPackingLunch": true`: entonces solo aparece los días en que se empacan los almuerzos de mañana (según `week.json`).
- `minutes` de cada paso: un solo número **medido** en la cocina, o `null` mientras no se mida. Nunca se llena con un estimado.
- `pending`: los nombres de los campos que faltan (`"estimatedMinutes"`, `"steps"`, `"steps.minutes"`). Lista vacía si no falta nada. Un `null` permitido por diseño no es un pendiente: `zone` en una receta, o `frequencyDays` en una receta o en una tarea diaria.
- Minutos por paso en `pending`: mientras ningún paso esté medido, va una sola entrada `"steps.minutes"`. Cuando se mide el primero, esa entrada se cambia por una por cada paso que todavía falte (`"steps.paso-2.minutes"`, `"steps.paso-5.minutes"`).

Campos opcionales (solo se escriben cuando aplican):

- `ingredients`: lista de ingredientes, para recetas y marinadas. Cada uno es un objeto:

  ```json
  { "text": "1–1½ lb de cerdo en trocitos", "name": "cerdo en trocitos", "amount": 1, "amountMax": 1.5, "unit": "lb" }
  ```

  - `text`: las palabras del manual. Es lo que se muestra y lo que se busca; los demás campos lo parten en piezas para poder sumar cantidades y armar compras.
  - `name`: el ingrediente sin cantidad ni unidad.
  - `amount`: número, o `null` si el manual no da cantidad ("Sal"). Nunca se inventa. `amountMax` solo se escribe si el manual da un rango.
  - `unit`: `cda` | `cdta` | `taza` | `lb` | `oz` | `lata` | `diente` | `pizca` | `tallo` | `unidad`, o `null` cuando se cuenta por piezas ("2 cebollas") o no hay cantidad.
  - `optional: true` si el manual lo marca como opcional, y `section` ("Salsa") si el ingrediente pertenece a una parte de la receta. Solo se escriben cuando aplican.
- `notes`: lista de textos con lo que el manual dice del proceso y no es ingrediente ni paso: rendimiento ("Rinde 1 unidad"), con qué proteína es compatible una marinada, cuánto puede esperar después de descongelar, o el armado de Tita y el de Alonso en un desayuno. Son contenido del manual, de solo lectura; no confundir con las notas que escribe el usuario (funcionalidad 7).
- `group`: solo en `preparar`, para dividir la categoría en la pantalla: `prep-carnes` | `prep-verduras` | `pollo` | `cerdo` | `res` | `seafood` | `sopas` | `flex` | `desayunos` | `marinadas`. Los dos primeros son los procedimientos de los preps mensuales; los demás, recetas. Los procesos generales de `preparar` (menú, servicio diario, los dos preps completos) no lo llevan.

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
- `packLunchForTomorrow`: `true` si ese día se empacan los almuerzos del día siguiente. Según la semana tipo del manual, de domingo a jueves; viernes y sábado no, porque el fin de semana no se empaca.
- `blocks`: los bloques del día, cada uno con `processId` y `estimatedMinutes` (misma forma que en los procesos, o `null`). Un día de descanso lleva `[]`.
- `everyWeeks`: opcional; cada cuántas semanas toca el bloque. Si no está, el bloque es de todas las semanas.

`src/content/freezer.json`: el inventario objetivo del congelador. Por cada proteína (`pollo`, `cerdo`, `res`, `seafood`): su meta en unidades (`target`) y sus cortes, cada uno con `useByMonths` (el tiempo máximo en el congelador según el manual). `marinatedUseByMonths` es el límite para cualquier proteína marinada.

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
│   ├── today/             (pantalla de inicio: qué toca hoy)
│   ├── planner/           (menú de la semana y selector de comidas)
│   ├── cooking/           (modo paso a paso, en /paso-a-paso: un paso a la vez, temporizadores, confirmación final)
│   ├── processes/         (tarjetas, detalle, checklist)
│   ├── week/              (vista semanal)
│   ├── search/            (búsqueda)
│   ├── freezer/           (inventario del congelador)
│   ├── shopping/          (lista de compras)
│   ├── maintenance/       (zonas y barras de vencimiento)
│   ├── notes/             (lista de notas, hoja de una nota)
│   ├── settings/          (ajustes del dispositivo: tema, letra, sonido, movimiento; abre el respaldo)
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
    ├── global.css         (variables de color y de medidas, tipografía y base)
    └── components.css     (aspecto compartido: botones, tarjetas, campos, casillas, barras)
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
