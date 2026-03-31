import { Worker } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis({
  host: '127.0.0.1',
  port: 6379,
});

const worker = new Worker(
  'ai-jobs',
  async (job) => {
    console.log(`Processing job ${job.id}`);
  },
  { connection }
);

console.log('Worker is running...');
