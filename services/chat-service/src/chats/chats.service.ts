import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Message } from './schemas/message.schema';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) { }

  async create(createChatDto: CreateChatDto): Promise<Message> {
    const createdMessage = new this.messageModel(createChatDto);
    return createdMessage.save();
  }

  async findAll(): Promise<Message[]> {
    return this.messageModel.find().exec();
  }

  async findByUsers(user1: string, user2: string): Promise<Message[]> {
    return this.messageModel
      .find({
        $or: [
          { senderId: user1, receiverId: user2 },
          { senderId: user2, receiverId: user1 },
        ],
      })
      .sort({ createdAt: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Message | null> {
    return this.messageModel.findById(id).exec();
  }

  async update(id: string, updateChatDto: UpdateChatDto): Promise<Message | null> {
    return this.messageModel
      .findByIdAndUpdate(id, updateChatDto, { new: true })
      .exec();
  }

  async getConversations(userId: string): Promise<any[]> {
    const messages = await this.messageModel
      .find({
        $or: [{ senderId: userId }, { receiverId: userId }],
      })
      .sort({ createdAt: -1 })
      .exec();

    const conversationsMap = new Map();

    messages.forEach((msg) => {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversationsMap.has(otherId)) {
        conversationsMap.set(otherId, {
          otherId,
          lastMessage: msg.content,
          timestamp: msg.createdAt,
          isRead: msg.isRead,
        });
      }
    });

    return Array.from(conversationsMap.values());
  }
}
