'use client';

import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

type Props = {
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  categories: string[];
};

export function LogFilters({ dateFrom, dateTo, category, categories }: Props) {
  const router = useRouter();
  const [from, setFrom] = useState(dateFrom ?? '');
  const [to, setTo] = useState(dateTo ?? '');
  const [cat, setCat] = useState(category ?? '');

  function apply() {
    const qs = new URLSearchParams();
    qs.set('page', '1');
    if (from) qs.set('dateFrom', from);
    if (to) qs.set('dateTo', to);
    if (cat) qs.set('category', cat);
    router.push(`/logs?${qs}`);
  }

  function clear() {
    setFrom('');
    setTo('');
    setCat('');
    router.push('/logs');
  }

  const hasFilters = from || to || cat;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dateFrom">From</Label>
          <Input
            id="dateFrom"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dateTo">To</Label>
          <Input
            id="dateTo"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button onClick={apply} size="sm">Apply</Button>
          {hasFilters && (
            <Button onClick={clear} variant="ghost" size="sm">Clear</Button>
          )}
        </div>
      </div>
    </div>
  );
}
