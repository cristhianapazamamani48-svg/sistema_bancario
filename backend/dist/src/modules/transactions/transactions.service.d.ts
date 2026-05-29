import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class TransactionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    executeTransfer(fromAccountId: string, toAccountId: string, amountStr: string): Promise<{
        id: string;
        created_at: Date;
        status: import("@prisma/client").$Enums.TransactionStatus;
        amount: Prisma.Decimal;
        type: import("@prisma/client").$Enums.TransactionType;
        failure_reason: string | null;
        from_account_id: string | null;
        to_account_id: string | null;
    }>;
}
