import { PrismaService } from '../../prisma/prisma.service';
import { Account, Prisma } from '@prisma/client';
export declare class AccountsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.AccountUncheckedCreateInput): Promise<Account>;
    findByAccountNumber(accountNumber: string): Promise<Account | null>;
    findByUserId(userId: string): Promise<Account[]>;
}
