/* 
 * `self` refers to the serviceWorker
 * NOTE - The service worker does not have access to the DOM
 */

// Lifecycle event
// self.addEventListener('install',  event => (
//     console.log('[Service Worker] Installing service worker...', event)
// ));

// Lifecycle event
// self.addEventListener('activate', event => (
//     console.log('[Service Worker] Activating service worker...', event)
// ));

self.addEventListener('fetch', event => {
    // console.log('[Service Worker] Fetching something...', event);

    // A service worker can be used as a kind of proxy
    event.respondWith(fetch(event.request));
});