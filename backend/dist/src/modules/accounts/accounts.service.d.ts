import { AccountsRepository } from './accounts.repository';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from '@prisma/client';
export declare class AccountsService {
    private readonly accountsRepository;
    constructor(accountsRepository: AccountsRepository);
    createAccount(createAccountDto: CreateAccountDto): Promise<Account>;
    getMyAccounts(userId: string): Promise<Account[]>;
}
