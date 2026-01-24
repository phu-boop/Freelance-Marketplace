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
import { RedisService } from './redis.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class NotificationGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    // Track userId for each socket to handle disconnection
    private socketToUser = new Map<string, string>();

    constructor(private readonly redisService: RedisService) { }

    afterInit(server: Server) {
        console.log('NotificationGateway Initialized');
    }

    handleConnection(client: Socket, ...args: any[]) {
        console.log(`Client connected: ${client.id}`);
    }

    async handleDisconnect(client: Socket) {
        const userId = this.socketToUser.get(client.id);
        if (userId) {
            await this.redisService.setUserOffline(userId);
            this.socketToUser.delete(client.id);
            console.log(`User ${userId} (socket ${client.id}) disconnected and set offline`);

            // Broadcast status change if needed
            this.server.emit('userStatusChange', { userId, status: 'offline' });
        }
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinNotifications')
    async handleJoinNotifications(
        @MessageBody() data: { userId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { userId } = data;
        client.join(`notifications_${userId}`);
        this.socketToUser.set(client.id, userId);

        // Mark as online in Redis
        await this.redisService.setUserOnline(userId);

        console.log(`User ${userId} joined notifications room and set online`);

        // Broadcast status change
        this.server.emit('userStatusChange', { userId, status: 'online' });
    }

    // Method to send notification to a specific user
    sendNotification(userId: string, notification: any) {
        this.server.to(`notifications_${userId}`).emit('newNotification', notification);
    }
}
