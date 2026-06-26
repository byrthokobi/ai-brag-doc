import { fetchMonthlyDocs } from '@/lib/server-data';
import { triggerMonthly, regenerateMonthly } from '@/app/actions/summaries';
import { RegenerateButton } from '@/components/regenerate-button';
import { CopyButton } from '@/components/copy-button';

function monthLabel(month: string): string {
  const [year, m] = month.split('-');
  return new Date(Number(year), Number(m) - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export default async function MonthlyDocsPage() {
  const docs = await fetchMonthlyDocs();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Monthly brag docs</h1>
          <p className="mt-1 text-sm text-zinc-500">AI-generated documents for performance reviews</p>
        </div>
        <RegenerateButton action={triggerMonthly} label="Generate this month" />
      </div>

      {docs.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
          <p className="text-zinc-500">No monthly brag docs yet.</p>
          <p className="mt-1 text-sm text-zinc-400">
            Trigger one above or wait for the automatic 1st-of-month schedule.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {docs.map((doc) => (
            <div key={doc.id} className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                <h2 className="font-medium text-zinc-900">{monthLabel(doc.month)}</h2>
                <div className="flex items-center gap-2">
                  <CopyButton text={doc.content} />
                  <RegenerateButton
                    action={regenerateMonthly.bind(null, doc.month)}
                    label="Regenerate"
                  />
                </div>
              </div>
              <div className="rounded-md bg-zinc-50 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                  {doc.content}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  {doc.content.trim().split(/\s+/).length} words
                </p>
                <p className="text-xs text-zinc-400">
                  Updated{' '}
                  {new Date(doc.updatedAt ?? doc.createdAt).toLocaleDateString('en-US')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
