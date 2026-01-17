import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import ogs from 'open-graph-scraper';
// Define interface for OG results
export interface OpenGraphResult {
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: { url: string }[];
  ogUrl?: string;
}
import { Message } from './schemas/message.schema';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { ConversationMetadata } from './schemas/conversation-metadata.schema';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(ConversationMetadata.name) private metadataModel: Model<ConversationMetadata>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) { }

  async create(createChatDto: CreateChatDto): Promise<Message> {
    // Basic profanity filter
    const blacklist = ['badword1', 'badword2', 'spamlink.com']; // Extend this in production
    const containsBadWord = blacklist.some(word =>
      createChatDto.content.toLowerCase().includes(word)
    );

    const createdMessage = new this.messageModel({
      ...createChatDto,
      isFlagged: createChatDto.isFlagged || containsBadWord,
      flagReason: createChatDto.flagReason || (containsBadWord ? 'Profanity/Blacklisted content detected' : undefined)
    });
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
      .populate('replyTo')
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

  // Mark a message as read (set isRead = true)
  async markMessageRead(messageId: string): Promise<Message | null> {
    return this.messageModel
      .findByIdAndUpdate(messageId, { isRead: true }, { new: true })
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

    // Option B: Efficient Aggregation (Recommended for later, but let's keep current logic for now or switch)
    // For now, I'll enhance the current logic to be slightly better by limiting the initial fetch if needed,
    // but the proper way is an aggregation pipeline.

    // Fetch metadata for user's conversations
    const metadata = await this.metadataModel.find({ userId }).exec();
    const metadataMap = new Map(metadata.map(m => [m.peerId, m]));

    // Enrich conversations with metadata and filter archived ones by default?
    // For now, return all but mark them as isArchived
    const results = Array.from(conversationsMap.values()).map((conv: any) => {
      const meta = metadataMap.get(conv.otherId);
      return {
        ...conv,
        isArchived: meta?.isArchived || false,
        isMuted: meta?.isMuted || false
      };
    });

    return results;
  }

  async setArchiveStatus(userId: string, peerId: string, isArchived: boolean): Promise<any> {
    return this.metadataModel.findOneAndUpdate(
      { userId, peerId },
      { isArchived },
      { upsert: true, new: true }
    ).exec();
  }

  async deleteConversation(userId: string, peerId: string): Promise<any> {
    // Logic: Maybe set a 'hidden' flag? or 'deletedAt'?
    // For MVP, let's just use a 'isDeleted' flag in metadata if we update the schema,
    // OR we can just 'Archive' it and pretend it's deleted? No, that's confusing.
    // Let's really delete the messages? No, destructive.
    // Let's just remove the metadata entry? No, that resets state.
    // Let's add isDeleted to schema first.
    return this.metadataModel.findOneAndUpdate(
      { userId, peerId },
      { isDeleted: true }, // We need to add this field
      { upsert: true, new: true }
    ).exec();
  }

  async markConversationRead(userId: string, otherId: string): Promise<void> {
    await this.messageModel.updateMany(
      { senderId: otherId, receiverId: userId, isRead: false },
      { isRead: true }
    ).exec();
  }

  async sync(userId: string, since: string): Promise<any> {
    const sinceDate = new Date(since);
    const newSince = new Date();

    const upserted = await this.messageModel.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
      updatedAt: { $gt: sinceDate }
    }).exec();

    // Check for deleted items in metadata or soft-deleted messages
    const deletedMessages = await this.messageModel.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
      deletedAt: { $gt: sinceDate }
    }).select('_id').exec();

    return {
      newSince: newSince.toISOString(),
      upserted: { messages: upserted },
      deleted: { messages: deletedMessages.map(m => m._id) },
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

  async getLinkPreview(url: string): Promise<OpenGraphResult> {
    try {
      // @ts-ignore
      const data = await ogs({ url });
      const { result } = data;
      return {
        ogTitle: result.ogTitle,
        ogDescription: result.ogDescription,
        ogImage: result.ogImage,
        ogUrl: result.ogUrl
      };
    } catch (error) {
      console.error('Error fetching OG data:', error);
      return {};
    }
  }
  async searchMessages(userId: string, query: string, peerId?: string): Promise<Message[]> {
    const filter: any = {
      content: { $regex: query, $options: 'i' },
      deletedAt: { $exists: false },
      $or: [{ senderId: userId }, { receiverId: userId }]
    };

    if (peerId) {
      filter.$and = [
        {
          $or: [
            { senderId: userId, receiverId: peerId },
            { senderId: peerId, receiverId: userId }
          ]
        }
      ];
    }

    return this.messageModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }
}

