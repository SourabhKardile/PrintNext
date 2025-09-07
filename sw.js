// PrintNext Service Worker for Progressive Web App functionality
const CACHE_NAME = 'printnext-cache-v1';

// Resources to cache immediately
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/print.css',
  '/js/script.js',
  '/js/responsive-images.js',
  '/js/portfolio-loader.js',
  '/js/footer-interactive.js',
  '/images/printnext-logo.png',
  '/images/printnext-full-logo.png',
  '/images/favicon.ico',
  '/manifest.json'
];

// Resources to cache during usage
const RUNTIME_RESOURCES = [
  '/images/services/',
  '/images/portfolio/',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Installation - cache essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch strategy - network first with cache fallback for most resources
self.addEventListener('fetch', event => {
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension') ||
      event.request.url.includes('extension') ||
      !(event.request.url.startsWith('http'))) {
    return;
  }

  // Network first strategy for API calls
  if (event.request.url.includes('.php') || 
      event.request.url.includes('formspree.io') || 
      event.request.url.includes('api')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Don't cache if response is not ok
          if (!response.ok) {
            return response;
          }
          
          // Clone response before using it
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If not in cache and network fails, return offline page
              return caches.match('/');
            });
        })
    );
  } else {
    // Cache first strategy for static resources
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Return cached response immediately
            return cachedResponse;
          }
          
          // If not in cache, fetch from network
          return fetch(event.request)
            .then(response => {
              // Don't cache if response is not ok
              if (!response.ok) {
                return response;
              }
              
              // Clone response before using it
              const responseToCache = response.clone();
              
              // Cache the fetched response
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            })
            .catch(() => {
              // If resource is an image, return a placeholder
              if (event.request.destination === 'image') {
                return caches.match('/images/placeholder.png');
              }
            });
        })
    );
  }
});

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
