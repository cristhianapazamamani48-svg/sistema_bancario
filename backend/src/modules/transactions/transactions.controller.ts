import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransferDto } from './dto/transfer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard) // Endpoint protegido, solo usuarios autenticados
@ApiBearerAuth() // Indicador para Swagger
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('transfer')
  async transfer(@Body() transferDto: TransferDto) {
    return this.transactionsService.executeTransfer(
      transferDto.fromAccountId,
      transferDto.toAccountId,
      transferDto.amount
    );
  }
}
