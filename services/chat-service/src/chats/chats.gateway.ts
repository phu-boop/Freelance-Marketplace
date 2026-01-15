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

    afterInit(server: Server) {
        console.log('ChatGateway Initialized');
    }

    handleConnection(client: Socket, ...args: any[]) {
        const userId = client.handshake.query.userId as string;
        if (userId) {
            if (!this.onlineUsers.has(userId)) {
                this.onlineUsers.set(userId, new Set());
                // Notify everyone that this user is online
                this.server.emit('userOnline', { userId });
            }
            this.onlineUsers.get(userId).add(client.id);
            console.log(`Client connected: ${client.id} (User: ${userId})`);
        } else {
            console.log(`Client connected: ${client.id} (No userId)`);
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.handshake.query.userId as string;
        if (userId && this.onlineUsers.has(userId)) {
            const userSockets = this.onlineUsers.get(userId);
            userSockets.delete(client.id);

            if (userSockets.size === 0) {
                this.onlineUsers.delete(userId);
                // Notify everyone that this user is offline
                this.server.emit('userOffline', { userId });
            }
        }
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('getOnlineUsers')
    handleGetOnlineUsers(client: Socket) {
        return Array.from(this.onlineUsers.keys());
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

    @SubscribeMessage('initiateCall')
    handleInitiateCall(
        @MessageBody() data: { senderId: string; receiverId: string; callerName: string; interviewId?: string },
        @ConnectedSocket() client: Socket,
    ) {
        const room = [data.senderId, data.receiverId].sort().join('_');
        const meetingUrl = `https://meet.jit.si/freelance-marketplace-${data.interviewId || room}`;

        this.server.to(room).emit('incomingCall', {
            senderId: data.senderId,
            callerName: data.callerName,
            meetingUrl,
            interviewId: data.interviewId,
        });

        console.log(`Call initiated from ${data.senderId} to ${data.receiverId}`);
    }

    @SubscribeMessage('acceptCall')
    handleAcceptCall(
        @MessageBody() data: { senderId: string; receiverId: string; meetingUrl: string },
    ) {
        const room = [data.senderId, data.receiverId].sort().join('_');
        this.server.to(room).emit('callAccepted', { meetingUrl: data.meetingUrl });
    }

    @SubscribeMessage('rejectCall')
    handleRejectCall(
        @MessageBody() data: { senderId: string; receiverId: string },
    ) {
        const room = [data.senderId, data.receiverId].sort().join('_');
        this.server.to(room).emit('callRejected');
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

    @SubscribeMessage('stopTyping')
    handleStopTyping(
        @MessageBody() data: { senderId: string; receiverId: string },
    ) {
        const room = [data.senderId, data.receiverId].sort().join('_');
        this.server.to(room).emit('stopTyping', { senderId: data.senderId });
    }
}
