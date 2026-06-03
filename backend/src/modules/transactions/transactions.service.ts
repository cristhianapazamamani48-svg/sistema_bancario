import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Depósito: Incrementa el balance de una cuenta.
   */
  async executeDeposit(accountId: string, amountStr: string) {
    const amount = new Prisma.Decimal(amountStr);
    if (amount.lte(0)) throw new ConflictException('El monto debe ser mayor a cero');

    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT * FROM accounts WHERE id = ${accountId}::uuid FOR UPDATE`;

      const account = await tx.account.findUnique({ where: { id: accountId } });
      if (!account) throw new NotFoundException('Cuenta no encontrada');
      if (account.status !== 'ACTIVE') throw new ConflictException('La cuenta no está activa');

      const newBalance = account.balance.add(amount);

      await tx.account.update({ where: { id: accountId }, data: { balance: newBalance } });

      const transaction = await tx.transaction.create({
        data: {
          to_account_id: accountId,
          amount,
          type: 'DEPOSIT',
          status: 'COMPLETED',
        },
      });

      await tx.ledgerEntry.create({
        data: {
          account_id: accountId,
          transaction_id: transaction.id,
          entry_type: 'CREDIT',
          amount,
          balance_before: account.balance,
          balance_after: newBalance,
        },
      });

      return transaction;
    });
  }

  /**
   * Retiro: Decrementa el balance de una cuenta.
   */
  async executeWithdrawal(accountId: string, amountStr: string) {
    const amount = new Prisma.Decimal(amountStr);
    if (amount.lte(0)) throw new ConflictException('El monto debe ser mayor a cero');

    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT * FROM accounts WHERE id = ${accountId}::uuid FOR UPDATE`;

      const account = await tx.account.findUnique({ where: { id: accountId } });
      if (!account) throw new NotFoundException('Cuenta no encontrada');
      if (account.status !== 'ACTIVE') throw new ConflictException('La cuenta no está activa');
      if (account.balance.lt(amount)) throw new ConflictException('Saldo insuficiente');

      const newBalance = account.balance.sub(amount);

      await tx.account.update({ where: { id: accountId }, data: { balance: newBalance } });

      const transaction = await tx.transaction.create({
        data: {
          from_account_id: accountId,
          amount,
          type: 'WITHDRAWAL',
          status: 'COMPLETED',
        },
      });

      await tx.ledgerEntry.create({
        data: {
          account_id: accountId,
          transaction_id: transaction.id,
          entry_type: 'DEBIT',
          amount,
          balance_before: account.balance,
          balance_after: newBalance,
        },
      });

      return transaction;
    });
  }

  /**
   * Transferencia: Mueve dinero entre dos cuentas con ACID y Pessimistic Locking.
   */
  async executeTransfer(fromAccountId: string, toAccountId: string, amountStr: string) {
    const amount = new Prisma.Decimal(amountStr);
    if (amount.lte(0)) throw new ConflictException('El monto de la transferencia debe ser mayor a cero');
    if (fromAccountId === toAccountId) throw new ConflictException('No puedes transferir a la misma cuenta');

    // PREVENCIÓN DE DEADLOCKS: Ordenamos los IDs para bloquear siempre en el mismo orden
    const accountsToLock = [fromAccountId, toAccountId].sort();

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. PESSIMISTIC LOCKING
        for (const id of accountsToLock) {
          await tx.$executeRaw`SELECT * FROM accounts WHERE id = ${id}::uuid FOR UPDATE`;
        }

        // 2. Consultar estado actual
        const fromAcc = await tx.account.findUnique({ where: { id: fromAccountId } });
        const toAcc = await tx.account.findUnique({ where: { id: toAccountId } });

        if (!fromAcc || !toAcc) throw new ConflictException('Una de las cuentas no existe');
        if (fromAcc.status !== 'ACTIVE' || toAcc.status !== 'ACTIVE') throw new ConflictException('Ambas cuentas deben estar ACTIVAS');
        if (fromAcc.balance.lt(amount)) throw new ConflictException('Saldo insuficiente en la cuenta de origen');

        // 3. Calcular nuevos balances
        const newFromBalance = fromAcc.balance.sub(amount);
        const newToBalance = toAcc.balance.add(amount);

        // 4. Actualizar balances
        await tx.account.update({ where: { id: fromAccountId }, data: { balance: newFromBalance } });
        await tx.account.update({ where: { id: toAccountId }, data: { balance: newToBalance } });

        // 5. Registrar la Transacción
        const transaction = await tx.transaction.create({
          data: {
            from_account_id: fromAccountId,
            to_account_id: toAccountId,
            amount,
            type: 'TRANSFER',
            status: 'COMPLETED',
          },
        });

        // 6. Asientos Contables Inmutables (Double-Entry Bookkeeping)
        await tx.ledgerEntry.createMany({
          data: [
            {
              account_id: fromAccountId,
              transaction_id: transaction.id,
              entry_type: 'DEBIT',
              amount,
              balance_before: fromAcc.balance,
              balance_after: newFromBalance,
            },
            {
              account_id: toAccountId,
              transaction_id: transaction.id,
              entry_type: 'CREDIT',
              amount,
              balance_before: toAcc.balance,
              balance_after: newToBalance,
            },
          ],
        });

        return transaction;
      });
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Fallo crítico procesando la transferencia. Transacción revertida.');
    }
  }

  /**
   * Historial de transacciones de una cuenta.
   */
  async getTransactionHistory(accountId: string) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [
          { from_account_id: accountId },
          { to_account_id: accountId },
        ],
      },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
  }
}
