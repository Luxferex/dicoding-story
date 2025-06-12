import '../styles/styles.css';
import 'regenerator-runtime';

import App from './pages/app';
import NotificationHelper from './utils/notification-helper';

// Register Service Worker
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      await new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', resolve);
        }
      });

      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registered successfully:', registration.scope);

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

// Function to setup notification button
const setupNotificationButton = () => {
  const token = localStorage.getItem('token');
  const notificationContainer = document.getElementById('notification-container');
  const notificationBtn = document.getElementById('notification-btn');

  if (token && notificationContainer && notificationBtn) {
    // Show notification button for logged in users
    notificationContainer.style.display = 'block';

    // Remove existing event listeners to prevent duplicates
    const newBtn = notificationBtn.cloneNode(true);
    notificationBtn.parentNode.replaceChild(newBtn, notificationBtn);

    newBtn.addEventListener('click', async () => {
      try {
        newBtn.disabled = true;
        newBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

        const permissionGranted = await NotificationHelper.requestPermission();

        if (permissionGranted) {
          const result = await NotificationHelper.subscribePushNotification(token);

          if (!result.error) {
            newBtn.innerHTML = '<i class="fas fa-bell"></i> Notifikasi Aktif';
            newBtn.disabled = true;
            alert('Notifikasi berhasil diaktifkan! Anda akan menerima notifikasi saat ada cerita baru.');
          } else {
            newBtn.innerHTML = '<i class="fas fa-bell"></i> Aktifkan Notifikasi';
            newBtn.disabled = false;
            alert(`Gagal mengaktifkan notifikasi: ${result.message}`);
          }
        } else {
          newBtn.innerHTML = '<i class="fas fa-bell"></i> Aktifkan Notifikasi';
          newBtn.disabled = false;
          alert('Izin notifikasi diperlukan untuk mengaktifkan fitur ini.');
        }
      } catch (error) {
        console.error('Error setting up notification:', error);
        newBtn.innerHTML = '<i class="fas fa-bell"></i> Aktifkan Notifikasi';
        newBtn.disabled = false;
        alert('Terjadi kesalahan saat mengaktifkan notifikasi.');
      }
    });
  } else if (notificationContainer) {
    // Hide notification button for non-logged in users
    notificationContainer.style.display = 'none';
  }
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

    // Setup notification button after auth check
    setupNotificationButton();
  };

  window.addEventListener('hashchange', checkAuth);
  window.addEventListener('load', checkAuth);

  // Register service worker
  await registerServiceWorker();

  // Initial setup
  setupNotificationButton();
});
