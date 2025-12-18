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

    afterInit(server: Server) {
        console.log('ChatGateway Initialized');
    }

    handleConnection(client: Socket, ...args: any[]) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() data: { senderId: string; receiverId: string; content: string; contractId?: string },
        @ConnectedSocket() client: Socket,
    ) {
        const message = await this.chatsService.create(data);

        // Emit to the specific receiver if they are online (simple implementation)
        // In a real app, you'd map userId to socketId
        this.server.emit('newMessage', message);

        return message;
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(
        @MessageBody() data: { userId: string },
        @ConnectedSocket() client: Socket,
    ) {
        client.join(data.userId);
        console.log(`User ${data.userId} joined room`);
    }
}
