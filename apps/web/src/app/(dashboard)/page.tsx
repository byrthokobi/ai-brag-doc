import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { fetchTodayWorklog } from '@/app/actions/worklogs';

export default async function DashboardPage() {
  const todayLog = await fetchTodayWorklog();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">{today}</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-1 font-medium text-zinc-900">Today&apos;s log</h2>
        {todayLog ? (
          <div className="mt-3 flex flex-col gap-2">
            <p className="text-sm text-green-600 font-medium">✓ Logged for today</p>
            {todayLog.frontend && <p className="text-sm text-zinc-600"><span className="font-medium">Frontend:</span> {todayLog.frontend}</p>}
            {todayLog.backend && <p className="text-sm text-zinc-600"><span className="font-medium">Backend:</span> {todayLog.backend}</p>}
            {todayLog.qa && <p className="text-sm text-zinc-600"><span className="font-medium">QA:</span> {todayLog.qa}</p>}
            {todayLog.management && <p className="text-sm text-zinc-600"><span className="font-medium">Management:</span> {todayLog.management}</p>}
            <Link href="/logs/new" className="mt-2 inline-block text-sm text-zinc-500 hover:text-zinc-900 underline">Edit today&apos;s log</Link>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-sm text-zinc-500">You haven&apos;t logged today yet.</p>
            <Button asChild className="mt-4">
              <Link href="/logs/new">Log today&apos;s work</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-3 font-medium text-zinc-900">Quick links</h2>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/logs">View history</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
