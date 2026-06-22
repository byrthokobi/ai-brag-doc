import { Exclude } from 'class-transformer';
import { Role } from '../../../generated/prisma/enums.js';

export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  fcmTokens: string[];
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
