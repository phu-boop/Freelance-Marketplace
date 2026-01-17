import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { AuthenticatedUser, Public } from 'nest-keycloak-connect';

@Controller('api/chat')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) { }

  @Post()
  async create(@AuthenticatedUser() user: any, @Body() createChatDto: CreateChatDto) {
    if (createChatDto.senderId !== user.sub) {
      throw new ForbiddenException('Cannot send message as another user');
    }
    return this.chatsService.create(createChatDto);
  }

  @Get('sync')
  sync(@AuthenticatedUser() user: any, @Query('since') since: string) {
    return this.chatsService.sync(user.sub, since || new Date(0).toISOString());
  }

  @Get('conversations')
  getConversationsSelf(@AuthenticatedUser() user: any) {
    return this.chatsService.getConversations(user.sub);
  }

  @Get('conversations/:userId')
  getConversations(@AuthenticatedUser() user: any, @Param('userId') userId: string) {
    if (userId !== user.sub && !user.realm_access?.roles?.includes('realm:ADMIN')) {
      throw new ForbiddenException('You can only access your own conversations');
    }
    return this.chatsService.getConversations(userId);
  }

  @Get('history')
  getHistory(
    @AuthenticatedUser() user: any,
    @Query('user1') user1: string,
    @Query('user2') user2: string,
    @Query('before') before?: string
  ) {
    if (user1 !== user.sub && user2 !== user.sub && !user.realm_access?.roles?.includes('realm:ADMIN')) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }
    return this.chatsService.findByUsers(user1, user2, before);
  }

  @Get('search')
  searchMessages(
    @AuthenticatedUser() user: any,
    @Query('q') query: string,
    @Query('peerId') peerId?: string
  ) {
    if (!query) return [];
    return this.chatsService.searchMessages(user.sub, query, peerId);
  }

  @Get('contract/:contractId')
  findByContract(@AuthenticatedUser() user: any, @Param('contractId') contractId: string) {
    // In production, we should verify the user is part of the contract via contract-service
    return this.chatsService.findByContract(contractId);
  }

  @Get(':id')
  async findOne(@AuthenticatedUser() user: any, @Param('id') id: string) {
    const msg = await this.chatsService.findOne(id);
    if (msg && msg.senderId !== user.sub && msg.receiverId !== user.sub) {
      throw new ForbiddenException('Access denied');
    }
    return msg;
  }

  @Patch(':id')
  async editMessage(@AuthenticatedUser() user: any, @Param('id') id: string, @Body() body: { content: string }) {
    const msg = await this.chatsService.findOne(id);
    if (!msg || msg.senderId !== user.sub) {
      throw new ForbiddenException('Can only edit your own messages');
    }
    return this.chatsService.editContent(id, body.content);
  }

  @Delete(':id')
  async deleteMessage(@AuthenticatedUser() user: any, @Param('id') id: string) {
    const msg = await this.chatsService.findOne(id);
    if (!msg || msg.senderId !== user.sub) {
      throw new ForbiddenException('Can only delete your own messages');
    }
    return this.chatsService.softDelete(id);
  }

  @Patch(':id/read')
  async markRead(@AuthenticatedUser() user: any, @Param('id') id: string) {
    const msg = await this.chatsService.findOne(id);
    if (!msg || msg.receiverId !== user.sub) {
      throw new ForbiddenException('Only the receiver can mark a message as read');
    }
    return this.chatsService.markMessageRead(id);
  }

  @Public()
  @Post('link-preview')
  getLinkPreview(@Body() body: { url: string }) {
    return this.chatsService.getLinkPreview(body.url);
  }

  @Post('conversations/:peerId/archive')
  async archiveConversation(
    @AuthenticatedUser() user: any,
    @Param('peerId') peerId: string
  ) {
    return this.chatsService.setArchiveStatus(user.sub, peerId, true);
  }

  @Delete('conversations/:peerId/archive')
  async unarchiveConversation(
    @AuthenticatedUser() user: any,
    @Param('peerId') peerId: string
  ) {
    return this.chatsService.setArchiveStatus(user.sub, peerId, false);
  }

  @Post('conversations/:peerId/read')
  async markConversationRead(
    @AuthenticatedUser() user: any,
    @Param('peerId') peerId: string
  ) {
    return this.chatsService.markConversationRead(user.sub, peerId);
  }

  @Delete('conversations/:peerId')
  async deleteConversation(
    @AuthenticatedUser() user: any,
    @Param('peerId') peerId: string
  ) {
    return this.chatsService.deleteConversation(user.sub, peerId);
  }
}
