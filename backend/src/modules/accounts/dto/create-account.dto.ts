import { IsNotEmpty, IsUUID, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsUUID('4')
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;
}
