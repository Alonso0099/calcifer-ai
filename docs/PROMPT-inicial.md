# Prompt inicial para Claude Code

## Antes de abrir Claude Code (lo haces tú)

1. Crea una carpeta nueva para el proyecto, fuera de cualquier carpeta sincronizada con OneDrive, iCloud o Drive, y ábrela en VS Code.
2. Copia `CLAUDE.md` a la raíz de esa carpeta.
3. Crea la carpeta `docs/source/` y pon ahí:
   - `kitchen-manual-v0.md`: abre el documento "Kitchen Manual v0 — Manual de operaciones", descárgalo como **Markdown** y renómbralo así.
   - `Kitchen_Manual_Final.pdf`: el PDF de Tita.
4. Inicia Git (`git init`) y abre Claude Code en esa carpeta.
5. Pega el prompt de abajo.

---

## Prompt (copiar desde aquí)

Hola. Vamos a construir la app de la cocina descrita en `CLAUDE.md`. Léelo completo primero; sus reglas mandan sobre cualquier cosa de este mensaje.

Trabajaremos por etapas. **No escribas código hasta que yo apruebe cada plan.** Soy estudiante y quiero entender todo, así que explícame cada decisión en lenguaje simple.

### Etapa 1: leer y reportar (sin escribir archivos)

Lee `docs/source/kitchen-manual-v0.md` completo y, del PDF, los capítulos 5–8. Después entrégame un reporte con:

1. **La lista de procesos que encontraste**, agrupados por categoría (`compra`, `guardar`, `preparar`, `limpieza`, `mantenimiento`, `seguridad`), con el id que propones para cada uno.
2. **Pendientes por proceso**: qué datos faltan (tiempo por paso, frecuencia, zona). Ojo: en esta app no hay dueños de tareas, no los busques ni los propongas. No inventes ningún dato faltante.
3. **Contradicciones entre el PDF y la v0** que encuentres. Ya sé que la v0 manda; solo quiero ver la lista, por si se nos pasó alguna.
4. **La lista de zonas** que propones para `zones.json`.
5. **Un ejemplo completo** de 2 procesos en el formato de `processes.json` (uno de limpieza y uno de preparar), y la semana tipo en el formato de `week.json`.
6. **Preguntas** sobre lo que no esté claro.

Espera mi aprobación.

### Etapa 2: proyecto base y contenido

Cuando apruebe el reporte, muéstrame el plan y, con mi aprobación:

1. Crea el proyecto con Vite (React, JavaScript) y la estructura de carpetas de `CLAUDE.md`.
2. Escribe `processes.json`, `week.json` y `zones.json` con **todo** el contenido del manual, marcando como pendiente lo que falte.
3. Escribe `scripts/validate-content.js` y córrelo. Muéstrame cuántos procesos hay y cuántos pendientes.
4. Crea la capa de datos (`src/data/index.js` y `localAdapter.js`) con las funciones de la tabla de `CLAUDE.md`.
5. Crea el README con una sección "Decisiones".

### Etapa 3: funcionalidades, en este orden

Para cada una: plan → mi aprobación → código → explicación de lo que hiciste → commit.

1. **Procesos como tarjetas con checklist.** Lista de tarjetas filtrable por categoría. Al abrir una: los pasos como checklist (cada paso marcado se guarda al momento), el tiempo estimado (o "Pendiente"), un cronómetro que registra los minutos reales al terminar (con la pregunta opcional "¿Quién lo hizo?", que se guarda como nota `doneBy`, nunca como asignación), y la pantalla encendida mientras el proceso está abierto (Wake Lock API, con un aviso si el dispositivo no la soporta). Incluye el botón Deshacer.
2. **Vista semanal.** Los 7 días con sus bloques: proceso y minutos estimados, y el total de minutos del día. Sin nombres de personas ni totales por persona.
3. **Búsqueda.** Por nombre y por texto de los pasos, sin distinguir mayúsculas ni acentos.
4. **Limpieza y mantenimiento.** Tarjetas por zona con un punto de color (el estado de su tarea más atrasada) y, dentro de cada zona, sus tareas con una barra de vencimiento: "Al día", "Vence hoy", "Vence en X días", "Atrasada X días" o "Sin registro". Los umbrales de color van en `constants.js`.
5. **Respaldo.** Botones para descargar el historial como archivo y restaurarlo, con confirmación antes de reemplazar datos.
6. **Notas.** Lista de notas y página de una nota con diseño de hoja de papel con renglones, como dice "Diseño de las notas" en `CLAUDE.md`. Crear, editar y borrar (con Deshacer), y ligar una nota a un proceso de forma opcional. En la tarjeta de un proceso, mostrar sus notas ligadas. Las notas entran en el Respaldo.

### Etapa 4: publicar

Cuando las 6 funcionalidades funcionen, guíame paso a paso para crear el Static Site en Render (build `npm run build`, publish `dist`, rewrite de `/*` a `/index.html`) y para instalar la app en la pantalla de inicio de la tablet.

### Reglas que no cambian

- No agregues funciones que no estén en esta lista. Si se te ocurre una mejora, anótala al final como sugerencia.
- Si un dato no está en el manual, va como pendiente. Nunca lo inventes.
- Comenta cada función y cada componente como dice `CLAUDE.md`.
- Una funcionalidad no importa archivos de otra.

Empieza con la Etapa 1.
