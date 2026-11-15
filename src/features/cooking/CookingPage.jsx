// Pantalla del modo paso a paso: carga el proceso (receta, limpieza, compra...) y abre la sesión.
import { Link, useParams } from 'react-router-dom';
import { text } from '../../shared/text.js';
import { loadProcessForToday } from '../../shared/loadProcessForToday.js';
import { useLoadedData } from '../../shared/useLoadedData.js';
import CookingSession from './CookingSession.jsx';

/**
 * Lee el proceso de la dirección (/paso-a-paso/pollo-sudado) y abre su sesión, con solo los pasos que tocan hoy.
 * La sesión es un componente aparte para que decida dónde empezar ya con la receta cargada.
 *
 * @returns {JSX.Element} La sesión, o un aviso si la receta no existe o no tiene pasos.
 */
export default function CookingPage() {
  const { processId } = useParams();
  const { data, isLoading, hasError, reload } = useLoadedData(() => loadProcessForToday(processId), [processId]);

  if (isLoading) return <p>{text.common.loading}</p>;
  if (hasError) return <p>{text.common.loadError}</p>;
  const process = data.process;
  if (!process || process.steps.length === 0) {
    return (
      <>
        <p>{process ? text.cooking.noSteps : text.processDetail.notFound}</p>
        <Link to="/procesos">{text.common.back}</Link>
      </>
    );
  }
  // key hace que React cree una sesión nueva si se cambia de receta, en vez de reusar la anterior.
  return <CookingSession key={processId} process={process} packsLunchToday={data.packsLunchToday} reload={reload} />;
}
