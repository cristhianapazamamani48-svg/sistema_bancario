import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ejecuta una transferencia bancaria estricta con ACID y Pessimistic Locking.
   */
  async executeTransfer(fromAccountId: string, toAccountId: string, amountStr: string) {
    const amount = new Prisma.Decimal(amountStr);
    
    if (amount.lte(0)) {
      throw new ConflictException('El monto de la transferencia debe ser mayor a cero');
    }

    // PREVENCIÓN DE DEADLOCKS: Ordenamos los IDs para bloquear siempre en el mismo orden alfabético
    const accountsToLock = [fromAccountId, toAccountId].sort();

    try {
      // Iniciamos la Transacción de Base de Datos
      return await this.prisma.$transaction(async (tx) => {
        
        // 1. PESSIMISTIC LOCKING: Bloqueamos las filas a nivel base de datos
        // Ninguna otra petición concurrente podrá leer/escribir estas cuentas hasta que terminemos
        for (const id of accountsToLock) {
          await tx.$executeRaw`SELECT * FROM accounts WHERE id = ${id}::uuid FOR UPDATE`;
        }

        // 2. Consultar el estado actual de las cuentas (ahora es 100% seguro)
        const fromAcc = await tx.account.findUnique({ where: { id: fromAccountId } });
        const toAcc = await tx.account.findUnique({ where: { id: toAccountId } });

        if (!fromAcc || !toAcc) {
          throw new ConflictException('Una de las cuentas no existe');
        }
        if (fromAcc.status !== 'ACTIVE' || toAcc.status !== 'ACTIVE') {
          throw new ConflictException('Ambas cuentas deben estar ACTIVAS');
        }

        // 3. Verificar la regla de negocio más importante
        if (fromAcc.balance.lt(amount)) {
          throw new ConflictException('Saldo insuficiente en la cuenta de origen');
        }

        // 4. Calcular los nuevos balances
        const newFromBalance = fromAcc.balance.sub(amount);
        const newToBalance = toAcc.balance.add(amount);

        // 5. Actualizar los balances
        await tx.account.update({
          where: { id: fromAccountId },
          data: { balance: newFromBalance },
        });

        await tx.account.update({
          where: { id: toAccountId },
          data: { balance: newToBalance },
        });

        // 6. Registrar la Transacción (Status: COMPLETED)
        const transaction = await tx.transaction.create({
          data: {
            from_account_id: fromAccountId,
            to_account_id: toAccountId,
            amount: amount,
            type: 'TRANSFER',
            status: 'COMPLETED',
          },
        });

        // 7. Escribir en el Ledger (Asientos Contables Inmutables)
        await tx.ledgerEntry.createMany({
          data: [
            {
              account_id: fromAccountId,
              transaction_id: transaction.id,
              entry_type: 'DEBIT',
              amount: amount,
              balance_before: fromAcc.balance,
              balance_after: newFromBalance,
            },
            {
              account_id: toAccountId,
              transaction_id: transaction.id,
              entry_type: 'CREDIT',
              amount: amount,
              balance_before: toAcc.balance,
              balance_after: newToBalance,
            }
          ]
        });

        return transaction;
      });
    } catch (error) {
      // Si fue una excepción de negocio (ej. fondos insuficientes), la dejamos pasar
      if (error instanceof ConflictException) {
        throw error;
      }
      
      // Si fue un fallo interno (ej. Postgres falló, red caída), retornamos 500
      // La transacción de Prisma automáticamente hace ROLLBACK de TODO.
      throw new InternalServerErrorException('Fallo crítico procesando la transferencia. Transacción revertida.');
    }
  }
}
