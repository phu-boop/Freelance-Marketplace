import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Controller('api/chat')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) { }

  @Post()
  create(@Body() createChatDto: CreateChatDto) {
    return this.chatsService.create(createChatDto);
  }

  @Get('sync')
  sync(@Query('since') since: string) {
    return this.chatsService.sync(since || new Date(0).toISOString());
  }

  @Get()
  findAll(@Query('user1') user1?: string, @Query('user2') user2?: string) {
    if (user1 && user2) {
      return this.chatsService.findByUsers(user1, user2);
    }
    return this.chatsService.findAll();
  }

  @Get('conversations/:userId')
  getConversations(@Param('userId') userId: string) {
    return this.chatsService.getConversations(userId);
  }

  @Get('history')
  getHistory(
    @Query('user1') user1: string,
    @Query('user2') user2: string,
    @Query('before') before?: string
  ) {
    return this.chatsService.findByUsers(user1, user2, before);
  }

  @Get('contract/:contractId')
  findByContract(@Param('contractId') contractId: string) {
    return this.chatsService.findByContract(contractId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatsService.findOne(id);
  }

  // Edit message content (only updates content and marks as edited)
  @Patch(':id')
  editMessage(@Param('id') id: string, @Body() body: { content: string }) {
    return this.chatsService.editContent(id, body.content);
  }

  // Soft delete a message (marks deletedAt)
  @Delete(':id')
  deleteMessage(@Param('id') id: string) {
    return this.chatsService.softDelete(id);
  }
}
