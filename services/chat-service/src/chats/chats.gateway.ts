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
}
