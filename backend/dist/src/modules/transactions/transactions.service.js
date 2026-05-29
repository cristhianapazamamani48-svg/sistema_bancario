"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TransactionsService = class TransactionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async executeTransfer(fromAccountId, toAccountId, amountStr) {
        const amount = new client_1.Prisma.Decimal(amountStr);
        if (amount.lte(0)) {
            throw new common_1.ConflictException('El monto de la transferencia debe ser mayor a cero');
        }
        const accountsToLock = [fromAccountId, toAccountId].sort();
        try {
            return await this.prisma.$transaction(async (tx) => {
                for (const id of accountsToLock) {
                    await tx.$executeRaw `SELECT * FROM accounts WHERE id = ${id}::uuid FOR UPDATE`;
                }
                const fromAcc = await tx.account.findUnique({ where: { id: fromAccountId } });
                const toAcc = await tx.account.findUnique({ where: { id: toAccountId } });
                if (!fromAcc || !toAcc) {
                    throw new common_1.ConflictException('Una de las cuentas no existe');
                }
                if (fromAcc.status !== 'ACTIVE' || toAcc.status !== 'ACTIVE') {
                    throw new common_1.ConflictException('Ambas cuentas deben estar ACTIVAS');
                }
                if (fromAcc.balance.lt(amount)) {
                    throw new common_1.ConflictException('Saldo insuficiente en la cuenta de origen');
                }
                const newFromBalance = fromAcc.balance.sub(amount);
                const newToBalance = toAcc.balance.add(amount);
                await tx.account.update({
                    where: { id: fromAccountId },
                    data: { balance: newFromBalance },
                });
                await tx.account.update({
                    where: { id: toAccountId },
                    data: { balance: newToBalance },
                });
                const transaction = await tx.transaction.create({
                    data: {
                        from_account_id: fromAccountId,
                        to_account_id: toAccountId,
                        amount: amount,
                        type: 'TRANSFER',
                        status: 'COMPLETED',
                    },
                });
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
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Fallo crítico procesando la transferencia. Transacción revertida.');
        }
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map