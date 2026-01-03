import {
  IsBoolean,
  IsDecimal,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAutoWithdrawalDto {
  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  @IsString()
  threshold?: string; // Decimal as string to avoid precision loss

  @IsOptional()
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY'])
  schedule?: 'DAILY' | 'WEEKLY' | 'MONTHLY';

  @IsOptional()
  @IsString()
  methodId?: string;
}
