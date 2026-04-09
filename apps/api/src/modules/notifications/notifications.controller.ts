import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { UsersService } from '../users/users.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('register-token')
  async registerToken(@Request() req: any, @Body() body: { token: string }) {
    await this.usersService.addFcmToken(req.user.userId, body.token);
    return { success: true };
  }
}
