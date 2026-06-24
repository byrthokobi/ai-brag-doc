'use server';

import { cookies } from 'next/headers';
import { apiFetch } from '@/lib/api';

async function getToken(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value ?? '';
}

export async function triggerWeekly(): Promise<{ jobId?: string; error?: string }> {
  const token = await getToken();
  const today = new Date();
  const day = today.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() + diff);
  const weekStart = monday.toISOString().slice(0, 10);

  try {
    const res = await apiFetch<{ jobId: string }>('/generation/weekly', {
      method: 'POST',
      token,
      body: JSON.stringify({ weekStart }),
    });
    return { jobId: res.jobId };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Could not start generation' };
  }
}

export async function triggerMonthly(): Promise<{ jobId?: string; error?: string }> {
  const token = await getToken();
  const now = new Date();
  const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

  try {
    const res = await apiFetch<{ jobId: string }>('/generation/monthly', {
      method: 'POST',
      token,
      body: JSON.stringify({ month }),
    });
    return { jobId: res.jobId };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Could not start generation' };
  }
}

export async function regenerateWeekly(weekStart: string): Promise<{ jobId?: string; error?: string }> {
  const token = await getToken();
  try {
    const res = await apiFetch<{ jobId: string }>('/generation/weekly/regenerate', {
      method: 'POST',
      token,
      body: JSON.stringify({ weekStart }),
    });
    return { jobId: res.jobId };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Could not start regeneration' };
  }
}

export async function regenerateMonthly(month: string): Promise<{ jobId?: string; error?: string }> {
  const token = await getToken();
  try {
    const res = await apiFetch<{ jobId: string }>('/generation/monthly/regenerate', {
      method: 'POST',
      token,
      body: JSON.stringify({ month }),
    });
    return { jobId: res.jobId };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Could not start regeneration' };
  }
}
