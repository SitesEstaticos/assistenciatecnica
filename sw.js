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

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Caching assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip external requests
    if (!request.url.includes(self.location.origin)) {
        return;
    }

    // Cache first strategy for assets
    if (request.url.includes('/css/') || request.url.includes('/js/') || request.url.includes('/images/')) {
        event.respondWith(
            caches.match(request).then((response) => {
                return response || fetch(request);
            })
        );
        return;
    }

    // Network first strategy for HTML pages
    event.respondWith(
        fetch(request)
            .then((response) => {
                // Cache successful responses
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Fall back to cache if network fails
                return caches.match(request).then((response) => {
                    return response || new Response('Offline - Page not cached', { status: 503 });
                });
            })
    );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('Service Worker loaded');
