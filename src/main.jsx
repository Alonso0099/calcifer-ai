// Punto de entrada de la app: conecta React con la página (index.html)
// y carga los estilos que comparten todas las pantallas.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// Los estilos base se importan antes que App: así los estilos de cada componente,
// que se cargan después, pueden ajustar los de base (por ejemplo, un botón elegido).
import './styles/global.css';
import App from './app/App.jsx';

// createRoot le dice a React en qué elemento del HTML debe dibujar.
// StrictMode solo actúa mientras se programa: avisa de errores comunes.
// BrowserRouter permite que la dirección del navegador (/, /semana, ...)
// decida qué pantalla se muestra, sin recargar la página.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
