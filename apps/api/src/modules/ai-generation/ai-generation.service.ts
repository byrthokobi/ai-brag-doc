import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { TriggerWeeklyDto } from './dto/trigger-weekly.dto.js';
import { TriggerMonthlyDto } from './dto/trigger-monthly.dto.js';
import { GenerationResponseDto } from './dto/generation-response.dto.js';

@Injectable()
export class AiGenerationService {
  private readonly logger = new Logger(AiGenerationService.name);
  private readonly queue: Queue;

  constructor() {
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
}
