import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service.js';
import { TriggerWeeklyDto } from './dto/trigger-weekly.dto.js';
import { TriggerMonthlyDto } from './dto/trigger-monthly.dto.js';
import { GenerationResponseDto } from './dto/generation-response.dto.js';
import type { WeeklySummary, MonthlyDoc } from '../../generated/prisma/client.js';

@Injectable()
export class AiGenerationService {
  private readonly logger = new Logger(AiGenerationService.name);
  private readonly queue: Queue;

  constructor(private readonly prisma: PrismaService) {
    this.queue = new Queue('ai-jobs', {
      connection: {
        host: process.env.REDIS_HOST ?? '127.0.0.1',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    });
  }

  async queueWeeklySummary(userId: string, dto: TriggerWeeklyDto): Promise<GenerationResponseDto> {
    const job = await this.queue.add(
      'weekly-summary',
      { userId, weekStart: dto.weekStart },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    );
    this.logger.log(`Queued weekly-summary for user ${userId}, week ${dto.weekStart} → job ${job.id}`);
    return { jobId: job.id! };
  }

  async queueMonthlyDoc(userId: string, dto: TriggerMonthlyDto): Promise<GenerationResponseDto> {
    const job = await this.queue.add(
      'monthly-doc',
      { userId, month: dto.month },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    );
    this.logger.log(`Queued monthly-doc for user ${userId}, month ${dto.month} → job ${job.id}`);
    return { jobId: job.id! };
  }

  async regenerateWeekly(userId: string, dto: TriggerWeeklyDto): Promise<GenerationResponseDto> {
    const weekStartDate = new Date(`${dto.weekStart}T00:00:00.000Z`);
    const existing = await this.prisma.weeklySummary.findUnique({
      where: { userId_weekStart: { userId, weekStart: weekStartDate } },
    });
    if (!existing) throw new NotFoundException(`No weekly summary found for week ${dto.weekStart}`);

    const job = await this.queue.add(
      'weekly-summary',
      { userId, weekStart: dto.weekStart },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    );
    this.logger.log(`Re-queued weekly-summary for user ${userId}, week ${dto.weekStart} → job ${job.id}`);
    return { jobId: job.id! };
  }

  async regenerateMonthly(userId: string, dto: TriggerMonthlyDto): Promise<GenerationResponseDto> {
    const existing = await this.prisma.monthlyDoc.findUnique({
      where: { userId_month: { userId, month: dto.month } },
    });
    if (!existing) throw new NotFoundException(`No monthly doc found for month ${dto.month}`);

    const job = await this.queue.add(
      'monthly-doc',
      { userId, month: dto.month },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    );
    this.logger.log(`Re-queued monthly-doc for user ${userId}, month ${dto.month} → job ${job.id}`);
    return { jobId: job.id! };
  }

  async listWeeklySummaries(userId: string): Promise<WeeklySummary[]> {
    return this.prisma.weeklySummary.findMany({
      where: { userId },
      orderBy: { weekStart: 'desc' },
    });
  }

  async listMonthlyDocs(userId: string): Promise<MonthlyDoc[]> {
    return this.prisma.monthlyDoc.findMany({
      where: { userId },
      orderBy: { month: 'desc' },
    });
  }
}
