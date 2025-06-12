import '../styles/styles.css';
import 'regenerator-runtime';

import App from './pages/app';
import NotificationHelper from './utils/notification-helper';

// Register Service Worker
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Wait for page to load completely
      await new Promise(resolve => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', resolve);
        }
      });

      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered successfully:', registration.scope);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New service worker available');
          }
        });
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  console.log('Service Worker not supported');
  return null;
};

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    navigationDrawer: document.getElementById('navigation-drawer'),
    drawerButton: document.getElementById('drawer-button'),
    content: document.getElementById('main-content'),
  });

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const hash = window.location.hash;

    if (!token && (hash === '#/add-story' || hash === '#/saved-stories')) {
      window.location.hash = '#/login';
      return;
    }

    if (token && (hash === '#/login' || hash === '#/register')) {
      window.location.hash = '#/';
      return;
    }

    app.renderPage();
  };

  window.addEventListener('hashchange', checkAuth);
  window.addEventListener('load', checkAuth);

  // Register service worker
  await registerServiceWorker();
  const token = localStorage.getItem('token');
  if (token) {
    const notificationBtn = document.getElementById('notification-btn');

    if (notificationBtn) {
      notificationBtn.addEventListener('click', async () => {
        const permissionGranted = await NotificationHelper.requestPermission();

        if (permissionGranted) {
          const result = await NotificationHelper.subscribePushNotification(token);

          if (!result.error) {
            notificationBtn.innerHTML = '<i class="fas fa-bell"></i> Notifikasi Aktif';
            notificationBtn.disabled = true;
            alert('Notifikasi berhasil diaktifkan!');
          } else {
            alert(`Gagal mengaktifkan notifikasi: ${result.message}`);
          }
        }
      });
    }
  }
});
