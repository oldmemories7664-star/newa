
import { ref, push, serverTimestamp } from 'firebase/database';
import { db } from './firebase';

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showLocalNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico', // You can change this to your app logo
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
};

export const broadcastNotification = async (title: string, message: string, senderUid?: string) => {
  try {
    const broadcastRef = ref(db, 'broadcast_notifications');
    const timestamp = Date.now();
    
    // For real-time browser push
    await push(broadcastRef, {
      title,
      message,
      senderUid: senderUid || 'system',
      timestamp: serverTimestamp(),
    });

    // For persistent UI notification panel
    const notifRef = ref(db, 'notifications');
    await push(notifRef, {
      title,
      message,
      type: 'broadcast',
      is_read: false,
      created_at: timestamp,
      priority: 'medium'
    });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
  }
};
