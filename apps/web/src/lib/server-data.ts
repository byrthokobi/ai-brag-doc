import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiFetch } from './api';

export type WorkLog = {
  id: string;
  date: string;
  frontend: string | null;
  backend: string | null;
  qa: string | null;
  management: string | null;
};

export type WorkLogsResponse = {
  data: WorkLog[];
  total: number;
  page: number;
  limit: number;
};

export type WeeklySummary = {
  id: string;
  weekStart: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
};

export type MonthlyDoc = {
  id: string;
  month: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
};

async function getToken(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');
  return token;
}

async function safeFetch<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') redirect('/login');
    throw err;
  }
}

export async function fetchTodayWorklog(): Promise<WorkLog | null> {
  const token = await getToken();
  const today = new Date().toISOString().slice(0, 10);
  return safeFetch(async () => {
    const res = await apiFetch<WorkLogsResponse>(
      `/worklogs?dateFrom=${today}&dateTo=${today}&limit=1`,
      { token },
    );
    return res.data[0] ?? null;
  });
}

export async function fetchWorklogByDate(date: string): Promise<WorkLog | null> {
  const token = await getToken();
  return safeFetch(async () => {
    const res = await apiFetch<WorkLogsResponse>(
      `/worklogs?dateFrom=${date}&dateTo=${date}&limit=1`,
      { token },
    );
    return res.data[0] ?? null;
  });
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
  return safeFetch(() => apiFetch<WorkLogsResponse>(`/worklogs?${qs}`, { token }));
}

export async function fetchWeeklySummaries(): Promise<WeeklySummary[]> {
  const token = await getToken();
  return safeFetch(() => apiFetch<WeeklySummary[]>('/generation/weekly', { token }));
}

export async function fetchMonthlyDocs(): Promise<MonthlyDoc[]> {
  const token = await getToken();
  return safeFetch(() => apiFetch<MonthlyDoc[]>('/generation/monthly', { token }));
}
