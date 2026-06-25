import { logout } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/nav-link';
import { NotificationInitializer } from '@/components/notification-initializer';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <NavLink href="/">
            <span className="text-lg font-semibold text-zinc-900">AI Brag Doc</span>
          </NavLink>
          <nav className="flex items-center gap-4">
            <NavLink href="/logs/new">Log today</NavLink>
            <NavLink href="/logs">History</NavLink>
            <NavLink href="/summaries/weekly">Weekly</NavLink>
            <NavLink href="/summaries/monthly">Monthly</NavLink>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <NotificationInitializer />
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
