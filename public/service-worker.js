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

workboxSW.precache([
  {
    "url": "404.html",
    "revision": "0a27a4163254fc8fce870c8cc3a3f94f"
  },
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "c7c83244953794946030d5b2c0002c48"
  },
  {
    "url": "manifest.json",
    "revision": "b32ad6093676adf71adb42c589603f17"
  },
  {
    "url": "offline.html",
    "revision": "db41c48b122db03681cddb5d95c15b0f"
  },
  {
    "url": "service-worker.js",
    "revision": "1b6b565f03a1a14d40d546df8f6145e8"
  },
  {
    "url": "src/css/app.css",
    "revision": "c43a9a16112ae3725fadb8f538dea814"
  },
  {
    "url": "src/css/feed.css",
    "revision": "1a96c73c8c77193256efec326aef973c"
  },
  {
    "url": "src/css/help.css",
    "revision": "1c6d81b27c9d423bece9869b07a7bd73"
  },
  {
    "url": "src/images/icons/app-icon-144x144.png",
    "revision": "83011e228238e66949f0aa0f28f128ef"
  },
  {
    "url": "src/images/icons/app-icon-192x192.png",
    "revision": "f927cb7f94b4104142dd6e65dcb600c1"
  },
  {
    "url": "src/images/icons/app-icon-256x256.png",
    "revision": "86c18ed2761e15cd082afb9a86f9093d"
  },
  {
    "url": "src/images/icons/app-icon-384x384.png",
    "revision": "fbb29bd136322381cc69165fd094ac41"
  },
  {
    "url": "src/images/icons/app-icon-48x48.png",
    "revision": "45eb5bd6e938c31cb371481b4719eb14"
  },
  {
    "url": "src/images/icons/app-icon-512x512.png",
    "revision": "d42d62ccce4170072b28e4ae03a8d8d6"
  },
  {
    "url": "src/images/icons/app-icon-96x96.png",
    "revision": "56420472b13ab9ea107f3b6046b0a824"
  },
  {
    "url": "src/images/icons/apple-icon-114x114.png",
    "revision": "74061872747d33e4e9f202bdefef8f03"
  },
  {
    "url": "src/images/icons/apple-icon-120x120.png",
    "revision": "abd1cfb1a51ebe8cddbb9ada65cde578"
  },
  {
    "url": "src/images/icons/apple-icon-144x144.png",
    "revision": "b4b4f7ced5a981dcd18cb2dc9c2b215a"
  },
  {
    "url": "src/images/icons/apple-icon-152x152.png",
    "revision": "841f96b69f9f74931d925afb3f64a9c2"
  },
  {
    "url": "src/images/icons/apple-icon-180x180.png",
    "revision": "2e5e6e6f2685236ab6b0c59b0faebab5"
  },
  {
    "url": "src/images/icons/apple-icon-57x57.png",
    "revision": "cc93af251fd66d09b099e90bfc0427a8"
  },
  {
    "url": "src/images/icons/apple-icon-60x60.png",
    "revision": "18b745d372987b94d72febb4d7b3fd70"
  },
  {
    "url": "src/images/icons/apple-icon-72x72.png",
    "revision": "b650bbe358908a2b217a0087011266b5"
  },
  {
    "url": "src/images/icons/apple-icon-76x76.png",
    "revision": "bf10706510089815f7bacee1f438291c"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  },
  {
    "url": "src/js/app.js",
    "revision": "76e503fed989f2a84bec16de83f29f7c"
  },
  {
    "url": "src/js/db.js",
    "revision": "98245119deaf3404196ff01607a74d27"
  },
  {
    "url": "src/js/feed.js",
    "revision": "2c7b51a544da038c359e20413aa3c264"
  },
  {
    "url": "src/js/fetch.js",
    "revision": "6b82fbb55ae19be4935964ae8c338e92"
  },
  {
    "url": "src/js/idb.js",
    "revision": "017ced36d82bea1e08b08393361e354d"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.js",
    "revision": "10c2238dcd105eb23f703ee53067417f"
  },
  {
    "url": "sw-base.js",
    "revision": "941424e114d9098df8bcc66ea08f1c6d"
  },
  {
    "url": "sw.js",
    "revision": "3cf01b24c372543b42fe0427012115ff"
  },
  {
    "url": "workbox-sw.prod.v2.1.2.js",
    "revision": "685d1ceb6b9a9f94aacf71d6aeef8b51"
  }
]);

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