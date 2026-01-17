import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(private readonly chatsService: ChatsService) { }

    // userId -> Set<socketId>
    private onlineUsers = new Map<string, Set<string>>();
    // Map of userId -> lastSeen timestamp (ISO string)
    private lastSeen = new Map<string, string>();
    // Map of userId -> status ('online' | 'dnd' | 'offline')
    private userStatuses = new Map<string, string>();

    afterInit(server: Server) {
        console.log('ChatGateway Initialized');
    }

    handleConnection(client: Socket, ...args: any[]) {
        const userId = client.handshake.query.userId as string;
        if (userId) {
            if (!this.onlineUsers.has(userId)) {
                this.onlineUsers.set(userId, new Set());
                // Notify everyone that this user is online (default) or their saved status
                const status = this.userStatuses.get(userId) || 'online';
                this.server.emit('userOnline', { userId, status });
                this.server.emit('user_status_change', { userId, status });
            }
            this.onlineUsers.get(userId)!.add(client.id);
            console.log(`Client connected: ${client.id} (User: ${userId})`);
        } else {
            console.log(`Client connected: ${client.id} (No userId)`);
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.handshake.query.userId as string;
        if (userId && this.onlineUsers.has(userId)) {
            const userSockets = this.onlineUsers.get(userId);
            if (userSockets) {
                userSockets.delete(client.id);

                if (userSockets.size === 0) {
                    this.onlineUsers.delete(userId);
                    // Record last seen timestamp
                    const timestamp = new Date().toISOString();
                    this.lastSeen.set(userId, timestamp);
                    // Notify everyone that this user is offline and include lastSeen
                    this.server.emit('userOffline', { userId, lastSeen: timestamp });
                    // Emit a generic status change event
                    this.server.emit('user_status_change', { userId, status: 'offline', lastSeen: timestamp });
                    this.userStatuses.set(userId, 'offline');
                }
            }
            console.log(`Client disconnected: ${client.id}`);
        }
    }

    @SubscribeMessage('getOnlineUsers')
    handleGetOnlineUsers(client: Socket) {
        return Array.from(this.onlineUsers.keys());
    }

    // Provide lastSeen timestamp for a specific user
    @SubscribeMessage('getLastSeen')
    handleGetLastSeen(@MessageBody() data: { userId: string }) {
        return this.lastSeen.get(data.userId) || null;
    }

    @SubscribeMessage('getUserStatus')
    handleGetUserStatus(@MessageBody() data: { userId: string }) {
        // If user is in onlineUsers but status not set, default to online
        if (this.onlineUsers.has(data.userId)) {
            return this.userStatuses.get(data.userId) || 'online';
        }
        return 'offline';
    }

    @SubscribeMessage('setStatus')
    handleSetStatus(@MessageBody() data: { userId: string, status: string }) {
        if (this.onlineUsers.has(data.userId)) {
            this.userStatuses.set(data.userId, data.status);
            this.server.emit('user_status_change', { userId: data.userId, status: data.status });
        }
    }
    @SubscribeMessage('joinRoom')
    handleJoinRoom(
        @MessageBody() data: { senderId: string; receiverId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const room = [data.senderId, data.receiverId].sort().join('_');
        client.join(room);
        console.log(`Client ${client.id} joined room ${room}`);
    }

    @SubscribeMessage('joinContract')
    handleJoinContract(
        @MessageBody() data: { contractId: string },
        @ConnectedSocket() client: Socket,
    ) {
        client.join(data.contractId);
        console.log(`Client ${client.id} joined contract room ${data.contractId}`);
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() data: {
            senderId: string;
            receiverId: string;
            content: string;
            contractId?: string;
            attachments?: string[];
        },
        @ConnectedSocket() client: Socket,
    ) {
        const message = await this.chatsService.create(data);

        if (data.contractId) {
            // Emit to the contract room
            this.server.to(data.contractId).emit('newMessage', message);
        } else {
            // Emit to the private user-to-user room
            const room = [data.senderId, data.receiverId].sort().join('_');
            this.server.to(room).emit('newMessage', message);
        }

        return message;
    }

    @SubscribeMessage('call_user')
    handleCallUser(
        @MessageBody() data: { senderId: string; receiverId: string; offer: any; isVideo: boolean },
        @ConnectedSocket() client: Socket,
    ) {
        // Emit to the specific user not the whole room to avoid self-echo complexity or wrong recipient
        // But for now, room logic is existing pattern.
        // Better: Find socket of receiver from onlineUsers map.
        const receiverSockets = this.onlineUsers.get(data.receiverId);
        if (receiverSockets) {
            receiverSockets.forEach(socketId => {
                this.server.to(socketId).emit('incoming_call', {
                    senderId: data.senderId,
                    offer: data.offer,
                    isVideo: data.isVideo
                });
            });
        }
    }

    @SubscribeMessage('answer_call')
    handleAnswerCall(
        @MessageBody() data: { senderId: string; receiverId: string; answer: any },
    ) {
        const receiverSockets = this.onlineUsers.get(data.receiverId); // receiverId here is the original caller
        if (receiverSockets) {
            receiverSockets.forEach(socketId => {
                this.server.to(socketId).emit('call_answered', {
                    senderId: data.senderId, // who answered
                    answer: data.answer
                });
            });
        }
    }

    @SubscribeMessage('ice_candidate')
    handleIceCandidate(
        @MessageBody() data: { senderId: string; receiverId: string; candidate: any },
    ) {
        const receiverSockets = this.onlineUsers.get(data.receiverId);
        if (receiverSockets) {
            receiverSockets.forEach(socketId => {
                this.server.to(socketId).emit('ice_candidate', {
                    senderId: data.senderId,
                    candidate: data.candidate
                });
            });
        }
    }

    @SubscribeMessage('end_call')
    handleEndCall(
        @MessageBody() data: { senderId: string; receiverId: string },
    ) {
        const receiverSockets = this.onlineUsers.get(data.receiverId);
        if (receiverSockets) {
            receiverSockets.forEach(socketId => {
                this.server.to(socketId).emit('call_ended', {
                    senderId: data.senderId
                });
            });
        }
    }

    @SubscribeMessage('typing')
    handleTyping(
        @MessageBody() data: { senderId: string; receiverId: string },
    ) {
        const room = [data.senderId, data.receiverId].sort().join('_');
        // Broadcasts to everyone in the room (including sender, but frontend handles that)
        // Ideally should check client.to(room) to exclude sender, but server.to works if frontend ignores own ID.
        this.server.to(room).emit('typing', { senderId: data.senderId });
    }

    @SubscribeMessage('messageUpdate')
    handleMessageUpdate(
        @MessageBody() data: { id: string; senderId: string; receiverId: string; content: string },
    ) {
        const room = [data.senderId, data.receiverId].sort().join('_');
        this.server.to(room).emit('messageUpdated', { id: data.id, content: data.content });
    }

    @SubscribeMessage('messageDelete')
    handleMessageDelete(
        @MessageBody() data: { id: string; senderId: string; receiverId: string },
    ) {
        const room = [data.senderId, data.receiverId].sort().join('_');
        this.server.to(room).emit('messageDeleted', { id: data.id });
    }

    @SubscribeMessage('messageRead')
    handleMessageRead(
        @MessageBody() data: { id: string; senderId: string; receiverId: string },
    ) {
        const room = [data.senderId, data.receiverId].sort().join('_');
        this.server.to(room).emit('readReceipt', { id: data.id });
    }

    @SubscribeMessage('stopTyping')
    handleStopTyping(
        @MessageBody() data: { senderId: string; receiverId: string },
    ) {
        const room = [data.senderId, data.receiverId].sort().join('_');
        this.server.to(room).emit('stopTyping', { senderId: data.senderId });
    }
}
