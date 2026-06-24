'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { apiFetch } from '@/lib/api';

async function getToken(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value ?? '';
}

export async function upsertWorklog(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string }> {
  const token = await getToken();
  const frontend = formData.get('frontend') as string;
  const backend = formData.get('backend') as string;
  const qa = formData.get('qa') as string;
  const management = formData.get('management') as string;

  if (!frontend && !backend && !qa && !management) {
    return { error: 'Please fill in at least one category' };
  }

  const today = new Date().toISOString().slice(0, 10);

  try {
    await apiFetch('/worklogs', {
      method: 'POST',
      token,
      body: JSON.stringify({
        date: today,
        ...(frontend ? { frontend } : {}),
        ...(backend ? { backend } : {}),
        ...(qa ? { qa } : {}),
        ...(management ? { management } : {}),
      }),
    });
    revalidatePath('/logs');
    revalidatePath('/');
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Failed to save log' };
  }

  return {};
}
