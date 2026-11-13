// Una lista de textos con título: se usa para los ingredientes y para las notas del manual.

/**
 * Dibuja un título y una lista. Si la lista no existe o está vacía, no dibuja nada.
 *
 * @param {object} props
 * @param {string} props.title - El título de la sección.
 * @param {string[]|undefined} props.items - Los textos (por ejemplo, process.ingredients).
 * @returns {JSX.Element|null} La sección, o null si no hay nada que mostrar.
 */
export default function TextList({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <h3>{title}</h3>
      <ul>
        {/* Se usa el propio texto como key: dentro de un proceso no se repiten. */}
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
