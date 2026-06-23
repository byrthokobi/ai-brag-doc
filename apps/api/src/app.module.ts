import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './modules/prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { WorklogsModule } from './modules/worklogs/worklogs.module.js';
import { AiGenerationModule } from './modules/ai-generation/ai-generation.module.js';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, NotificationsModule, WorklogsModule, AiGenerationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
