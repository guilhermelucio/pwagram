importScripts('workbox-sw.prod.v2.1.2.js');
importScripts('/src/js/idb.js');
importScripts('/src/js/db.js');

const workboxSW = new self.WorkboxSW();

workboxSW.router.registerRoute(
    /.*(?:googleapis|gstatic)\.com.*$/,
    workboxSW.strategies.staleWhileRevalidate({ // cache and network strategy
        cacheName: 'google-fonts',
        cacheExpiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 30 // every month
        }
    })
);

workboxSW.router.registerRoute(
    /https:\/\/cdnjs.cloudflare.com.*$/,
    workboxSW.strategies.staleWhileRevalidate({
        cacheName: 'material-css'
    })
);

workboxSW.router.registerRoute(
    /.*(?:firebasestorage.googleapis)\.com.*$/,
    workboxSW.strategies.staleWhileRevalidate({ // cache and network strategy
        cacheName: 'post-images'
    })
);

workboxSW.router.registerRoute(
    'https://pwa-gram-7e675.firebaseio.com/posts.json',
    function (args) {
        return fetch(args.event.request)
            .then(response => {
                const res = response.clone();
                clearData('posts')
                    .then(() => res.json())
                    .then(posts => {
                        for (let key in posts) {
                            writeData('posts', posts[key]);
                        }
                    });
                return response;
        })
    }
);

workboxSW.router.registerRoute(
    routeData => {
        return routeData.event.request.headers.get('accept').includes('text/html');
    },
    args => {
        console.log('called');
        return caches.match(args.event.request)
            .then(response => {
                if (response) return response;
                return fetch(args.event.request)
                    .then(res => {
                        return caches.open('dynamic-cache')
                            .then(cache => {
                                cache.put(args.event.request.url, res.clone());
                                return res;
                            })
                    })
                    .catch(err => {
                        return caches.match('offline.html').then(res => res);
                    })
            })
    }
);

workboxSW.precache([]);

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
                            // Configuring the params with the post data
                            const postData = new FormData();
                            postData.append('id', post.id);
                            postData.append('title', post.title);
                            postData.append('location', post.location);

                            // Despite gets the image, rename it
                            postData.append('image', post.image, post.id+'.png');

                            fetch('https://us-central1-pwa-gram-7e675.cloudfunctions.net/storePostData', {
                                method: 'POST',
                                body: postData
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

        /**
         * `clients` refers to all browsers, windows, tabs or whatever opened
         * on the client machine
         */
        event.waitUntil(
            clients.matchAll()
                .then(clis => {
                    /**
                     * Get the `client` (tab) that's opened
                     * .find is the normal array find method
                     * NOTE
                     * notification.data.url was defined below when a notification
                     * is received
                     **/
                    let client = clis.find(c => c.visibility === 'visible');
                    if (client) {
                        client.navigate(notification.data.url);
                        client.focus();
                    } else {
                        /**
                         * `clients`, the method manage by the serviceWorker
                         */
                        clients.openWindow(notification.data.url);
                    }
                })
        );
    }

    notification.close();
});

self.addEventListener('notificationclose', event => {
    console.log('[SW Notification] notification was closed');
});

self.addEventListener('push', event => {
    console.log('[SW Push] Notification received');
    
    // fallback data object
    let data = { title: 'New!', content: 'Something new happened!', openURL: '/help' };
    if (event.data) data = JSON.parse(event.data.text());

    const options = {
        body: data.content,
        icon: '/src/images/icons/app-icon-96x96.png',
        badge: '/src/images/icons/app-icon-96x96.png',
        data: {
            url: data.openURL
        }
    };

    // self.registration gives access to displaying a new notification
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});