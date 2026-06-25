'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { upsertWorklog } from '@/app/actions/worklogs';
import type { WorkLog } from '@/lib/server-data';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const CATEGORIES = [
  { name: 'frontend', label: 'Frontend' },
  { name: 'backend', label: 'Backend' },
  { name: 'qa', label: 'QA' },
  { name: 'management', label: 'Management' },
] as const;

export function LogEntryForm({ existing, date }: { existing: WorkLog | null; date: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(upsertWorklog, {});

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="date" value={date} />

      <div className="rounded-xl border border-zinc-200 bg-white p-6 flex flex-col gap-5">
        {CATEGORIES.map(({ name, label }) => (
          <div key={name} className="flex flex-col gap-1.5">
            <Label htmlFor={name}>{label}</Label>
            <Textarea
              id={name}
              name={name}
              placeholder={`What did you work on for ${label.toLowerCase()}?`}
              defaultValue={existing?.[name] ?? ''}
            />
          </div>
        ))}
      </div>

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : existing ? 'Update log' : 'Save log'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
