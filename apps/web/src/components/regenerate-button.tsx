'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type Props = {
  action: () => Promise<{ jobId?: string; error?: string }>;
  label?: string;
};

export function RegenerateButton({ action, label = 'Regenerate' }: Props) {
  const [state, setState] = useState<'idle' | 'pending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleClick() {
    setState('pending');
    const result = await action();
    if (result.error) {
      setMessage(result.error);
      setState('error');
    } else {
      setMessage('Generation started — check back in a moment.');
      setState('done');
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={state === 'pending' || state === 'done'}
      >
        {state === 'pending' ? 'Starting…' : state === 'done' ? 'Queued ✓' : label}
      </Button>
      {message && (
        <p className={`text-xs ${state === 'error' ? 'text-red-600' : 'text-zinc-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
