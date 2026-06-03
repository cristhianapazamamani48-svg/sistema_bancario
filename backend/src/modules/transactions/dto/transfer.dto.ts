import { IsNotEmpty, IsUUID, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID('4')
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({ example: '500.00', description: 'Monto a depositar (como string para precisión)' })
  @IsNumberString({}, { message: 'El monto debe ser numérico' })
  @IsNotEmpty()
  amount: string;
}

export class WithdrawalDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID('4')
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({ example: '100.00', description: 'Monto a retirar (como string para precisión)' })
  @IsNumberString({}, { message: 'El monto debe ser numérico' })
  @IsNotEmpty()
  amount: string;
}

export class TransferDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID('4', { message: 'El ID de la cuenta de origen debe ser un UUID válido' })
  @IsNotEmpty()
  fromAccountId: string;

  @ApiProperty({ example: '660e8400-e29b-41d4-a716-446655440000' })
  @IsUUID('4', { message: 'El ID de la cuenta de destino debe ser un UUID válido' })
  @IsNotEmpty()
  toAccountId: string;

  @ApiProperty({ example: '250.75', description: 'Monto a transferir (como string para precisión)' })
  @IsNumberString({}, { message: 'El monto debe ser numérico válido (ej: "100.50")' })
  @IsNotEmpty()
  amount: string;
}
