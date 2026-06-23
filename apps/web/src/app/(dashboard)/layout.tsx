import Link from 'next/link';
import { logout } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold text-zinc-900">
            AI Brag Doc
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/logs/new" className="text-sm text-zinc-600 hover:text-zinc-900">
              Log today
            </Link>
            <Link href="/logs" className="text-sm text-zinc-600 hover:text-zinc-900">
              History
            </Link>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
