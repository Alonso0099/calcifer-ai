// Service worker: un programa pequeño que el navegador deja corriendo aparte de la página.
// Guarda una copia de la app en el dispositivo para que abra aunque no haya internet.
// El historial (pasos, notas, registros) no pasa por aquí: ese ya vive en el dispositivo.

const CACHE_NAME = 'calcifer-app-v1';
// Al buscar una copia guardada se compara solo la dirección. Sin esto, el navegador
// trata como distintos el mismo archivo pedido de dos maneras y no encuentra la copia.
const MATCH_OPTIONS = { ignoreVary: true };
const ALWAYS_CACHED = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png'];

/**
 * Busca en el HTML de la app las direcciones de sus archivos de código y estilos
 * (Vite les pone un nombre distinto en cada versión, por eso no se pueden escribir a mano).
 *
 * @param {string} html - El contenido de index.html.
 * @returns {string[]} Las direcciones que empiezan con /assets/.
 */
function findAssetUrls(html) {
  return [...html.matchAll(/["'](\/assets\/[^"']+)["']/g)].map((match) => match[1]);
}

// "install" ocurre la primera vez que el navegador recibe este archivo:
// se guarda la app completa para poder abrirla después sin conexión.
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const html = await (await fetch('/')).text();
      await cache.addAll([...ALWAYS_CACHED, ...findAssetUrls(html)]);
      // Empieza a funcionar de inmediato, sin esperar a que se cierren las pestañas abiertas.
      await self.skipWaiting();
    })(),
  );
});

// "activate" ocurre cuando este service worker toma el control de la app.
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

/**
 * Pide algo a internet y guarda la respuesta; si no hay conexión, usa la copia guardada.
 * Se usa para la página: así siempre se ve la versión más nueva cuando hay internet.
 *
 * @param {Request} request - Lo que pidió la app.
 * @param {string} fallbackUrl - Qué copia usar si no hay conexión ni copia exacta.
 * @returns {Promise<Response>} La respuesta de internet o la copia guardada.
 */
async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(fallbackUrl ?? request, response.clone());
    return response;
  } catch {
    return (await cache.match(request, MATCH_OPTIONS)) ?? (await cache.match(fallbackUrl ?? request, MATCH_OPTIONS)) ?? Response.error();
  }
}

/**
 * Usa la copia guardada si existe; si no, la pide a internet y la guarda.
 * Se usa para los archivos de /assets/: su nombre cambia cuando cambia su contenido,
 * así que una copia guardada nunca está vieja.
 *
 * @param {Request} request - Lo que pidió la app.
 * @returns {Promise<Response>} La copia guardada o la respuesta de internet.
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, MATCH_OPTIONS);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

// "fetch" ocurre cada vez que la app pide un archivo.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // Solo se atienden lecturas de este mismo sitio; lo demás sigue su camino normal.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // Cualquier pantalla (/semana, /notas...) es la misma página: index.html.
    event.respondWith(networkFirst(request, '/'));
  } else if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});
