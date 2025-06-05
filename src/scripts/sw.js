import 'regenerator-runtime';

const CACHE_NAME = 'dicoding-story-v1';
// Gunakan path relatif terhadap root GitHub Pages
const baseUrl = '/';
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
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.filter((cacheName) => cacheName !== CACHE_NAME).map((cacheName) => caches.delete(cacheName)));
    })
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Skip cross-origin requests
  if (requestUrl.origin !== location.origin && !event.request.url.includes('unpkg.com') && !event.request.url.includes('cdnjs.cloudflare.com') && !event.request.url.includes('fonts.googleapis.com')) {
    return;
  }

  // Handle API requests with network-first strategy
  if (event.request.url.includes('story-api.dicoding.dev')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

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
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
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
      body: event.data ? event.data.text() : 'Notifikasi baru',
    };
  }

  const options = {
    body: notificationData.body || 'Notifikasi baru dari Dicoding Story',
    icon: '/favicon.png',
    badge: '/favicon.png',
    vibrate: [100, 50, 100],
    data: {
      url: notificationData.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(notificationData.title || 'Dicoding Story', options));
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
