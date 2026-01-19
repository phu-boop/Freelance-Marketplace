import { IsString, IsOptional, IsNumber, IsIn, Min } from 'class-validator';

export class GetTransactionDto {
  @IsString()
  id: string;
}
