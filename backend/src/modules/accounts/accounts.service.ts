import { Injectable, ConflictException } from '@nestjs/common';
import { AccountsRepository } from './accounts.repository';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async createAccount(createAccountDto: CreateAccountDto): Promise<Account> {
    const existing = await this.accountsRepository.findByAccountNumber(createAccountDto.accountNumber);
    if (existing) throw new ConflictException('El número de cuenta ya está en uso');

    return this.accountsRepository.create({
      user_id: createAccountDto.userId,
      account_number: createAccountDto.accountNumber,
    });
  }

  async getMyAccounts(userId: string): Promise<Account[]> {
    return this.accountsRepository.findByUserId(userId);
  }
}
