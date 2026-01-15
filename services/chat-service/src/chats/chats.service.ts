import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Message } from './schemas/message.schema';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) { }

  async create(createChatDto: CreateChatDto): Promise<Message> {
    const createdMessage = new this.messageModel(createChatDto);
    const message = await createdMessage.save();

    // Trigger behavioral metrics update
    this.handleBehavioralMetrics(message).catch(err =>
      console.error('Failed to update behavioral metrics:', err.message)
    );

    // Trigger fraud detection
    this.handleFraudDetection(message).catch(err =>
      console.error('Failed to trigger fraud detection:', err.message)
    );

    return message;
  }

  private async handleBehavioralMetrics(message: Message) {
    const { senderId, receiverId, content } = message;
    const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL', 'http://user-service:3001');
    const jobServiceUrl = this.configService.get<string>('JOB_SERVICE_URL', 'http://job-service:3002');

    // 1. Calculate Response Time
    const lastMessage = await this.messageModel
      .findOne({
        $or: [
          { senderId: senderId, receiverId: receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
        _id: { $ne: message._id }
      })
      .sort({ createdAt: -1 })
      .exec();

    if (lastMessage && lastMessage.senderId === receiverId) {
      // It's a reply to the previous message from the other person
      const diffMs = message.createdAt.getTime() - lastMessage.createdAt.getTime();
      const diffMin = diffMs / (1000 * 60);

      try {
        // Fetch current user data to calculate rolling average
        const userRes: any = await firstValueFrom(
          this.httpService.get(`${userServiceUrl}/api/users/${senderId}`)
        );
        const user = userRes.data;

        const currentAvg = user.avgResponseTime || 0;
        const count = await this.messageModel.countDocuments({ senderId });
        const newAvg = currentAvg === 0 ? diffMin : (currentAvg * (count - 1) + diffMin) / count;

        await firstValueFrom(
          this.httpService.patch(`${userServiceUrl}/api/users/${senderId}`, {
            avgResponseTime: newAvg
          })
        );
      } catch (err) {
        console.error(`Failed to update avgResponseTime for user ${senderId}:`, err.message);
      }
    }

    // 2. Trigger AI Style Analysis if enough messages (e.g., exactly 10 for first analysis)
    const senderMessageCount = await this.messageModel.countDocuments({ senderId });
    if (senderMessageCount === 10) {
      try {
        const last10Messages = await this.messageModel
          .find({ senderId })
          .sort({ createdAt: -1 })
          .limit(10)
          .exec();

        const contents = last10Messages.map(m => m.content);

        // This endpoint doesn't exist yet, we'll need to create it in job-service or call AiService directly if shared.
        // But for now we call the job-service analysis endpoint.
        const analysisRes: any = await firstValueFrom(
          this.httpService.post(`${jobServiceUrl}/api/jobs/ai/analyze-style`, {
            messages: contents
          })
        );
        const analysis = analysisRes.data;

        if (analysis.style) {
          await firstValueFrom(
            this.httpService.patch(`${userServiceUrl}/api/users/${senderId}`, {
              communicationStyle: analysis.style
            })
          );
        }
      } catch (err) {
        console.error(`Failed to trigger style analysis for user ${senderId}:`, err.message);
      }
    }
  }

  private async handleFraudDetection(message: Message) {
    const { content } = message;
    const jobServiceUrl = this.configService.get<string>('JOB_SERVICE_URL', 'http://job-service:3002');

    try {
      const fraudRes: any = await firstValueFrom(
        this.httpService.post(`${jobServiceUrl}/api/jobs/ai/detect-fraud`, {
          content
        })
      );
      const { isFlagged, reason } = fraudRes.data;

      if (isFlagged) {
        await this.messageModel.findByIdAndUpdate(message._id, {
          isFlagged: true,
          flagReason: reason
        });
      }
    } catch (err) {
      console.error(`Failed to analyze fraud for message ${message._id}:`, err.message);
    }
  }

  async findAll(): Promise<Message[]> {
    return this.messageModel.find().exec();
  }

  async findByUsers(user1: string, user2: string, before?: string): Promise<Message[]> {
    const query: any = {
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await this.messageModel
      .find(query)
      .sort({ createdAt: -1 }) // Get newest first
      .limit(50)
      .exec();

    return messages.reverse(); // Return in chronological order
  }

  async findByContract(contractId: string): Promise<Message[]> {
    return this.messageModel
      .find({ contractId })
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
          unreadCount: 0
        });
      }

      const conv = conversationsMap.get(otherId);

      // Calculate unread count (if I am the receiver and message is not read)
      if (msg.receiverId === userId && !msg.isRead) {
        conv.unreadCount += 1;
      }
    });

    return Array.from(conversationsMap.values());
  }

  async sync(since: string): Promise<any> {
    const sinceDate = new Date(since);
    const newSince = new Date();

    const upserted = await this.messageModel.find({
      updatedAt: { $gt: sinceDate }
    }).exec();

    return {
      newSince: newSince.toISOString(),
      upserted: { messages: upserted },
      deleted: { messages: [] },
    };
  }
  async editContent(id: string, content: string): Promise<Message | null> {
    return this.messageModel
      .findByIdAndUpdate(id, { content, isEdited: true }, { new: true })
      .exec();
  }

  async softDelete(id: string): Promise<Message | null> {
    return this.messageModel
      .findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true })
      .exec();
  }
}

