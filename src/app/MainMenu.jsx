// El menú principal. En teléfono es un botón que despliega todas las secciones; en tablet es una
// barra fija abajo con las secciones de cada día y un botón "Más" para el resto. Lo decide el CSS.
import { useState } from 'react';
import { NavLink, matchPath, useLocation } from 'react-router-dom';
import { text } from '../shared/text.js';
import { routes } from './routes.jsx';
import './MainMenu.css';

/**
 * Dibuja el menú con las rutas que tienen "menuLabel". Las que dicen menuGroup: 'more' van
 * dentro de "Más". Hay un solo menú para los dos tamaños de pantalla: en teléfono "Más" no
 * existe y todo está en la lista desplegable; en tablet la lista de "Más" sale como un panel
 * sobre la barra.
 *
 * @returns {JSX.Element} El botón de menú, las secciones y el panel "Más".
 */
export default function MainMenu() {
  const [isOpen, setIsOpen] = useState(false); // el menú desplegable del teléfono
  const [isMoreOpen, setIsMoreOpen] = useState(false); // el panel "Más" de la tablet
  // useLocation da la dirección actual; sirve para resaltar "Más" cuando se está en una de sus pantallas.
  const location = useLocation();
  const menuRoutes = routes.filter((route) => route.menuLabel);
  const primaryRoutes = menuRoutes.filter((route) => route.menuGroup !== 'more');
  const moreRoutes = menuRoutes.filter((route) => route.menuGroup === 'more');
  const isInMore = moreRoutes.some((route) => matchPath({ path: route.path, end: false }, location.pathname));

  /** Cierra los dos menús al elegir una sección. */
  function closeMenus() {
    setIsOpen(false);
    setIsMoreOpen(false);
  }

  /** Un enlace de una sección. NavLink le pone la clase "active" cuando es la pantalla actual. */
  function renderLink(route) {
    return (
      <NavLink key={route.path} to={route.path} end className="main-menu-link" onClick={closeMenus}>
        {route.menuLabel}
      </NavLink>
    );
  }

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
        {primaryRoutes.map(renderLink)}
        <button
          type="button"
          className={isInMore ? 'main-menu-link main-menu-more-toggle active' : 'main-menu-link main-menu-more-toggle'}
          aria-expanded={isMoreOpen}
          aria-controls="main-menu-more"
          onClick={() => setIsMoreOpen(!isMoreOpen)}
        >
          {text.menu.more}
        </button>
        <div id="main-menu-more" className={isMoreOpen ? 'main-menu-more main-menu-more-open' : 'main-menu-more'}>
          {moreRoutes.map(renderLink)}
        </div>
      </div>
    </nav>
  );
}
