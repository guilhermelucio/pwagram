/* 
 * `self` refers to the serviceWorker
 * NOTE - The service worker does not have access to the DOM
 */

// Lifecycle event
self.addEventListener('install',  event => {
    console.log('[Service Worker] Installing service worker...', event);
    /** 
     * cache.open is a promise, thus make sure it ends before self.clients.claim
     * is called, which consumes the cached files
     */
    event.waitUntil(
        caches.open('pwagram-static')
            .then(cache => {
                console.log('[Service Worker] Precaching App Shell');
                /**
                 * add takes a request, fires and store the result in the cache
                 */
                cache.addAll([
                    '/',
                    '/index.html',
                    '/src/js/app.js',
                    '/src/js/feed.js',
                    '/src/js/material.min.js',
                    '/src/css/app.css',
                    '/src/css/feed.css',
                    '/src/images/main-image.jpg',
                    'https://fonts.googleapis.com/css?family=Roboto:400,700',
                    'https://fonts.googleapis.com/icon?family=Material+Icons',
                    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
                ]);
            })
    );
});

// Lifecycle event
self.addEventListener('activate', event => {
    // console.log('[Service Worker] Activating service worker...', event);
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    // console.log('[Service Worker] Fetching something...', event);
    // A service worker can be used as a kind of proxy

    const cacheDynamicFiles = (response) => {
        /**
         * `put` does do any request, just stores data, different than `add`
         */
        return caches.open('pwagram-dynamic')
            .then(cache => {
                /**
                 * GOTCHA, response can just be used once, it sounds odd but anyway...
                 * if response is used on the `put` method, the value returned by the
                 * method that also uses response will be `undefined`. Thus in order
                 * to store the value and return it, so that the HTML can render it,
                 * the `cache` put method receives a clone of the response
                 */
                cache.put(event.request.url, response.clone());
                return response;
            });
    }

    /**
     * caches.match will look for keys on the application cache,
     * if it finds one that matches the current request fired, it returns the cached
     * file, otherwise it fires a `fetch` request
     */
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return (response) ? response : fetch(event.request).then(cacheDynamicFiles)
            })
    );
});