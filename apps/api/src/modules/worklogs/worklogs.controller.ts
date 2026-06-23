import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WorklogsService } from './worklogs.service.js';
import { CreateWorklogDto } from './dto/create-worklog.dto.js';
import { UpdateWorklogDto } from './dto/update-worklog.dto.js';
import { WorklogQueryDto } from './dto/worklog-query.dto.js';
import { WorklogResponseDto } from './dto/worklog-response.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../../common/decorators/current-user.decorator.js';

@Controller('worklogs')
@UseGuards(JwtAuthGuard)
export class WorklogsController {
  constructor(private readonly worklogsService: WorklogsService) {}

  @Post()
  async upsert(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateWorklogDto,
  ): Promise<WorklogResponseDto> {
    const worklog = await this.worklogsService.upsert(user.userId, dto);
    return new WorklogResponseDto(worklog);
  }

  @Patch(':date')
  async update(
    @CurrentUser() user: JwtUser,
    @Param('date') date: string,
    @Body() dto: UpdateWorklogDto,
  ): Promise<WorklogResponseDto> {
    const worklog = await this.worklogsService.updateByDate(user.userId, date, dto);
    return new WorklogResponseDto(worklog);
  }

  @Get()
  async findMany(
    @CurrentUser() user: JwtUser,
    @Query() query: WorklogQueryDto,
  ): Promise<{ data: WorklogResponseDto[]; total: number; page: number; limit: number }> {
    const result = await this.worklogsService.findMany(user.userId, query);
    return {
      data: result.data.map((w) => new WorklogResponseDto(w)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
