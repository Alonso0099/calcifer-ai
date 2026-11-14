// Los botones para filtrar la lista de procesos por categoría.
import { CATEGORIES } from '../../shared/constants.js';
import { text } from '../../shared/text.js';
import './CategoryFilter.css';

/**
 * Una fila de botones: "Todas" y uno por categoría.
 *
 * @param {object} props
 * @param {string|null} props.selected - La categoría elegida, o null si se ven todas.
 * @param {(category: string|null) => void} props.onSelect - Se llama al tocar un botón.
 * @returns {JSX.Element} La fila de botones.
 */
export default function CategoryFilter({ selected, onSelect }) {
  const options = [{ value: null, label: text.processList.all }];
  for (const category of CATEGORIES) options.push({ value: category, label: text.categories[category] });

  return (
    <div className="category-filter" role="group" aria-label={text.processList.filterLabel}>
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          className="button"
          // aria-pressed le dice a un lector de pantalla cuál botón está activo;
          // components.css usa ese mismo dato para dibujarlo hundido y dorado.
          aria-pressed={option.value === selected}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
