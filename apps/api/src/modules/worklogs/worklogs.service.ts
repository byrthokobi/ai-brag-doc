import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { WorkLog } from '../../generated/prisma/client.js';
import { CreateWorklogDto } from './dto/create-worklog.dto.js';
import { UpdateWorklogDto } from './dto/update-worklog.dto.js';
import { Category, WorklogQueryDto } from './dto/worklog-query.dto.js';

@Injectable()
export class WorklogsService {
  private readonly logger = new Logger(WorklogsService.name);

  constructor(private prisma: PrismaService) {}

  async upsert(userId: string, dto: CreateWorklogDto): Promise<WorkLog> {
    const { date, frontend, backend, qa, management } = dto;

    if (!this.hasContent({ frontend, backend, qa, management })) {
      throw new BadRequestException('At least one category field must be provided');
    }

    const dateUtc = this.toUtcMidnight(date);

    return this.prisma.workLog.upsert({
      where: { userId_date: { userId, date: dateUtc } },
      create: { userId, date: dateUtc, frontend, backend, qa, management },
      update: { frontend, backend, qa, management },
    });
  }

  async updateByDate(userId: string, date: string, dto: UpdateWorklogDto): Promise<WorkLog> {
    const dateUtc = this.toUtcMidnight(date);

    const existing = await this.prisma.workLog.findUnique({
      where: { userId_date: { userId, date: dateUtc } },
    });

    if (!existing) {
      throw new NotFoundException(`No worklog found for date ${date}`);
    }

    return this.prisma.workLog.update({
      where: { userId_date: { userId, date: dateUtc } },
      data: dto,
    });
  }

  async findMany(
    userId: string,
    query: WorklogQueryDto,
  ): Promise<{ data: WorkLog[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    if (query.dateFrom && query.dateTo && query.dateFrom > query.dateTo) {
      throw new BadRequestException('dateFrom must not be after dateTo');
    }

    const where = this.buildWhereClause(userId, query);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.workLog.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.workLog.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  private buildWhereClause(userId: string, query: WorklogQueryDto) {
    const where: any = { userId };

    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) where.date.gte = this.toUtcMidnight(query.dateFrom);
      if (query.dateTo) where.date.lte = this.toUtcMidnight(query.dateTo);
    }

    if (query.category) {
      where[this.categoryToField(query.category)] = { not: null };
    }

    return where;
  }

  private categoryToField(category: Category): string {
    return category;
  }

  private hasContent(fields: {
    frontend?: string;
    backend?: string;
    qa?: string;
    management?: string;
  }): boolean {
    return Object.values(fields).some((v) => v !== undefined && v !== null && v.trim() !== '');
  }

  private toUtcMidnight(dateStr: string): Date {
    return new Date(`${dateStr}T00:00:00.000Z`);
  }
}
