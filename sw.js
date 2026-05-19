/* ==========================================================================
   CONFIGURACIÓN DEL SERVICE WORKER (PWA)
   ========================================================================== */
const CACHE_NAME = 'el-informador-v1';

// 1. RUTAS ACTUALIZADAS: Lista de archivos esenciales para funcionamiento offline
const ASSETS_TO_CACHE = [
  '/mi_reporte_pwa/index.html',
  '/mi_reporte_pwa/styles.css',
  '/mi_reporte_pwa/script.js',
  '/mi_reporte_pwa/manifest.json',
  '/mi_reporte_pwa/icon-192x192.png',
  '/mi_reporte_pwa/icon-512x512.png'
];

// EVENTO INSTALACIÓN: Descarga y guarda los recursos en el caché del dispositivo
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Pre-cacheando la nueva estructura de archivos');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Fuerza al SW a activarse inmediatamente
  );
});

// EVENTO ACTIVACIÓN: Limpia cachés antiguos de versiones previas si existieran
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('SW: Eliminando caché antiguo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Toma el control de la PWA de inmediato
  );
});

// EVENTO FETCH: Intercepta las peticiones de red para servir los archivos desde el caché offline
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones de APIs externas como Google Maps o Google Fonts para evitar colisiones
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse; // Devuelve el archivo local si está en caché
        }
        return fetch(event.request); // Si no está, va a internet de forma normal
      })
  );
});
