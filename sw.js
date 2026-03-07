// ============================================
// SERVICE WORKER
// ============================================

const CACHE_NAME = 'assistencia-tecnica-v2';

// Detecta automaticamente a pasta do projeto
const BASE_PATH = self.location.pathname.replace('sw.js', '');

const ASSETS_TO_CACHE = [
    BASE_PATH,
    BASE_PATH + 'index.html',
    BASE_PATH + 'dashboard.html',
    BASE_PATH + 'clientes.html',
    BASE_PATH + 'equipamentos.html',
    BASE_PATH + 'ordens-servico.html',
    BASE_PATH + 'estoque.html',
    BASE_PATH + 'relatorios.html',
    BASE_PATH + 'manifest.json',

    BASE_PATH + 'css/styles.css',

    BASE_PATH + 'js/config.js',
    BASE_PATH + 'js/auth.js',
    BASE_PATH + 'js/db.js',
    BASE_PATH + 'js/cloudinary.js',
    BASE_PATH + 'js/pdf-generator.js',
    BASE_PATH + 'js/dashboard.js',
    BASE_PATH + 'js/clientes.js',
    BASE_PATH + 'js/equipamentos.js',
    BASE_PATH + 'js/ordens-servico.js',
    BASE_PATH + 'js/estoque.js',
    BASE_PATH + 'js/relatorios.js',
    BASE_PATH + 'js/app.js'
];

// ============================
// INSTALL
// ============================
self.addEventListener('install', (event) => {

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: caching assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );

    self.skipWaiting();
});

// ============================
// ACTIVATE
// ============================
self.addEventListener('activate', (event) => {

    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            )
        )
    );

    self.clients.claim();
});

// ============================
// FETCH
// ============================
self.addEventListener('fetch', (event) => {

    const { request } = event;

    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Ignora requests externos (CDN, APIs)
    if (url.origin !== location.origin) return;

    // Cache First para assets
    if (
        request.url.includes('/css/') ||
        request.url.includes('/js/') ||
        request.url.includes('/images/')
    ) {

        event.respondWith(

            caches.match(request).then((cached) => {

                if (cached) return cached;

                return fetch(request).then((networkResponse) => {

                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, networkResponse.clone());
                    });

                    return networkResponse;

                });

            })

        );

        return;
    }

    // Network First para páginas HTML
    if (request.headers.get('accept')?.includes('text/html')) {

        event.respondWith(

            fetch(request)

                .then((networkResponse) => {

                    if (networkResponse && networkResponse.status === 200) {

                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, networkResponse.clone());
                        });

                    }

                    return networkResponse;

                })

                .catch(() => {

                    return caches.match(request)
                        .then((cached) => cached || caches.match(BASE_PATH + 'index.html'));

                })

        );

        return;
    }

    event.respondWith(fetch(request));
});

// ============================
// MESSAGES
// ============================
self.addEventListener('message', (event) => {

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

});

console.log('Service Worker ativo');