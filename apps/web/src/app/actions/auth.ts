'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api';

const COOKIE_NAME = 'token';
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
};

export async function login(_: unknown, formData: FormData): Promise<{ error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const data = await apiFetch<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, data.accessToken, COOKIE_OPTS);
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Login failed' };
  }

  redirect('/');
}

export async function register(_: unknown, formData: FormData): Promise<{ error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;

  try {
    await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
    // register returns user data, not a token — login immediately after
    const loginData = await apiFetch<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, loginData.accessToken, COOKIE_OPTS);
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Registration failed' };
  }

  redirect('/');
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect('/login');
}
