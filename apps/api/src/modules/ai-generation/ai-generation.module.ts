import { Module } from '@nestjs/common';
import { AiGenerationController } from './ai-generation.controller.js';
import { AiGenerationService } from './ai-generation.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [AiGenerationController],
  providers: [AiGenerationService],
})
export class AiGenerationModule {}
