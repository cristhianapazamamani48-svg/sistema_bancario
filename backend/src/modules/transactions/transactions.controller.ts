import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { DepositDto, WithdrawalDto, TransferDto } from './dto/transfer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({ summary: 'Depositar dinero en una cuenta' })
  @Post('deposit')
  async deposit(@Body() dto: DepositDto) {
    return this.transactionsService.executeDeposit(dto.accountId, dto.amount);
  }

  @ApiOperation({ summary: 'Retirar dinero de una cuenta' })
  @Post('withdraw')
  async withdraw(@Body() dto: WithdrawalDto) {
    return this.transactionsService.executeWithdrawal(dto.accountId, dto.amount);
  }

  @ApiOperation({ summary: 'Transferir dinero entre dos cuentas (ACID + Locking)' })
  @Post('transfer')
  async transfer(@Body() dto: TransferDto) {
    return this.transactionsService.executeTransfer(dto.fromAccountId, dto.toAccountId, dto.amount);
  }

  @ApiOperation({ summary: 'Historial de transacciones de una cuenta' })
  @Get('history/:accountId')
  async history(@Param('accountId') accountId: string) {
    return this.transactionsService.getTransactionHistory(accountId);
  }
}
