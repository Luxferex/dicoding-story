import 'regenerator-runtime';

const CACHE_NAME = 'dicoding-story-v1';
const baseUrl = self.location.pathname.includes('/dicoding-story/') ? '/dicoding-story/' : '/';
const urlsToCache = [
  baseUrl,
  `${baseUrl}index.html`,
  `${baseUrl}favicon.png`,
  `${baseUrl}manifest.json`,
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  ...(self.__WB_MANIFEST || []).map((entry) => entry.url),
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell');
        return cache.addAll(urlsToCache.filter((url) => url));
      })
      .catch((error) => {
        console.error('Cache addAll failed:', error);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // Handle API requests with network-first strategy
  if (event.request.url.includes('story-api.dicoding.dev')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone response before caching
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Handle other requests with cache-first strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((fetchResponse) => {
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
            return fetchResponse;
          }

          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return fetchResponse;
        })
        .catch(() => {
          return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
    })
  );
});

// Push notification event listener
self.addEventListener('push', (event) => {
  let notificationData = {};

  try {
    notificationData = event.data.json();
  } catch (error) {
    notificationData = {
      title: 'Dicoding Story',
      body: event.data ? event.data.text() : 'Ada cerita baru yang tersedia!',
    };
  }

  // Get the correct base URL
  const baseUrl = self.location.origin;
  const appUrl = baseUrl + (self.location.pathname.includes('/dicoding-story/') ? '/dicoding-story/' : '/');

  const options = {
    body: notificationData.body || 'Ada cerita baru di Dicoding Story!',
    icon: `${appUrl}favicon.png`,
    badge: `${appUrl}favicon.png`,
    vibrate: [100, 50, 100],
    data: {
      url: notificationData.url || appUrl,
      timestamp: Date.now(),
    },
    actions: [
      {
        action: 'open',
        title: 'Buka Aplikasi',
        icon: `${appUrl}favicon.png`,
      },
      {
        action: 'close',
        title: 'Tutup',
      },
    ],
    requireInteraction: true,
    tag: 'dicoding-story-notification',
  };

  event.waitUntil(self.registration.showNotification(notificationData.title || 'Dicoding Story', options));
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || self.location.origin;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of windowClients) {
        if (client.url.includes('localhost:9000') || client.url.includes(self.location.origin)) {
          return client.focus();
        }
      }

      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
