import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  companySize?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  primaryCategoryId?: string;

  @IsArray()
  @IsOptional()
  roles?: string[];

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  overview?: string;

  @IsNumber()
  @IsOptional()
  hourlyRate?: number;

  @IsArray()
  @IsOptional()
  skills?: string[];

  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  inAppNotifications?: boolean;

  @IsString()
  @IsOptional()
  communicationStyle?: string;

  @IsNumber()
  @IsOptional()
  avgResponseTime?: number;

  @IsNumber()
  @IsOptional()
  reliabilityScore?: number;

  @IsString()
  @IsOptional()
  kycStatus?: string;

  @IsBoolean()
  @IsOptional()
  isIdentityVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  isPaymentVerified?: boolean;
}
