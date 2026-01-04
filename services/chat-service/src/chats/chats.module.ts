import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { Message, MessageSchema } from './schemas/message.schema';
import { ChatGateway } from './chats.gateway';

import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsService, ChatGateway],
})
export class ChatsModule { }
