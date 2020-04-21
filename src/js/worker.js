var $CACHE = "bolognese-cache-v1";
var $FALLBACK = "/index.html";
var $ASSETS = [
    "/",
    "/index.html",
    "/site.webmanifest",
    "/style/style.css",
    "/style/animate.min.css",
    "/style/milligram.min.css",
    "/style/normalize.css",
    "/script/bundle.js",
    "/script/worker.js",
    "/sounds/owl.mp3",
    "/sounds/duck.mp3"
]

self.addEventListener('install', event => {
    event.waitUntil(
      caches.open($CACHE)
        .then(cache => {
            console.log("Hello there!");
            return cache.addAll($ASSETS);
        })
        .then(() => {
            return self.skipWaiting();
        })
    );
  });

  self.addEventListener('activate', event => {
    event.waitUntil(
      caches.open($CACHE)
        .then(cache => {
          return cache.keys()
            .then(cacheNames => {
              return Promise.all(
                cacheNames.filter(cacheName => {
                  return $ASSETS.indexOf(cacheName) === -1;
                }).map(cacheName => {
                  return caches.delete(cacheName);
                })
              );
            })
            .then(() => {
              return self.clients.claim();
            });
        })
    );
  }); 

self.addEventListener('fetch', event => {
    if (event.request.method === 'GET') {
      let url = event.request.url.indexOf(self.location.origin) !== -1 ?
        event.request.url.split(`${self.location.origin}/`)[1] :
        event.request.url;
      let isFileCached = $ASSETS.indexOf(url) !== -1;

      if (!isFileCached && event.request.mode === 'navigate' && $FALLBACK) {
          url = $FALLBACK;
          isFileCached = $ASSETS.indexOf(url) !== -1;
      }
  
      if (isFileCached) {
        event.respondWith(
          caches.open($CACHE)
            .then(cache => {
              return cache.match(url)
                .then(response => {
                  if (response) {
                    return response;
                  }
                  throw Error('There is not response for such request', url);
                });
            })
            .catch(error => {
              return fetch(event.request);
            })
        );
      }
    }
  });