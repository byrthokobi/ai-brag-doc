import cron from 'node-cron';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '../prisma/prisma-client.js';
import { checkAndRemindAll } from './daily-reminder';

const connection = new Redis({
  host: process.env.REDIS_HOST ?? '127.0.0.1',
  port: Number(process.env.REDIS_PORT ?? 6379),
  maxRetriesPerRequest: null,
});

const queue = new Queue('ai-jobs', { connection });

function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  return monday.toISOString().split('T')[0];
}

function getPreviousMonth(): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

async function queueAllUsersWeekly(): Promise<void> {
  const weekStart = getCurrentWeekStart();
  const users = await prisma.user.findMany({ where: { isActive: true }, select: { id: true } });
  console.log(`[cron/weekly] Queuing ${users.length} jobs for week ${weekStart}`);
  for (const user of users) {
    await queue.add('weekly-summary', { userId: user.id, weekStart }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }
}

async function queueAllUsersMonthly(): Promise<void> {
  const month = getPreviousMonth();
  const users = await prisma.user.findMany({ where: { isActive: true }, select: { id: true } });
  console.log(`[cron/monthly] Queuing ${users.length} jobs for month ${month}`);
  for (const user of users) {
    await queue.add('monthly-doc', { userId: user.id, month }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }
}

export function startCronJobs(): void {
  // Every Monday at 08:00 UTC
  cron.schedule('0 8 * * 1', () => {
    queueAllUsersWeekly().catch(err => console.error('[cron/weekly] Error:', err));
  }, { timezone: 'UTC' });

  // 1st of every month at 08:00 UTC
  cron.schedule('0 8 1 * *', () => {
    queueAllUsersMonthly().catch(err => console.error('[cron/monthly] Error:', err));
  }, { timezone: 'UTC' });

  // Daily at 12:00 UTC (18:00 Bangladesh, UTC+6)
  cron.schedule('0 12 * * *', () => {
    checkAndRemindAll().catch(err => console.error('[cron/reminder] Error:', err));
  }, { timezone: 'UTC' });

  console.log('[cron] Scheduled: weekly (Mon 08:00 UTC), monthly (1st 08:00 UTC), daily reminder (12:00 UTC / 18:00 BDT)');
}
