'use client';

import { useNotifications } from '@/hooks/use-notifications';

export function NotificationInitializer() {
  useNotifications();
  return null;
}
