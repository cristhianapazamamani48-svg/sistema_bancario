import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ example: '1000000001', description: 'Número de cuenta bancaria único' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;
}
