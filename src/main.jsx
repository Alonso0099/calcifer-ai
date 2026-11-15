// Punto de entrada de la app: conecta React con la página (index.html)
// y carga los estilos que comparten todas las pantallas.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// Los estilos base se importan antes que App: así los estilos de cada componente,
// que se cargan después, pueden ajustar los de base (por ejemplo, un botón elegido).
import './styles/global.css';
import './styles/components.css';
import App from './app/App.jsx';
import { getSettings } from './data/index.js';
import { applySettings } from './shared/deviceSettings.js';

/**
 * Dibuja la app.
 * createRoot le dice a React en qué elemento del HTML debe dibujar.
 * StrictMode solo actúa mientras se programa: avisa de errores comunes.
 * BrowserRouter permite que la dirección del navegador (/, /semana, ...)
 * decida qué pantalla se muestra, sin recargar la página.
 */
function renderApp() {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}

// Los ajustes (colores, tamaño de letra) se aplican antes de dibujar, para que la app no
// aparezca un instante con otros colores. Si no se pueden leer, la app se dibuja igual.
getSettings().then(applySettings).finally(renderApp);

// Registra el service worker (public/sw.js), que guarda la app para usarla sin conexión.
// Solo en la versión publicada: mientras se programa estorbaría, porque serviría archivos viejos.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
