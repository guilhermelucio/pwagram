importScripts('https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.js')
importScripts('/src/js/idb.js');
importScripts('/src/js/db.js');

const CACHE_STATIC_NAME = 'pwgram-static-v4.2.5';
const CACHE_DYNAMIC_NAME = 'pwgram-dynamic-v4.2.5';
const POSTS_REQUEST = 'https://pwa-gram-7e675.firebaseio.com/posts.json';

/* 
 * `self` refers to the serviceWorker
 * NOTE - The service worker does not have access to the DOM
 */

function trimCache(cacheName, maxItems) {
    caches.open(cacheName)
        .then(cache => cache.keys()
            .then(keys => {
                if (keys.length > maxItems) {
                    cache.delete(keys[0])
                        .then(trimCache(cacheName, maxItems));
                }
            })
        );
}

// Lifecycle event
self.addEventListener('install',  event => {
    console.log('[Service Worker] Installing service worker...', event);
    /** 
     * cache.open is a promise, thus make sure it ends before self.clients.claim
     * is called, which consumes the cached files
     */
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(cache => {
                console.log('[Service Worker] Precaching App Shell');
                /**
                 * add takes a request, fires and store the result in the cache
                 */
                cache.addAll([
                    '/',
                    '/index.html',
                    '/offline.html',
                    '/src/js/app.js',
                    '/src/js/idb.js',
                    '/src/js/feed.js',
                    '/src/js/material.min.js',
                    '/src/css/app.css',
                    '/src/css/feed.css',
                    '/src/images/main-image.jpg',
                    'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.js',
                    'https://fonts.googleapis.com/css?family=Roboto:400,700',
                    'https://fonts.googleapis.com/icon?family=Material+Icons',
                    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
                ]);
            })
    );
});

// Lifecycle event
self.addEventListener('activate', event => {
    /**
     * Safe place to clean the previous cache version, because the installation
     * occurs when all the tabs were closed and a new version will be installed
     */
    event.waitUntil(
        caches.keys()
            .then(keylist => {
                const promises = keylist.map(key => {
                    if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                        console.log('[Service Worker] Removing old cache', key);
                        return caches.delete(key);
                    }
                });
                return Promise.all(promises);
            })
    )

    // console.log('[Service Worker] Activating service worker...', event);
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    // console.log('[Service Worker] Fetching something...', event);
    // A service worker can be used as a kind of proxy

    // url that will use the request and cache strategy
    let url = POSTS_REQUEST;

    /**
     * Fallback when there is no network and the files were not being cached
     */
    const openOfflinePage = () => {
        return caches.open(CACHE_STATIC_NAME)
            .then(cache => {
                if (event.request.headers.get('accept').includes('text/html')) {
                    return cache.match('/offline.html');
                }
            });
    };

    /**
     * After receiving a response from the server, first adding the file received
     * to the dynamic cache, then returning the response.
     * NOTE
     * It's important to note that all normal request will pass here, thus
     * all the content will be placed on the cache
     * NOTE
     * Despite saving on the cache, it's important to return the `response` object
     * since the javascript file that sent the request is waiting for a response
     * NOTE - GOTCHA
     * response can just be used once, it sounds odd but anyway...
     * if response is used on the `put` method, the value returned by the
     * method that also uses response will be `undefined`. Thus in order
     * to store the value and return it, so that the HTML can render it,
     * the `cache` put method receives a clone of the response
     */
    const cacheDynamicFiles = (response) => {
        if (response) return response;
        return fetch(event.request).then(response => {
            return caches.open(CACHE_DYNAMIC_NAME)
                .then(cache => {
                    // Clean cache adding a limit of 100 items
                    trimCache(CACHE_DYNAMIC_NAME, 100);

                    /**
                     * `put` does do any request, just stores data, different than `add`
                     */
                    cache.put(event.request.url, response.clone());
                    return response;
                });
        });
    };

    /**
     * Using the network-cache strategy for the request set at the `url` variable
     * which generally means highly dynamic requests that must reach the internet every time
     */
    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const res = response.clone();
                    clearData('posts')
                        .then(() => res.json())
                        .then(posts => _.map(posts, post => {
                            return writeData('posts', post);
                        }));
                    return response;
                })
        );
    } else {
        /**
         * Responding with cache first, network request fallback strategy for all the mormal assets,
         * such as css files, js files and so on
         */
        event.respondWith(
            caches.match(event.request)
                .then(cacheDynamicFiles)
                .catch(openOfflinePage)
        );
    }
});

/**
 * This event occurs whenever the Service Worker believes the connection was re-established,
 * or if the connection was already there when registered
 */
self.addEventListener('sync', event => {
    console.log('[Service Worker] Background sync', event);

    switch (event.tag) {
        case 'sync-new-post':
            console.log('[Service Worker] Sync New Post');
            event.waitUntil(
                readAllData('sync-posts')
                    .then(posts => {
                        console.log(posts);
                        posts.map(post => {
                            fetch('https://us-central1-pwa-gram-7e675.cloudfunctions.net/storePostData', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Accept': 'application/json'
                                },
                                body: JSON.stringify({
                                  id: post.id,
                                  title: post.title,
                                  location: post.location,
                                  image: post.image
                                })
                              })
                                .then((res) => {
                                    if (res.ok) {
                                        res.json().then(resData => {
                                            return deleteItem('sync-posts', resData.id);
                                        })
                                    }
                                })
                                .catch(err => console.error(err));
                            });
                        })
                    );
            break;
    }
});

/**
 * Whenever the user interacts with the notification system
 */
self.addEventListener('notificationclick', event => {
    const notification = event.notification;
    const action = event.action;

    if (action === 'confirm') {
        console.log('[SW Notification] confirm clicked');
    } else {
        console.log('[SW Noticication] generic action');
    }

    notification.close();
});

self.addEventListener('notificationclose', event => {
    console.log('[SW Notification] notification was closed');
});
