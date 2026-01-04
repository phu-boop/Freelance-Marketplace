import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WorkspaceService } from './workspace.service';
import { Logger, UseGuards } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    },
    namespace: '/workspace',
})
export class WorkspaceGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new Logger('WorkspaceGateway');
    private activeUsers = new Map<string, Set<string>>(); // contractId -> Set of socketIds

    constructor(private workspaceService: WorkspaceService) { }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);

        // Remove from all rooms
        this.activeUsers.forEach((users, contractId) => {
            if (users.has(client.id)) {
                users.delete(client.id);
                this.broadcastPresence(contractId);
            }
        });
    }

    @SubscribeMessage('join-workspace')
    async handleJoinWorkspace(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { contractId: string; userId: string; userName: string },
    ) {
        const { contractId, userId, userName } = data;

        // Join the room
        client.join(contractId);

        // Track active users
        if (!this.activeUsers.has(contractId)) {
            this.activeUsers.set(contractId, new Set());
        }
        this.activeUsers.get(contractId).add(client.id);

        // Store user info on socket
        client.data.userId = userId;
        client.data.userName = userName;
        client.data.contractId = contractId;

        // Load and send current workspace state
        const workspace = await this.workspaceService.getWorkspace(contractId);
        client.emit('workspace-state', workspace);

        // Broadcast presence update
        this.broadcastPresence(contractId);

        this.logger.log(`User ${userName} joined workspace ${contractId}`);
    }

    @SubscribeMessage('leave-workspace')
    handleLeaveWorkspace(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { contractId: string },
    ) {
        const { contractId } = data;
        client.leave(contractId);

        if (this.activeUsers.has(contractId)) {
            this.activeUsers.get(contractId).delete(client.id);
            this.broadcastPresence(contractId);
        }

        this.logger.log(`Client ${client.id} left workspace ${contractId}`);
    }

    @SubscribeMessage('document-change')
    async handleDocumentChange(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { contractId: string; content: any; version: number },
    ) {
        const { contractId, content, version } = data;

        try {
            // Update workspace in database
            const updated = await this.workspaceService.updateWorkspace(contractId, content, version);

            // Broadcast to all clients in the room except sender
            client.to(contractId).emit('document-update', {
                content: updated.content,
                version: updated.version,
                userId: client.data.userId,
            });

            // Acknowledge to sender
            client.emit('document-saved', { version: updated.version });
        } catch (error) {
            this.logger.error(`Error updating workspace: ${error.message}`);
            client.emit('document-error', { message: error.message });
        }
    }

    @SubscribeMessage('cursor-update')
    handleCursorUpdate(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { contractId: string; cursor: any },
    ) {
        const { contractId, cursor } = data;

        // Broadcast cursor position to all other clients in the room
        client.to(contractId).emit('cursor-move', {
            userId: client.data.userId,
            userName: client.data.userName,
            cursor,
        });
    }

    private broadcastPresence(contractId: string) {
        const users = this.activeUsers.get(contractId);
        if (!users) return;

        const activeUserList = Array.from(users).map((socketId) => {
            const socket = this.server.sockets.sockets.get(socketId);
            return {
                userId: socket?.data.userId,
                userName: socket?.data.userName,
            };
        });

        this.server.to(contractId).emit('presence-update', { users: activeUserList });
    }
}
