'use client';

import React, { useState, useEffect } from 'react';
import {
    Bell,
    Info,
    CheckCircle2,
    Clock,
    Trash2,
    ExternalLink,
    CheckCheck,
    Loader2,
    Calendar,
    Briefcase,
    DollarSign,
    MessageSquare,
    AlertCircle,
    User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';
import { io, Socket } from 'socket.io-client';

interface Notification {
    _id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    metadata?: any;
    createdAt: string;
}

export default function NotificationsPage() {
    const { userId } = useKeycloak();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!userId) return;

        const fetchNotifications = async () => {
            try {
                const response = await api.get('/notifications');
                setNotifications(response.data);
            } catch (error) {
                console.error('Failed to fetch notifications', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();

        // Setup Socket
        const socketUrl = process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || 'http://localhost:3007';
        const newSocket = io(socketUrl);

        newSocket.on('connect', () => {
            newSocket.emit('joinNotifications', { userId });
        });

        newSocket.on('newNotification', (notification: Notification) => {
            setNotifications(prev => [notification, ...prev]);
            // Play sound?
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [userId]);

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            console.error('Failed to delete notification', error);
        }
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
        if (unreadIds.length === 0) return;

        try {
            await Promise.all(unreadIds.map(id => api.patch(`/notifications/${id}/read`)));
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'INVITATION':
            case 'INVITATION_RESPONSE':
                return <Briefcase className="w-5 h-5 text-blue-500" />;
            case 'CONTRACT_OFFER':
            case 'CONTRACT_ACTIVE':
                return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'PAYMENT_RECEIVED':
            case 'MILESTONE_FUNDED':
                return <DollarSign className="w-5 h-5 text-green-500" />;
            case 'NEW_MESSAGE':
                return <MessageSquare className="w-5 h-5 text-indigo-500" />;
            case 'DISPUTE_OPENED':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Bell className="w-5 h-5 text-slate-400" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Bell className="w-8 h-8 text-blue-500" />
                        Notifications
                        {unreadCount > 0 && (
                            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                                {unreadCount} new
                            </span>
                        )}
                    </h1>
                    <p className="text-slate-400 mt-2">Manage and view your platform notifications.</p>
                </div>
                {notifications.length > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-sm"
                    >
                        <CheckCheck className="w-4 h-4" />
                        Mark all as read
                    </button>
                )}
            </div>

            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-slate-500">Fetching your updates...</p>
                </div>
            ) : notifications.length === 0 ? (
                <Card className="p-12 border-dashed border-slate-800 bg-slate-900/20">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center">
                            <Bell className="w-8 h-8 text-slate-600" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-white">No notifications yet</h3>
                            <p className="text-slate-500 max-w-xs mx-auto">
                                We'll notify you here when you have new messages, job updates, or platform news.
                            </p>
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {notifications.map((notification) => (
                            <motion.div
                                key={notification._id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={`group p-4 rounded-2xl border transition-all ${notification.isRead
                                        ? 'bg-slate-950 border-slate-900'
                                        : 'bg-slate-900/50 border-slate-800 border-l-4 border-l-blue-500 shadow-lg shadow-blue-500/5'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 p-2 rounded-xl ${notification.isRead ? 'bg-slate-900' : 'bg-blue-500/10'
                                        }`}>
                                        {getTypeIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className={`font-bold truncate ${notification.isRead ? 'text-slate-300' : 'text-white'
                                                }`}>
                                                {notification.title}
                                            </h4>
                                            <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
                                                <Clock className="w-3 h-3" />
                                                {new Date(notification.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-4 mt-3">
                                            {notification.link && (
                                                <a
                                                    href={notification.link}
                                                    className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                                >
                                                    View Details <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notification._id)}
                                                    className="text-xs text-slate-500 hover:text-white transition-colors"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification._id)}
                                                className="text-xs text-slate-500 hover:text-red-400 transition-colors md:opacity-0 group-hover:opacity-100"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <div className="flex gap-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                <Info className="w-5 h-5 text-blue-400 shrink-0" />
                <p className="text-sm text-blue-400/80">
                    You can manage your notification channels (Email, Slack, Discord) in
                    <a href="/settings/notifications" className="ml-1 text-blue-400 font-bold hover:underline">Settings</a>.
                </p>
            </div>
        </div>
    );
}
