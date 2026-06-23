import { Job } from 'bullmq';
import { prisma } from '../prisma/prisma-client';
import { aiProvider } from '../ai/ai-provider';

export interface MonthlyDocJobData {
  userId: string;
  month: string; // YYYY-MM
}

export async function processMonthlyDoc(job: Job<MonthlyDocJobData>): Promise<void> {
  const { userId, month } = job.data;
  console.log(`[monthly-doc] Processing job ${job.id} for user ${userId}, month ${month}`);

  const [year, monthNum] = month.split('-').map(Number);
  const monthStart = new Date(Date.UTC(year, monthNum - 1, 1));
  const monthEnd = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));

  const [summaries, worklogs] = await Promise.all([
    prisma.weeklySummary.findMany({
      where: { userId, weekStart: { gte: monthStart, lte: monthEnd } },
      orderBy: { weekStart: 'asc' },
    }),
    prisma.workLog.findMany({
      where: { userId, date: { gte: monthStart, lte: monthEnd } },
      orderBy: { date: 'asc' },
    }),
  ]);

  const content = await aiProvider.generateMonthlyDoc(summaries, worklogs);

  await prisma.monthlyDoc.upsert({
    where: { userId_month: { userId, month } },
    create: { userId, month, content },
    update: { content },
  });

  console.log(`[monthly-doc] Done — job ${job.id} stored MonthlyDoc for ${month}`);
  // FCM notification stubbed — wired in bolt 004
}
