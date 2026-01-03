import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateServicePackageDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsUUID()
    @IsNotEmpty()
    categoryId: string;

    @IsNumber()
    @IsNotEmpty()
    bronzePrice: number;

    @IsNumber()
    @IsNotEmpty()
    bronzeDeliveryTime: number;

    @IsArray()
    @IsString({ each: true })
    bronzeDeliverables: string[];

    @IsNumber()
    @IsOptional()
    silverPrice?: number;

    @IsNumber()
    @IsOptional()
    silverDeliveryTime?: number;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    silverDeliverables?: string[];

    @IsNumber()
    @IsOptional()
    goldPrice?: number;

    @IsNumber()
    @IsOptional()
    goldDeliveryTime?: number;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    goldDeliverables?: string[];
}
