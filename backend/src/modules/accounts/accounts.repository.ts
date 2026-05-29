import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Account, Prisma } from '@prisma/client';

@Injectable()
export class AccountsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.AccountUncheckedCreateInput): Promise<Account> {
    return this.prisma.account.create({ data });
  }

  async findByAccountNumber(accountNumber: string): Promise<Account | null> {
    return this.prisma.account.findUnique({ where: { account_number: accountNumber } });
  }

  async findByUserId(userId: string): Promise<Account[]> {
    return this.prisma.account.findMany({ where: { user_id: userId } });
  }
}
