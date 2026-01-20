'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useKeycloak } from '@/components/KeycloakProvider';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export const useNotifications = () => {
    const { token, authenticated, userId } = useKeycloak();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (authenticated && token && userId) {
            console.log('[SOCKET] Env URL:', process.env.NEXT_PUBLIC_NOTIFICATION_URL);
            console.log('[SOCKET] Initializing connection to:', process.env.NEXT_PUBLIC_NOTIFICATION_URL || 'http://localhost:3007');
            const newSocket = io(process.env.NEXT_PUBLIC_NOTIFICATION_URL || 'http://localhost:3007', {
                transports: ['websocket'],
                auth: {
                    token: `Bearer ${token}`,
                },
            });

            newSocket.on('connect', () => {
                console.log('Connected to notification service');
                newSocket.emit('joinNotifications', { userId });
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            newSocket.on('newNotification', (notification: Notification) => {
                console.log('Received notification:', notification);
                setNotifications((prev) => [notification, ...prev]);
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        }
    }, [authenticated, token, userId]);

    return { notifications, socket };
};
