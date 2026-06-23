'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { apiFetch } from '@/lib/api';

export type WorkLog = {
  id: string;
  date: string;
  frontend: string | null;
  backend: string | null;
  qa: string | null;
  management: string | null;
};

type WorkLogsResponse = { data: WorkLog[]; total: number; page: number; limit: number };

async function getToken(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value ?? '';
}

export async function fetchTodayWorklog(): Promise<WorkLog | null> {
  const token = await getToken();
  const today = new Date().toISOString().slice(0, 10);
  const res = await apiFetch<WorkLogsResponse>(
    `/worklogs?dateFrom=${today}&dateTo=${today}&limit=1`,
    { token },
  );
  return res.data[0] ?? null;
}

export async function fetchWorklogs(params: {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  category?: string;
}): Promise<WorkLogsResponse> {
  const token = await getToken();
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.dateFrom) qs.set('dateFrom', params.dateFrom);
  if (params.dateTo) qs.set('dateTo', params.dateTo);
  if (params.category) qs.set('category', params.category);
  return apiFetch<WorkLogsResponse>(`/worklogs?${qs}`, { token });
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
