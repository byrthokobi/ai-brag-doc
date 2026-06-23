import Link from 'next/link';
import { fetchWorklogs } from '@/app/actions/worklogs';
import { Button } from '@/components/ui/button';
import { LogFilters } from './log-filters';

const PAGE_SIZE = 20;
const CATEGORIES = ['frontend', 'backend', 'qa', 'management'] as const;

type SearchParams = Promise<{
  page?: string;
  dateFrom?: string;
  dateTo?: string;
  category?: string;
}>;

export default async function LogsPage({ searchParams }: { searchParams: SearchParams }) {
  const { page = '1', dateFrom, dateTo, category } = await searchParams;
  const currentPage = Math.max(1, Number(page));

  const result = await fetchWorklogs({
    page: currentPage,
    limit: PAGE_SIZE,
    dateFrom,
    dateTo,
    category,
  });

  const totalPages = Math.ceil(result.total / PAGE_SIZE);

  function pageUrl(p: number) {
    const qs = new URLSearchParams();
    qs.set('page', String(p));
    if (dateFrom) qs.set('dateFrom', dateFrom);
    if (dateTo) qs.set('dateTo', dateTo);
    if (category) qs.set('category', category);
    return `/logs?${qs}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Work log history</h1>
          <p className="mt-1 text-sm text-zinc-500">{result.total} total entries</p>
        </div>
        <Button asChild>
          <Link href="/logs/new">Log today</Link>
        </Button>
      </div>

      <LogFilters
        dateFrom={dateFrom}
        dateTo={dateTo}
        category={category}
        categories={[...CATEGORIES]}
      />

      {result.data.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
          <p className="text-zinc-500">
            {dateFrom || dateTo || category
              ? 'No results for this filter.'
              : 'No work logs yet. Start by logging today\'s work.'}
          </p>
          {!dateFrom && !dateTo && !category && (
            <Button asChild className="mt-4">
              <Link href="/logs/new">Log today&apos;s work</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {result.data.map((log) => (
            <div key={log.id} className="rounded-xl border border-zinc-200 bg-white p-5">
              <p className="mb-3 text-sm font-medium text-zinc-500">
                {new Date(log.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <div className="flex flex-col gap-1.5">
                {log.frontend && (
                  <p className="text-sm text-zinc-700">
                    <span className="font-medium text-zinc-900">Frontend:</span> {log.frontend}
                  </p>
                )}
                {log.backend && (
                  <p className="text-sm text-zinc-700">
                    <span className="font-medium text-zinc-900">Backend:</span> {log.backend}
                  </p>
                )}
                {log.qa && (
                  <p className="text-sm text-zinc-700">
                    <span className="font-medium text-zinc-900">QA:</span> {log.qa}
                  </p>
                )}
                {log.management && (
                  <p className="text-sm text-zinc-700">
                    <span className="font-medium text-zinc-900">Management:</span> {log.management}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button asChild variant="outline" disabled={currentPage <= 1}>
            <Link href={pageUrl(currentPage - 1)}>Previous</Link>
          </Button>
          <span className="text-sm text-zinc-500">
            Page {currentPage} of {totalPages}
          </span>
          <Button asChild variant="outline" disabled={currentPage >= totalPages}>
            <Link href={pageUrl(currentPage + 1)}>Next</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
