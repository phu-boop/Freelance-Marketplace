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
    const { token, authenticated } = useKeycloak();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (authenticated && token) {
            const newSocket = io(process.env.NEXT_PUBLIC_NOTIFICATION_URL || 'http://localhost:3007', {
                auth: {
                    token: `Bearer ${token}`,
                },
            });

            newSocket.on('connect', () => {
                console.log('Connected to notification service');
                newSocket.emit('join', { userId: 'current-user-id' }); // In real app, get from token
            });

            newSocket.on('notification', (notification: Notification) => {
                setNotifications((prev) => [notification, ...prev]);
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        }
    }, [authenticated, token]);

    return { notifications, socket };
};
