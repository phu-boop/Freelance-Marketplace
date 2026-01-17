import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversationMetadataDocument = ConversationMetadata & Document;

@Schema({ timestamps: true })
export class ConversationMetadata {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    peerId: string;

    @Prop({ default: false })
    isArchived: boolean;

    @Prop({ default: false })
    isMuted: boolean;

    @Prop({ default: false })
    isDeleted: boolean;
}

export const ConversationMetadataSchema = SchemaFactory.createForClass(ConversationMetadata);

// Compound index for efficient lookup
ConversationMetadataSchema.index({ userId: 1, peerId: 1 }, { unique: true });
