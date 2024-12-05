const CACHE_NAME = 'non-ho-fumato-cache-v1';
const urlsToCache = [
    '/',
    '/benefici.aspx',
    '/styles/main.css',
    '/scripts/benefici.js',
    '/images/icon-192x192.png',
    '/images/icon-512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Apertura cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('Risorsa trovata nella cache:', event.request.url);
                    return response;
                }
                console.log('Risorsa non trovata nella cache, recupero dalla rete:', event.request.url);
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Cache obsoleta rimossa:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
}); 