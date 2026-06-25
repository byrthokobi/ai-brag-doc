import Link from 'next/link';
import { fetchWorklogs } from '@/lib/server-data';
import { Button } from '@/components/ui/button';
import { CalendarFilters } from './calendar-filters';
import { AlignLeft, ArrowLeft, ArrowRight } from 'lucide-react';

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type SearchParams = Promise<{ month?: string; year?: string }>;

export default async function LogsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const now = new Date();
  const year = Number(params.year ?? now.getFullYear());
  const month = Number(params.month ?? now.getMonth() + 1); // 1-12

  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const lastDay = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  const result = await fetchWorklogs({ dateFrom: firstDay, dateTo: lastDay, limit: 31 });
  const loggedDates = new Set(result.data.map((l) => l.date.slice(0, 10)));

  // Monday-first offset: getDay() returns 0=Sun, we remap to Mon=0
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const startOffset = (firstWeekday + 6) % 7;

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const today = now.toISOString().slice(0, 10);
  const loggedCount = result.data.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Work log history</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {loggedCount} {loggedCount === 1 ? 'day' : 'days'} logged in {monthLabel}
          </p>
        </div>
        <Button asChild>
          <Link href="/logs/new">Log today</Link>
        </Button>
      </div>

      {/* Month navigation + filters */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3">
        <Button asChild variant="outline" size="sm">
          <Link href={`/logs?month=${prevMonth}&year=${prevYear}`}>
            <div className='flex items-center gap-1'>
              <ArrowLeft className='w-4' />
              <p className='text-base'>Prev</p>
            </div>
          </Link>
        </Button>
        <CalendarFilters year={year} month={month} />
        <Button asChild variant="outline" size="sm">
          <Link href={`/logs?month=${nextMonth}&year=${nextYear}`}>
            <div className='flex items-center gap-1'>
              <p className='text-base'>Next</p>
              <ArrowRight className='w-4' />
            </div>
          </Link>
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {DAY_HEADERS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-zinc-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty offset cells */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasLog = loggedDates.has(dateStr);
            const isToday = dateStr === today;
            const isFuture = dateStr > today;

            return (
              <Link
                key={day}
                href={`/logs/new?date=${dateStr}`}
                className={[
                  'group flex flex-col items-center justify-center rounded-xl border py-3 gap-1 transition-all',
                  isToday
                    ? 'border-zinc-900 bg-zinc-50 shadow-sm'
                    : isFuture
                      ? 'border-zinc-100 bg-zinc-50 pointer-events-none'
                      : 'border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm',
                ].join(' ')}
              >
                <span
                  className={[
                    'text-sm font-semibold',
                    isToday
                      ? 'text-zinc-900'
                      : isFuture
                        ? 'text-zinc-300'
                        : 'text-zinc-700 group-hover:text-zinc-900',
                  ].join(' ')}
                >
                  {day}
                </span>
                {!isFuture && (
                  <span className="text-base leading-none">
                    {hasLog ? '✅' : '❌'}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-zinc-500">
        <span className="flex items-center gap-1.5">✅ Logged</span>
        <span className="flex items-center gap-1.5">❌ Missed</span>
        <span className="ml-auto text-xs text-zinc-400">Click any past day to add or edit its log</span>
      </div>
    </div>
  );
}
