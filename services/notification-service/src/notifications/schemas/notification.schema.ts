import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    type: string; // e.g., 'JOB_POSTED', 'PROPOSAL_RECEIVED', 'CONTRACT_SIGNED', 'PAYMENT_RECEIVED'

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    message: string;

    @Prop({ default: false })
    isRead: boolean;

    @Prop()
    link?: string;

    @Prop({ type: Object })
    metadata?: Record<string, any>; // Optional: extra data like jobId, proposalId, etc.
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
