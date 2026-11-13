// El marco de la app: el encabezado que se ve en todas las pantallas
// y el espacio donde se dibuja la pantalla actual.
import { Link, Routes, Route } from 'react-router-dom';
import InstallNotice from './InstallNotice.jsx';
import MainMenu from './MainMenu.jsx';
import { routes } from './routes.jsx';
import { text } from '../shared/text.js';
import './App.css';

/**
 * Componente principal. Un componente de React es una función que regresa
 * lo que se debe ver en pantalla, escrito en JSX (HTML dentro de JavaScript).
 *
 * @returns {JSX.Element} El encabezado con el menú y la pantalla que corresponde a la dirección actual.
 */
export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          {/* El nombre de la app siempre regresa a la pantalla principal. */}
          <Link to="/">{text.appName}</Link>
        </h1>
        <MainMenu />
      </header>
      <main className="app-main">
        <InstallNotice />
        {/* Routes revisa la dirección del navegador y dibuja solo la ruta que coincide. */}
        <Routes>
          {/* key le ayuda a React a distinguir cada elemento de una lista. */}
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </main>
    </div>
  );
}
