import { IsNotEmpty, IsUUID, IsNumberString } from 'class-validator';

export class TransferDto {
  @IsUUID('4', { message: 'El ID de la cuenta de origen debe ser un UUID válido' })
  @IsNotEmpty()
  fromAccountId: string;

  @IsUUID('4', { message: 'El ID de la cuenta de destino debe ser un UUID válido' })
  @IsNotEmpty()
  toAccountId: string;

  // Recibimos el monto como String para evitar los problemas de precisión del tipo Float/Double en JS
  @IsNumberString({}, { message: 'El monto debe ser numérico válido (ej: "100.50")' })
  @IsNotEmpty()
  amount: string;
}
