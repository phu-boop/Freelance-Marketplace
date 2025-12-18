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
import { NotificationsService } from './notifications.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class NotificationGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(private readonly notificationsService: NotificationsService) { }

    afterInit(server: Server) {
        console.log('NotificationGateway Initialized');
    }

    handleConnection(client: Socket, ...args: any[]) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinNotifications')
    handleJoinNotifications(
        @MessageBody() data: { userId: string },
        @ConnectedSocket() client: Socket,
    ) {
        client.join(`notifications_${data.userId}`);
        console.log(`User ${data.userId} joined notifications room`);
    }

    // Method to send notification to a specific user
    sendNotification(userId: string, notification: any) {
        this.server.to(`notifications_${userId}`).emit('newNotification', notification);
    }
}
