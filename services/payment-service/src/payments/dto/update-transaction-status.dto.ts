import { IsString, IsIn } from 'class-validator';

export class UpdateTransactionStatusDto {
  @IsString()
  @IsIn(['COMPLETED', 'REFUNDED', 'DISPUTED'])
  status: 'COMPLETED' | 'REFUNDED' | 'DISPUTED';
}
