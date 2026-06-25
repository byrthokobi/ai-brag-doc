import { fetchWorklogByDate } from '@/lib/server-data';
import { LogEntryForm } from './log-entry-form';

type SearchParams = Promise<{ date?: string }>;

export default async function NewLogPage({ searchParams }: { searchParams: SearchParams }) {
  const { date } = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const targetDate = date ?? today;
  const isToday = targetDate === today;

  const existing = await fetchWorklogByDate(targetDate);

  const dateLabel = new Date(targetDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          {isToday ? "Log today's work" : `Log for ${dateLabel}`}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Fill in at least one category.{' '}
          {existing ? 'Updating your existing log.' : 'No log found for this date.'}
        </p>
      </div>
      <LogEntryForm existing={existing} date={targetDate} />
    </div>
  );
}
