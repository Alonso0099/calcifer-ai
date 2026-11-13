// El menú principal. En teléfono es un botón que despliega las secciones;
// en tablet es una barra fija abajo. El cambio entre uno y otro lo hace el CSS.
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { text } from '../shared/text.js';
import { routes } from './routes.jsx';
import './MainMenu.css';

/**
 * Dibuja el menú con las rutas que tienen "menuLabel". Es un solo menú para los dos
 * tamaños de pantalla: el estado "isOpen" solo importa en teléfono, donde decide si
 * la lista se ve; en tablet la lista siempre se ve y el botón se oculta.
 *
 * @returns {JSX.Element} El botón de menú y la lista de secciones.
 */
export default function MainMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRoutes = routes.filter((route) => route.menuLabel);

  return (
    <nav className="main-menu" aria-label={text.menu.label}>
      <button
        type="button"
        className="button main-menu-toggle"
        // aria-expanded le dice a un lector de pantalla si el menú está abierto.
        aria-expanded={isOpen}
        aria-controls="main-menu-links"
        onClick={() => setIsOpen(!isOpen)}
      >
        {text.menu.toggle} <span aria-hidden="true">{isOpen ? '▴' : '▾'}</span>
      </button>
      <div id="main-menu-links" className={isOpen ? 'main-menu-links main-menu-links-open' : 'main-menu-links'}>
        {/* NavLink es un Link que sabe si su pantalla es la actual: le pone la clase "active".
            "end" hace que "/" solo se marque en la pantalla principal y no en todas. */}
        {menuRoutes.map((route) => (
          <NavLink key={route.path} to={route.path} end className="main-menu-link" onClick={() => setIsOpen(false)}>
            {route.menuLabel}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
