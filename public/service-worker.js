const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/index.js',
    '/db.js',
    '/styles.css',
    '/manifest.webmanifest',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

const STATIC_CACHE = 'static-cache';
const DATA_CACHE = 'data-cache';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then((cache) => cache.addAll(FILES_TO_CACHE))
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.url.includes("/api/")) {
        event.respondWith(
            caches.open(DATA_CACHE).then(() => {
                return caches.open(DATA_CACHE).then((cache) => {
                    return fetch(event.request).then((response) => {

                        if (response.status === 200) {
                            cache.put(event.request.url, response.clone())
                        }
                        return response;
                    });
                });
            })
        );
        return;
    }
    event.respondWith(
        fetch(event.request).catch(function () {
            return caches.match(event.request).then(response => {
                if (response) return response;
                if (event.request.headers.get('accept').includes('text/html')) return caches.match('/');
            })
        })
    )
});