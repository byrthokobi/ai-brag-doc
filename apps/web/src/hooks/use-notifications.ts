'use client';

import { useEffect } from 'react';
import { getFcmToken } from '@/lib/firebase';
import { registerFcmToken } from '@/app/actions/notifications';

const STORAGE_KEY = 'fcm_token_registered';

export function useNotifications() {
  useEffect(() => {
    async function init() {
      if (!('Notification' in window)) return;

      let permission = Notification.permission;
      if (permission === 'denied') return;

      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }
      if (permission !== 'granted') return;

      const token = await getFcmToken();
      if (!token) return;

      // Skip if this exact token is already registered
      if (localStorage.getItem(STORAGE_KEY) === token) return;

      await registerFcmToken(token);
      localStorage.setItem(STORAGE_KEY, token);
    }

    init().catch(console.error);
  }, []);
}
