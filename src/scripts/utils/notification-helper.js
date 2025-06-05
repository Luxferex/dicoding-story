import CONFIG from '../config';
import { subscribeNotification, unsubscribeNotification } from '../data/api';

const NotificationHelper = {
  async requestPermission() {
    if (!('Notification' in window)) {
      console.error('Browser tidak mendukung notifikasi');
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.error('Izin notifikasi tidak diberikan');
      return false;
    }

    return true;
  },

  async subscribePushNotification(token) {
    try {
      if (!('serviceWorker' in navigator)) {
        console.error('Service Worker tidak didukung di browser ini');
        return { error: true, message: 'Service Worker tidak didukung' };
      }

      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        return { error: false, message: 'Sudah berlangganan notifikasi' };
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this._urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
      });

      const subscriptionJson = subscription.toJSON();

      const response = await subscribeNotification({
        token,
        endpoint: subscriptionJson.endpoint,
        keys: subscriptionJson.keys,
      });

      return response;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return { error: true, message: 'Gagal berlangganan notifikasi' };
    }
  },

  async unsubscribePushNotification(token) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        return { error: false, message: 'Tidak ada langganan notifikasi' };
      }

      const response = await unsubscribeNotification({
        token,
        endpoint: subscription.endpoint,
      });

      await subscription.unsubscribe();

      return response;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return { error: true, message: 'Gagal berhenti berlangganan notifikasi' };
    }
  },

  _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  },
};

export default NotificationHelper;
