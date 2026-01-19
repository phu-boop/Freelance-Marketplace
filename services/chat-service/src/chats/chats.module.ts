import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { Message, MessageSchema } from './schemas/message.schema';
import { ConversationMetadata, ConversationMetadataSchema } from './schemas/conversation-metadata.schema';
import { ChatGateway } from './chats.gateway';
import { GuardianService } from '../guardian/guardian.service';

import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: ConversationMetadata.name, schema: ConversationMetadataSchema }
    ]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsService, ChatGateway, GuardianService],
})
export class ChatsModule { }
