const CACHE_NAME = 'amantra-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/dashboard.html',
    '/signin.html',
    '/signup.html',
    '/profile.html',
    '/newbond.html',
    '/bondhistory.html',
    '/allrequests.html',
    '/lenderbondview.html',
    '/recipientbondview.html',
    '/requestchange.html',
    '/reviewrequestchange.html',
    '/calendar.html',
    '/manifest.json',
    '/assets/icon.svg',
    '/assets/icon-192.svg',
    '/assets/icon-512.svg',
    '/js/pwa-register.js',
    // Add other local JS files if needed, or rely on dynamic caching
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests like Firebase/Google Fonts/CDN inside the SW for now to avoid CORS issues if not handled carefully, 
    // OR handle them with StaleWhileRevalidate.
    // For simplicity, mostly Cache First for local assets, Network First for HTML navigation to ensure fresh content.

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(event.request);
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});
