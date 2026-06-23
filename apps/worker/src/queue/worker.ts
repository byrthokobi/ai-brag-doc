import 'dotenv/config';
import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { processWeeklySummary } from '../processors/weekly-summary.processor';
import { processMonthlyDoc } from '../processors/monthly-doc.processor';
import { startCronJobs } from '../cron/cron';

const connection = new Redis({
  host: process.env.REDIS_HOST ?? '127.0.0.1',
  port: Number(process.env.REDIS_PORT ?? 6379),
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  'ai-jobs',
  async (job) => {
    if (job.name === 'weekly-summary') return processWeeklySummary(job);
    if (job.name === 'monthly-doc') return processMonthlyDoc(job);
    console.warn(`[worker] Unknown job type: ${job.name}`);
  },
  {
    connection,
    concurrency: 5,
  },
);

worker.on('completed', (job) => console.log(`[worker] Job ${job.id} (${job.name}) completed`));
worker.on('failed', (job, err) => console.error(`[worker] Job ${job?.id} (${job?.name}) failed:`, err.message));

startCronJobs();
console.log('[worker] Worker running and listening on ai-jobs queue');
