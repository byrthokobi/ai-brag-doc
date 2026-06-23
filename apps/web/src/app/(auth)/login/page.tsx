'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { login } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, {});

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold text-zinc-900">Sign in</h1>
        <p className="mb-6 text-sm text-zinc-500">Enter your credentials to access your workspace</p>

        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>

          {state?.error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
          )}

          <Button type="submit" disabled={pending} className="mt-2 w-full">
            {pending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          No account?{' '}
          <Link href="/register" className="font-medium text-zinc-900 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
