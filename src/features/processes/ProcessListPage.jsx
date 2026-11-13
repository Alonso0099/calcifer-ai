// Pantalla principal: todos los procesos como tarjetas, con filtro por categoría.
import { useSearchParams } from 'react-router-dom';
import { getProcesses } from '../../data/index.js';
import { CATEGORIES } from '../../shared/constants.js';
import { text } from '../../shared/text.js';
import { useLoadedData } from '../../shared/useLoadedData.js';
import CategoryFilter from './CategoryFilter.jsx';
import ProcessCard from './ProcessCard.jsx';
import { groupProcesses } from './groupProcesses.js';
import './ProcessListPage.css';

/**
 * La lista de procesos. La categoría elegida se guarda en la dirección
 * (/?categoria=limpieza) y no en useState: así, al abrir un proceso y volver
 * con el botón "atrás", el filtro sigue como estaba.
 *
 * @returns {JSX.Element} El filtro y las tarjetas, por secciones.
 */
export default function ProcessListPage() {
  // useSearchParams lee y cambia lo que va después del "?" en la dirección.
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: processes, isLoading, hasError } = useLoadedData(getProcesses, []);

  const requested = searchParams.get('categoria');
  const selectedCategory = CATEGORIES.includes(requested) ? requested : null;

  /** Cambia el filtro escribiéndolo en la dirección. */
  function handleSelect(category) {
    setSearchParams(category ? { categoria: category } : {});
  }

  if (isLoading) return <p>{text.common.loading}</p>;
  if (hasError) return <p>{text.common.loadError}</p>;

  const sections = groupProcesses(processes, selectedCategory);
  return (
    <>
      <h2 className="process-list-title">{text.processList.title}</h2>
      <CategoryFilter selected={selectedCategory} onSelect={handleSelect} />
      {sections.length === 0 && <p>{text.processList.empty}</p>}
      {sections.map((section) => (
        <section key={section.title} className="process-list-section">
          <h3>{section.title}</h3>
          <ul className="process-list">
            {section.processes.map((process) => (
              <li key={process.id}>
                <ProcessCard process={process} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
