import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StreakCard } from '@/components/streak-card';
import { fetchWorklogs, fetchTodayWorklog } from '@/app/actions/worklogs';
import { fetchWeeklySummaries, fetchMonthlyDocs } from '@/app/actions/summaries';

export default async function DashboardPage() {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [todayLog, recentLogs, weeklySummaries, monthlyDocs] = await Promise.all([
    fetchTodayWorklog(),
    fetchWorklogs({ limit: 30, dateFrom: thirtyDaysAgo, dateTo: today }),
    fetchWeeklySummaries(),
    fetchMonthlyDocs(),
  ]);

  const logDates = recentLogs.data.map((l) => l.date.slice(0, 10));
  const latestWeekly = weeklySummaries[0] ?? null;
  const latestMonthly = monthlyDocs[0] ?? null;

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">{dateLabel}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Today's status */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-3 font-medium text-zinc-900">Today&apos;s log</h2>
          {todayLog ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-green-600">✅ Logged today</p>
              <Link href="/logs/new" className="mt-1 text-xs text-zinc-400 hover:text-zinc-700 underline">
                Edit today&apos;s log
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-amber-600">⚠️ Not logged yet</p>
              <Button asChild size="sm">
                <Link href="/logs/new">Log today&apos;s work</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Streak */}
        <StreakCard logDates={logDates} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Latest weekly summary */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-3 font-medium text-zinc-900">Latest weekly summary</h2>
          {latestWeekly ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-zinc-500">
                Week of{' '}
                {new Date(latestWeekly.weekStart).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'UTC',
                })}
              </p>
              <p className="line-clamp-3 text-sm text-zinc-700">{latestWeekly.content}</p>
              <Link href="/summaries/weekly" className="mt-1 text-xs text-zinc-400 hover:text-zinc-700 underline">
                View all summaries →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-zinc-400">No summaries yet.</p>
              <Link href="/summaries/weekly" className="text-xs text-zinc-400 hover:text-zinc-700 underline">
                Trigger generation →
              </Link>
            </div>
          )}
        </div>

        {/* Latest monthly doc */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-3 font-medium text-zinc-900">Latest monthly doc</h2>
          {latestMonthly ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-zinc-500">
                {new Date(latestMonthly.month + '-01').toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="line-clamp-3 text-sm text-zinc-700">{latestMonthly.content}</p>
              <Link href="/summaries/monthly" className="mt-1 text-xs text-zinc-400 hover:text-zinc-700 underline">
                View all docs →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-zinc-400">No monthly docs yet.</p>
              <Link href="/summaries/monthly" className="text-xs text-zinc-400 hover:text-zinc-700 underline">
                Trigger generation →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
