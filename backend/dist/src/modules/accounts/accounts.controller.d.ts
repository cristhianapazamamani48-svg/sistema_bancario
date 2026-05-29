import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
export declare class AccountsController {
    private readonly accountsService;
    constructor(accountsService: AccountsService);
    createAccount(createAccountDto: CreateAccountDto): Promise<{
        id: string;
        created_at: Date;
        account_number: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        status: import("@prisma/client").$Enums.AccountStatus;
        version: number;
        user_id: string;
    }>;
    getMyAccounts(req: any): Promise<{
        id: string;
        created_at: Date;
        account_number: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        status: import("@prisma/client").$Enums.AccountStatus;
        version: number;
        user_id: string;
    }[]>;
}
