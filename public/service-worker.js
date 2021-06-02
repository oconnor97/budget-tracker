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

const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime-cache';

self.addEventListener('install', event => {
    event.waitUntil(
        caches
            .open(PRECACHE)
            .then(cache => cache.addAll(FILES_TO_CACHE))
            .then(self.skipWaiting())
    );
});
self.addEventListener('active', event => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
        caches
            .keys()
            .then(cachesName => {
                return cachesName.filter(cachesName => !currentCaches.includes(cachesName));
            })
            .then(cachesToDelete => {
                return Promise.all(
                    cachesToDelete.map(cacheToDelete => {
                        return caches.delete(cacheToDelete);
                    })
                );
            })
            .then(() => self.ClientRectList.claim())
    );
});
self.addEventListener('fetch', event => {
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.open(RUNTIME).then(cache => {
                return fetch(event.request).then(response => {
                    if (response.status = 200) {
                        return cache.put(event.request.url, response.clone()).then(() => {
                            return response;
                        });
                    }
                })
                    .catch((err) => {
                        return cache.match(event.request)
                    })
            })
        );
    }
});