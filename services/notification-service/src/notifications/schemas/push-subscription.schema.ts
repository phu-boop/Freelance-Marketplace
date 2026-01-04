import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PushSubscriptionDocument = PushSubscription & Document;

@Schema()
class Keys {
    @Prop({ required: true })
    p256dh: string;

    @Prop({ required: true })
    auth: string;
}

@Schema()
class Subscription {
    @Prop({ required: true })
    endpoint: string;

    @Prop({ type: Keys, required: true })
    keys: Keys;
}

@Schema({ timestamps: true })
export class PushSubscription {
    @Prop({ required: true, index: true })
    userId: string;

    @Prop({ required: true })
    deviceFingerprint: string;

    @Prop({ type: Subscription, required: true })
    subscription: Subscription;
}

export const PushSubscriptionSchema = SchemaFactory.createForClass(PushSubscription);
// Ensure unique compound index for userId + deviceFingerprint
PushSubscriptionSchema.index({ userId: 1, deviceFingerprint: 1 }, { unique: true });
