// Un grupo de botones donde se elige una sola opción (por ejemplo: Oscuro, Claro, Como el dispositivo).

/**
 * Dibuja una fila de botones; el elegido queda hundido (aria-pressed="true"), que además
 * le dice a un lector de pantalla cuál está elegido.
 *
 * @param {object} props - Las "props" son los datos que el componente padre le pasa, como los parámetros de una función.
 * @param {string} props.label - El nombre del grupo, para lectores de pantalla.
 * @param {Array<string|boolean>} props.options - Los valores posibles, en orden.
 * @param {string|boolean} props.value - El valor elegido ahora.
 * @param {(option: string|boolean) => string} props.getName - El texto que se muestra para cada valor.
 * @param {(option: string|boolean) => void} props.onChange - Se llama con el valor tocado.
 * @returns {JSX.Element} La fila de botones.
 */
export default function OptionGroup({ label, options, value, getName, onChange }) {
  return (
    <div className="settings-options" role="group" aria-label={label}>
      {/* key ayuda a React a reconocer cada botón de la lista cuando la vuelve a dibujar. */}
      {options.map((option) => (
        <button key={String(option)} type="button" className="button" aria-pressed={option === value} onClick={() => onChange(option)}>
          {getName(option)}
        </button>
      ))}
    </div>
  );
}
