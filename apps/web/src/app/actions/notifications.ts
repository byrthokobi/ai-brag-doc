'use server';

import { cookies } from 'next/headers';
import { apiFetch } from '@/lib/api';

export async function registerFcmToken(fcmToken: string): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return;

  await apiFetch('/notifications/token', {
    method: 'POST',
    token,
    body: JSON.stringify({ token: fcmToken }),
  });
}
