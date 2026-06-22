import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';

@Module({
  providers: [UsersService, RolesGuard],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
