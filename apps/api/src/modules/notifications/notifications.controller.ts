import { Controller, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../../common/decorators/current-user.decorator.js';
import { RegisterTokenDto } from './dto/register-token.dto.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('token')
  @HttpCode(200)
  async registerToken(
    @CurrentUser() user: JwtUser,
    @Body() dto: RegisterTokenDto,
  ): Promise<{ success: boolean }> {
    await this.notificationsService.registerToken(user.userId, dto.token);
    return { success: true };
  }
}
