import { Module } from '@nestjs/common';
import { WorklogsController } from './worklogs.controller.js';
import { WorklogsService } from './worklogs.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [WorklogsController],
  providers: [WorklogsService],
  exports: [WorklogsService],
})
export class WorklogsModule {}
