// El marco de la app: el encabezado que se ve en todas las pantallas
// y el espacio donde se dibuja la pantalla actual.
import { Link, NavLink, Routes, Route } from 'react-router-dom';
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
        <nav className="app-menu" aria-label={text.menu.label}>
          {/* NavLink es un Link que sabe si su pantalla es la actual: le pone la clase "active".
              "end" hace que "/" solo se marque en la pantalla principal y no en todas. */}
          {routes
            .filter((route) => route.menuLabel)
            .map((route) => (
              <NavLink key={route.path} to={route.path} end className="app-menu-link">
                {route.menuLabel}
              </NavLink>
            ))}
        </nav>
      </header>
      <main className="app-main">
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
