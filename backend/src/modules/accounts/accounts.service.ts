import { Injectable, ConflictException } from '@nestjs/common';
import { AccountsRepository } from './accounts.repository';
import { Account } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async createAccount(userId: string, accountNumber: string): Promise<Account> {
    const existing = await this.accountsRepository.findByAccountNumber(accountNumber);
    if (existing) throw new ConflictException('El número de cuenta ya está en uso');

    return this.accountsRepository.create({
      user_id: userId,
      account_number: accountNumber,
    });
  }

  async getMyAccounts(userId: string): Promise<Account[]> {
    return this.accountsRepository.findByUserId(userId);
  }
}
