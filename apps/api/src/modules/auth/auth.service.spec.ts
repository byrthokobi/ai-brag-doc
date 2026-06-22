jest.mock('../users/users.service.js');
jest.mock('bcrypt', () => ({ hash: jest.fn(), compare: jest.fn() }));

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '../../generated/prisma/enums.js';

const mockHash = bcrypt.hash as jest.Mock;
const mockCompare = bcrypt.compare as jest.Mock;

const makeUser = (overrides = {}) => ({
  id: 'uuid-1',
  email: 'ada@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  password: '$2b$10$hashedpw',
  role: Role.USER,
  isActive: true,
  fcmTokens: [] as string[],
  createdAt: new Date('2026-06-09'),
  updatedAt: new Date('2026-06-09'),
  ...overrides,
});

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Pick<UsersService, 'findOne' | 'findById' | 'create'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;

  beforeEach(async () => {
    usersService = { findOne: jest.fn(), findById: jest.fn(), create: jest.fn() };
    jwtService = { sign: jest.fn().mockReturnValue('signed.jwt.token') };
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('hashes password with bcrypt 10 rounds and saves to DB', async () => {
      mockHash.mockResolvedValue('$2b$10$hashedpw');
      usersService.create.mockResolvedValue(makeUser() as any);

      await service.register({
        email: 'ada@example.com',
        password: 'plaintext',
        firstName: 'Ada',
        lastName: 'Lovelace',
      });

      expect(mockHash).toHaveBeenCalledWith('plaintext', 10);
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: '$2b$10$hashedpw' }),
      );
    });

    it('returns UserResponseDto with password excluded from serialized output', async () => {
      mockHash.mockResolvedValue('$2b$10$hashedpw');
      usersService.create.mockResolvedValue(makeUser() as any);

      const result = await service.register({
        email: 'ada@example.com',
        password: 'plaintext',
        firstName: 'Ada',
        lastName: 'Lovelace',
      });

      const plain = instanceToPlain(result);
      expect(plain.password).toBeUndefined();
      expect(plain.email).toBe('ada@example.com');
    });
  });

  describe('login', () => {
    it('returns accessToken on valid credentials and active account', async () => {
      usersService.findOne.mockResolvedValue(makeUser() as any);
      mockCompare.mockResolvedValue(true);

      const result = await service.login('ada@example.com', 'plaintext');

      expect(result).toHaveProperty('accessToken', 'signed.jwt.token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'uuid-1', email: 'ada@example.com', role: Role.USER }),
      );
    });

    it('throws 401 for wrong password', async () => {
      usersService.findOne.mockResolvedValue(makeUser() as any);
      mockCompare.mockResolvedValue(false);

      await expect(service.login('ada@example.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws 401 for non-existent email', async () => {
      usersService.findOne.mockResolvedValue(null);

      await expect(service.login('nobody@example.com', 'pw')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('ADR-002: inactive account and wrong password produce identical 401 messages', async () => {
      usersService.findOne.mockResolvedValue({ ...makeUser(), isActive: false } as any);
      let inactiveMsg = '';
      try {
        await service.login('ada@example.com', 'correct');
      } catch (e: any) {
        inactiveMsg = e.message;
      }

      usersService.findOne.mockResolvedValue(makeUser() as any);
      mockCompare.mockResolvedValue(false);
      let wrongPwMsg = '';
      try {
        await service.login('ada@example.com', 'wrong');
      } catch (e: any) {
        wrongPwMsg = e.message;
      }

      expect(inactiveMsg).not.toBe('');
      expect(inactiveMsg).toBe(wrongPwMsg);
    });

    it('ADR-002: bcrypt compare is NOT called for inactive users (early rejection)', async () => {
      usersService.findOne.mockResolvedValue({ ...makeUser(), isActive: false } as any);

      await expect(service.login('ada@example.com', 'pw')).rejects.toThrow(UnauthorizedException);
      expect(mockCompare).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('returns serialized UserResponseDto with password excluded', async () => {
      usersService.findById.mockResolvedValue(makeUser() as any);

      const result = await service.getProfile('uuid-1');
      const plain = instanceToPlain(result);

      expect(plain.id).toBe('uuid-1');
      expect(plain.password).toBeUndefined();
    });

    it('throws 401 if user does not exist in DB', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.getProfile('bad-id')).rejects.toThrow(UnauthorizedException);
    });
  });
});
