import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            $executeRaw: jest.fn(),
            account: { findUnique: jest.fn(), update: jest.fn() },
            transaction: { create: jest.fn() },
            ledgerEntry: { createMany: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executeTransfer', () => {
    it('should throw ConflictException if amount is <= 0', async () => {
      await expect(service.executeTransfer('acc1', 'acc2', '0')).rejects.toThrow(ConflictException);
      await expect(service.executeTransfer('acc1', 'acc2', '-50')).rejects.toThrow(ConflictException);
    });

    it('should execute transfer successfully with valid parameters', async () => {
      // Mock del callback de la transacción Prisma
      jest.spyOn(prismaService, '$transaction').mockImplementation(async (callback) => {
        const txPrisma = {
          $executeRaw: jest.fn().mockResolvedValue(true),
          account: {
            findUnique: jest.fn().mockImplementation(({ where }) => {
              if (where.id === 'acc1') return Promise.resolve({ id: 'acc1', balance: new Prisma.Decimal(1000), status: 'ACTIVE' });
              if (where.id === 'acc2') return Promise.resolve({ id: 'acc2', balance: new Prisma.Decimal(500), status: 'ACTIVE' });
            }),
            update: jest.fn().mockResolvedValue(true),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({ id: 'tx1', status: 'COMPLETED' }),
          },
          ledgerEntry: {
            createMany: jest.fn().mockResolvedValue(true),
          }
        };
        return callback(txPrisma as any);
      });

      const result = await service.executeTransfer('acc1', 'acc2', '100.50');
      
      expect(result.id).toBe('tx1');
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw ConflictException if insufficient funds', async () => {
      jest.spyOn(prismaService, '$transaction').mockImplementation(async (callback) => {
        const txPrisma = {
          $executeRaw: jest.fn().mockResolvedValue(true),
          account: {
            findUnique: jest.fn().mockImplementation(({ where }) => {
              if (where.id === 'acc1') return Promise.resolve({ id: 'acc1', balance: new Prisma.Decimal(50), status: 'ACTIVE' }); // Solo tiene 50
              if (where.id === 'acc2') return Promise.resolve({ id: 'acc2', balance: new Prisma.Decimal(500), status: 'ACTIVE' });
            }),
          },
        };
        return callback(txPrisma as any);
      });

      await expect(service.executeTransfer('acc1', 'acc2', '100')).rejects.toThrow(ConflictException);
    });
  });
});
