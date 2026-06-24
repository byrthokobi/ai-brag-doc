import { fetchTodayWorklog } from '@/lib/server-data';
import { LogEntryForm } from './log-entry-form';

export default async function NewLogPage() {
  const existing = await fetchTodayWorklog();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Log today&apos;s work</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Fill in at least one category. Your log will be saved for today.
        </p>
      </div>
      <LogEntryForm existing={existing} />
    </div>
  );
}
