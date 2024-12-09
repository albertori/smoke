const CACHE_NAME = 'nosmokingarea-v1';
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const ASSETS_TO_CACHE = [
    '/benefici.aspx',
    '/Scripts/benefici.js',
    '/Scripts/translations.js',
    '/Scripts/switchMode.js',
    '/Styles/benefici.css',
    
    // Icone
    '/images/icon-114x114.png',
    '/images/icon-120x120.png',
    '/images/icon-144x144.png',
    '/images/icon-152x152.png',
    '/images/icon-16x16.png',
    '/images/icon-180x180.png',
    '/images/icon-192x192.png',
    '/images/icon-32x32.png',
    '/images/icon-48x48.png',
    '/images/icon-512x512.png',
    '/images/icon-57x57.png',
    '/images/icon-60x60.png',
    '/images/icon-72x72.png',
    '/images/icon-76x76.png',
    '/images/icon-96x96.png',
    
    // Screenshot
    '/images/screenshot-desktop.png',
    '/images/screenshot-mobile.png',
    '/images/screenshot1.png',
    '/images/screenshot2.png',
    
    // Splash screens
    '/images/splash-1125x2436.png',
    '/images/splash-1242x2208.png',
    '/images/splash-1536x2048.png',
    '/images/splash-1668x2388.png',
    '/images/splash-2048x2732.png',
    
    // CDN resources
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
];

function isResponseExpired(response) {
    if (!response) return true;
    const dateHeader = response.headers.get('date');
    if (!dateHeader) return true;
    const date = new Date(dateHeader);
    const age = Date.now() - date.getTime();
    return age > CACHE_MAX_AGE;
}

self.addEventListener('install', (event) => {
    console.log('Service Worker: Installazione');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching files');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Attivazione');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    const requestPath = url.pathname;
    
    // Gestione speciale per le richieste POST
    if (event.request.method === 'POST') {
        event.respondWith(
            fetch(event.request.clone())
                .catch(error => {
                    console.log('Richiesta offline, invio dati di fallback');
                    return new Response(
                        JSON.stringify({ 
                            d: {
                                sigarette: "0",
                                risparmio: 0,
                                catrame: "0",
                                tempo: "0"
                            }
                        }),
                        { 
                            status: 200, 
                            headers: { 'Content-Type': 'application/json' } 
                        }
                    );
                })
        );
        return;
    }

    // Gestione normale per le altre richieste
    event.respondWith(
        caches.match(requestPath)
            .then(cachedResponse => {
                const fetchPromise = fetch(event.request)
                    .then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(requestPath, responseToCache);
                                    console.log('Cache aggiornata:', requestPath);
                                });
                        }
                        return networkResponse;
                    })
                    .catch(error => {
                        console.log('Fetch fallito, uso cache:', requestPath);
                        if (event.request.mode === 'navigate') {
                            return caches.match('/offline.html');
                        }
                        return cachedResponse || caches.match('/offline.html');
                    });

                if (cachedResponse && !isResponseExpired(cachedResponse)) {
                    console.log('Usando cache non scaduta:', requestPath);
                    fetchPromise.catch(() => {});
                    return cachedResponse;
                }

                return fetchPromise;
            })
            .catch(() => {
                return caches.match('/offline.html');
            })
    );
}); 