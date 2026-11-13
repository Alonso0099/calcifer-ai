// Pantalla de búsqueda: encuentra procesos por su nombre o por el texto de sus pasos.
import { useSearchParams } from 'react-router-dom';
import { searchProcesses } from '../../data/index.js';
import { findMatchingStepText } from '../../lib/searchText.js';
import ProcessCard from '../../shared/components/ProcessCard.jsx';
import { text } from '../../shared/text.js';
import { useLoadedData } from '../../shared/useLoadedData.js';
import './SearchPage.css';

/**
 * La búsqueda. Lo escrito se guarda en la dirección (/buscar?q=limon): así, al abrir
 * un resultado y volver con "atrás", la búsqueda y sus resultados siguen ahí.
 *
 * @returns {JSX.Element} El campo de búsqueda y las tarjetas de los resultados.
 */
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  // Cada vez que cambia "query" se vuelve a pedir la búsqueda a la capa de datos.
  const { data: results, hasError } = useLoadedData(() => searchProcesses(query), [query]);

  /** Guarda lo escrito en la dirección. "replace" evita llenar el historial con cada letra. */
  function handleChange(event) {
    const nextQuery = event.target.value;
    setSearchParams(nextQuery ? { q: nextQuery } : {}, { replace: true });
  }

  const hasQuery = query.trim() !== '';
  return (
    <>
      <h2 className="search-title">{text.search.title}</h2>
      <label className="search-field">
        {text.search.inputLabel}
        <input type="search" value={query} placeholder={text.search.placeholder} onChange={handleChange} autoFocus />
      </label>
      {hasError && <p>{text.common.loadError}</p>}
      {!hasQuery && <p className="search-status">{text.search.hint}</p>}
      {hasQuery && results && (
        <>
          {/* role="status" hace que un lector de pantalla anuncie cuántos resultados hay. */}
          <p className="search-status" role="status">
            {results.length === 0 ? text.search.empty : text.search.resultCount(results.length)}
          </p>
          <ul className="search-results">
            {results.map((process) => {
              const matchedStep = findMatchingStepText(process, query);
              return (
                <li key={process.id}>
                  <ProcessCard process={process} />
                  {matchedStep && <p className="search-matched-step">{text.search.matchedStep(matchedStep)}</p>}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}
