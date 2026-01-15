import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
    @Prop({ required: true })
    senderId: string;

    @Prop({ required: true })
    receiverId: string;

    @Prop({ required: true })
    content: string;

    @Prop({ default: false })
    isRead: boolean;

    @Prop()
    contractId?: string; // Optional: link message to a contract

    @Prop({ type: [String], default: [] })
    attachments: string[];

    @Prop({ default: false })
    isFlagged: boolean;

    @Prop()
    flagReason?: string;

    @Prop({ type: String, ref: 'Message' })
    replyTo?: string;

    @Prop({ default: false })
    isEdited: boolean;

    @Prop()
    deletedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
