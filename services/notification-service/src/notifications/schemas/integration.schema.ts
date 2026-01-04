import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IntegrationDocument = Integration & Document;

@Schema({ timestamps: true })
export class Integration {
    @Prop({ required: true, index: true })
    userId: string;

    @Prop({ required: true, enum: ['slack', 'discord'] })
    provider: string;

    @Prop({ required: true })
    webhookUrl: string;

    @Prop({ type: [String], default: [] })
    events: string[]; // e.g., 'JOB_OFFER', 'PAYMENT_RECEIVED'

    @Prop({ default: true })
    isActive: boolean;
}

export const IntegrationSchema = SchemaFactory.createForClass(Integration);
