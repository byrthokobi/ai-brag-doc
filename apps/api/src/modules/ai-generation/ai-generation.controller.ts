import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AiGenerationService } from './ai-generation.service.js';
import { TriggerWeeklyDto } from './dto/trigger-weekly.dto.js';
import { TriggerMonthlyDto } from './dto/trigger-monthly.dto.js';
import { GenerationResponseDto } from './dto/generation-response.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../../common/decorators/current-user.decorator.js';

@Controller('generation')
@UseGuards(JwtAuthGuard)
export class AiGenerationController {
  constructor(private readonly aiGenerationService: AiGenerationService) {}

  @Post('weekly')
  @HttpCode(202)
  async triggerWeekly(
    @CurrentUser() user: JwtUser,
    @Body() dto: TriggerWeeklyDto,
  ): Promise<GenerationResponseDto> {
    return this.aiGenerationService.queueWeeklySummary(user.userId, dto);
  }

  @Post('monthly')
  @HttpCode(202)
  async triggerMonthly(
    @CurrentUser() user: JwtUser,
    @Body() dto: TriggerMonthlyDto,
  ): Promise<GenerationResponseDto> {
    return this.aiGenerationService.queueMonthlyDoc(user.userId, dto);
  }

  @Post('weekly/regenerate')
  @HttpCode(202)
  async regenerateWeekly(
    @CurrentUser() user: JwtUser,
    @Body() dto: TriggerWeeklyDto,
  ): Promise<GenerationResponseDto> {
    return this.aiGenerationService.regenerateWeekly(user.userId, dto);
  }

  @Post('monthly/regenerate')
  @HttpCode(202)
  async regenerateMonthly(
    @CurrentUser() user: JwtUser,
    @Body() dto: TriggerMonthlyDto,
  ): Promise<GenerationResponseDto> {
    return this.aiGenerationService.regenerateMonthly(user.userId, dto);
  }
}
