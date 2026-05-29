import { TransactionsService } from './transactions.service';
import { TransferDto } from './dto/transfer.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    transfer(transferDto: TransferDto): Promise<{
        id: string;
        created_at: Date;
        status: import("@prisma/client").$Enums.TransactionStatus;
        amount: import("@prisma/client-runtime-utils").Decimal;
        type: import("@prisma/client").$Enums.TransactionType;
        failure_reason: string | null;
        from_account_id: string | null;
        to_account_id: string | null;
    }>;
}
