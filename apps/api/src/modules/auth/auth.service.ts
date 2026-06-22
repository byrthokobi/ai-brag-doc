import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from './dto/user-response.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<UserResponseDto> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      password: hashedPassword,
    });
    return new UserResponseDto(user);
  }

  async login(email: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.usersService.findOne(email);

    if (!user || !user.isActive) {
      this.logger.debug(`Login failed for ${email}: ${!user ? 'not-found' : 'inactive-account'}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      this.logger.debug(`Login failed for ${email}: invalid-credentials`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return new UserResponseDto(user);
  }
}
