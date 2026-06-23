const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type ApiOptions = RequestInit & { token?: string };

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, ...init } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `API error ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
