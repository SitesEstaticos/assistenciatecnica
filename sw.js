// ============================================
// SERVICE WORKER
// ============================================

const CACHE_NAME = 'assistencia-tecnica-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/dashboard.html',
    '/clientes.html',
    '/equipamentos.html',
    '/ordens-servico.html',
    '/estoque.html',
    '/relatorios.html',
    '/manifest.json',
    '/css/styles.css',
    '/js/config.js',
    '/js/auth.js',
    '/js/db.js',
    '/js/cloudinary.js',
    '/js/pdf-generator.js',
    '/js/dashboard.js',
    '/js/clientes.js',
    '/js/equipamentos.js',
    '/js/ordens-servico.js',
    '/js/estoque.js',
    '/js/relatorios.js',
    '/js/app.js',
];

// ============================
// INSTALL
// ============================
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Caching assets');
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
                        console.log('Service Worker: Deleting old cache', cacheName);
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

    // Only handle GET requests
    if (request.method !== 'GET') return;

    // Ignore external requests (CDNs, APIs)
    if (!request.url.startsWith(self.location.origin)) return;

    // Cache-first for CSS, JS, images
    if (
        request.url.includes('/css/') ||
        request.url.includes('/js/') ||
        request.url.includes('/images/')
    ) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                return cachedResponse || fetch(request).then((networkResponse) => {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, networkResponse.clone());
                    });
                    return networkResponse;
                });
            })
        );
        return;
    }

    // Network-first for HTML pages
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
                .catch(() =>
                    caches.match(request).then((cachedResponse) => {
                        return cachedResponse || caches.match('/index.html');
                    })
                )
        );
        return;
    }

    // Default fetch
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

console.log('Service Worker loaded and ready');