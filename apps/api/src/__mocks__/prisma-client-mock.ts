export class PrismaClient {
  $connect = jest.fn();
  $disconnect = jest.fn();
  $transaction = jest.fn();
  user = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  };
}

export * from '../generated/prisma/enums.js';
