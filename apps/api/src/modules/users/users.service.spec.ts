jest.mock('../prisma/prisma.service.js');

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '../../generated/prisma/enums.js';

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

describe('UsersService', () => {
  let service: UsersService;
  let prisma: { user: Record<string, jest.Mock>; $transaction: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('returns users array and total count', async () => {
      const users = [makeUser(), makeUser({ id: 'uuid-2' })];
      prisma.$transaction.mockResolvedValue([users, 2]);

      const result = await service.findAll(1, 20);

      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('calls $transaction for concurrent findMany + count', async () => {
      prisma.$transaction.mockResolvedValue([[], 0]);

      await service.findAll(2, 10);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('updates user fields and returns updated record', async () => {
      const updated = makeUser({ isActive: false });
      prisma.user.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', { isActive: false });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { isActive: false },
      });
      expect(result.isActive).toBe(false);
    });

    it('throws NotFoundException for Prisma P2025 (record not found)', async () => {
      prisma.user.update.mockRejectedValue({ code: 'P2025' });

      await expect(service.update('bad-id', { isActive: false })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('re-throws non-P2025 errors unchanged', async () => {
      prisma.user.update.mockRejectedValue(new Error('connection reset'));

      await expect(service.update('uuid-1', {})).rejects.toThrow('connection reset');
    });
  });

  describe('addFcmToken', () => {
    it('pushes token when not already present', async () => {
      const existing = makeUser({ fcmTokens: [] });
      prisma.user.findUnique.mockResolvedValue(existing);
      prisma.user.update.mockResolvedValue(undefined);

      await service.addFcmToken('uuid-1', 'token-abc');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { fcmTokens: { push: 'token-abc' } },
      });
    });

    it('skips update when token already present (idempotent)', async () => {
      const existing = makeUser({ fcmTokens: ['token-abc'] });
      prisma.user.findUnique.mockResolvedValue(existing);

      await service.addFcmToken('uuid-1', 'token-abc');

      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
