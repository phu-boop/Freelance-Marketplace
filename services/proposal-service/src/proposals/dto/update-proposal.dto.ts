import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateProposalDto } from './create-proposal.dto';

export class UpdateProposalDto extends PartialType(CreateProposalDto) {
    @IsString()
    @IsOptional()
    baseVersion?: string;
}
