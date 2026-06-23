'use client';

type Props = {
  logDates: string[]; // ISO date strings YYYY-MM-DD
};

function computeStreak(dates: string[]): number {
  if (!dates.length) return 0;

  const unique = [...new Set(dates)].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);

  let streak = 0;
  let cursor = new Date(today);

  for (const date of unique) {
    const expected = cursor.toISOString().slice(0, 10);
    if (date === expected) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else if (date < expected) {
      break;
    }
  }

  return streak;
}

export function StreakCard({ logDates }: Props) {
  const streak = computeStreak(logDates);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-1 font-medium text-zinc-900">Logging streak</h2>
      {streak === 0 ? (
        <p className="mt-2 text-sm text-zinc-500">Start your streak today!</p>
      ) : (
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-bold text-zinc-900">{streak}</span>
          <span className="text-sm text-zinc-500">{streak === 1 ? 'day' : 'days'} in a row</span>
        </div>
      )}
    </div>
  );
}
