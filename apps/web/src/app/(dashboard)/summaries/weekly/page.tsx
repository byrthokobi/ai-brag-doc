import { fetchWeeklySummaries, triggerWeekly, regenerateWeekly } from '@/app/actions/summaries';
import { RegenerateButton } from '@/components/regenerate-button';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function weekLabel(weekStart: string): string {
  const d = new Date(weekStart);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export default async function WeeklySummariesPage() {
  const summaries = await fetchWeeklySummaries();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Weekly summaries</h1>
          <p className="mt-1 text-sm text-zinc-500">AI-generated summaries of your weekly work</p>
        </div>
        <RegenerateButton action={triggerWeekly} label="Generate this week" />
      </div>

      {summaries.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
          <p className="text-zinc-500">No weekly summaries yet.</p>
          <p className="mt-1 text-sm text-zinc-400">
            Trigger one above or wait for the automatic Monday schedule.
          </p>
          <p className="mt-4 text-sm text-zinc-400">
            Make sure you have{' '}
            <Link href="/logs/new" className="underline hover:text-zinc-900">
              logged your work
            </Link>{' '}
            first.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {summaries.map((summary) => (
            <div key={summary.id} className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-medium text-zinc-900">
                  Week of {weekLabel(summary.weekStart)}
                </h2>
                <RegenerateButton
                  action={() => regenerateWeekly(summary.weekStart.slice(0, 10))}
                  label="Regenerate"
                />
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                {summary.content}
              </p>
              <p className="mt-4 text-xs text-zinc-400">
                Updated {new Date(summary.updatedAt).toLocaleDateString('en-US')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
