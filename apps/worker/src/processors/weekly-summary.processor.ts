import { Job } from 'bullmq';
import { prisma } from '../prisma/prisma-client';
import { aiProvider } from '../ai/ai-provider';

export interface WeeklySummaryJobData {
  userId: string;
  weekStart: string;
}

export async function processWeeklySummary(job: Job<WeeklySummaryJobData>): Promise<void> {
  const { userId, weekStart } = job.data;
  console.log(`[weekly-summary] Processing job ${job.id} for user ${userId}, week ${weekStart}`);

  const weekStartDate = new Date(`${weekStart}T00:00:00.000Z`);
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  weekEndDate.setHours(23, 59, 59, 999);

  const worklogs = await prisma.workLog.findMany({
    where: {
      userId,
      date: { gte: weekStartDate, lte: weekEndDate },
    },
    orderBy: { date: 'asc' },
  });

  const content = await aiProvider.generateWeeklySummary(worklogs);

  await prisma.weeklySummary.upsert({
    where: { userId_weekStart: { userId, weekStart: weekStartDate } },
    create: { userId, weekStart: weekStartDate, content },
    update: { content },
  });

  console.log(`[weekly-summary] Done — job ${job.id} stored WeeklySummary for week ${weekStart}`);
  // FCM notification stubbed — wired in bolt 004
}
