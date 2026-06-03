import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @ApiOperation({ summary: 'Crear una nueva cuenta bancaria para el usuario autenticado' })
  @Post()
  async createAccount(@Body() dto: CreateAccountDto, @Request() req: any) {
    // El userId viene del JWT, no del body (seguridad)
    return this.accountsService.createAccount(req.user.userId, dto.accountNumber);
  }

  @ApiOperation({ summary: 'Obtener todas mis cuentas bancarias' })
  @Get('my-accounts')
  async getMyAccounts(@Request() req: any) {
    return this.accountsService.getMyAccounts(req.user.userId);
  }
}
