import { Module } from '@nestjs/common';
import { AiGenerationController } from './ai-generation.controller.js';
import { AiGenerationService } from './ai-generation.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [AiGenerationController],
  providers: [AiGenerationService],
})
export class AiGenerationModule {}
