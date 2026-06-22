import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../../generated/prisma/enums.js';

export class UpdateUserDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
