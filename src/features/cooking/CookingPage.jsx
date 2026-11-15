// Pantalla del modo de cocina: carga la receta y abre la sesión.
import { Link, useParams } from 'react-router-dom';
import { getProcess } from '../../data/index.js';
import { text } from '../../shared/text.js';
import { useLoadedData } from '../../shared/useLoadedData.js';
import CookingSession from './CookingSession.jsx';

/**
 * Lee la receta de la dirección (/cocinar/pollo-sudado) y abre su sesión de cocina.
 * La sesión es un componente aparte para que decida dónde empezar ya con la receta cargada.
 *
 * @returns {JSX.Element} La sesión, o un aviso si la receta no existe o no tiene pasos.
 */
export default function CookingPage() {
  const { processId } = useParams();
  const { data: process, isLoading, hasError, reload } = useLoadedData(() => getProcess(processId), [processId]);

  if (isLoading) return <p>{text.common.loading}</p>;
  if (hasError) return <p>{text.common.loadError}</p>;
  if (!process || process.steps.length === 0) {
    return (
      <>
        <p>{process ? text.cooking.noSteps : text.processDetail.notFound}</p>
        <Link to="/procesos">{text.common.back}</Link>
      </>
    );
  }
  // key hace que React cree una sesión nueva si se cambia de receta, en vez de reusar la anterior.
  return <CookingSession key={processId} process={process} reload={reload} />;
}
