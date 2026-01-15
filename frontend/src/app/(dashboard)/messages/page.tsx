'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Search, MoreVertical, Phone, Video, Paperclip, Smile, Loader2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';

interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
    isRead: boolean;
}

interface Conversation {
    otherId: string;
    lastMessage: string;
    timestamp: string;
    isRead: boolean;
    user?: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

export default function MessagesPage() {
    const { userId } = useKeycloak();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [chatLoading, setChatLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initialize Socket
    useEffect(() => {
        if (!userId) return;

        const newSocket = io('http://localhost:3006'); // Chat Service URL
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to Chat Service');
        });

        newSocket.on('newMessage', (message: Message) => {
            if (selectedChat && (message.senderId === selectedChat.otherId || message.receiverId === selectedChat.otherId)) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            }
            // Refresh conversations to update last message
            fetchConversations();
        });

        return () => {
            newSocket.disconnect();
        };
    }, [userId, selectedChat]);

    // Fetch Conversations
    const fetchConversations = async () => {
        if (!userId) return;
        try {
            const res = await api.get(`/chat/conversations/${userId}`);
            const convs = res.data;

            // Enrich with user details (mock or fetch from user-service)
            // For MVP, we'll just fetch user details for each conversation
            const enrichedConvs = await Promise.all(convs.map(async (c: any) => {
                try {
                    const userRes = await api.get(`/users/${c.otherId}`);
                    return { ...c, user: userRes.data };
                } catch (e) {
                    return { ...c, user: { firstName: 'Unknown', lastName: 'User', email: '' } };
                }
            }));

            setConversations(enrichedConvs);
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, [userId]);

    // Fetch Chat History
    useEffect(() => {
        if (!selectedChat || !userId) return;

        const fetchHistory = async () => {
            setChatLoading(true);
            try {
                const res = await api.get(`/chat/history?user1=${userId}&user2=${selectedChat.otherId}`);
                setMessages(res.data);
                scrollToBottom();

                // Join socket room
                socket?.emit('joinRoom', { senderId: userId, receiverId: selectedChat.otherId });
            } catch (error) {
                console.error('Failed to fetch history', error);
            } finally {
                setChatLoading(false);
            }
        };

        fetchHistory();
    }, [selectedChat, userId, socket]);

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat || !userId || !socket) return;

        const messageData = {
            senderId: userId,
            receiverId: selectedChat.otherId,
            content: newMessage,
        };

        // Optimistic update
        // setMessages(prev => [...prev, { ...messageData, _id: 'temp', createdAt: new Date().toISOString(), isRead: false }]);

        socket.emit('sendMessage', messageData);
        setNewMessage('');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-120px)] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex">
            {/* Sidebar - Conversations */}
            <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-950/50">
                <div className="p-4 border-b border-slate-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map((conv) => (
                        <button
                            key={conv.otherId}
                            onClick={() => setSelectedChat(conv)}
                            className={`w-full p-4 flex items-start gap-3 hover:bg-slate-900 transition-all text-left border-b border-slate-800/50 ${selectedChat?.otherId === conv.otherId ? 'bg-slate-900 border-l-2 border-l-blue-500' : ''
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                                {conv.user?.firstName?.[0] || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold text-white truncate">{conv.user?.firstName} {conv.user?.lastName}</h4>
                                    <span className="text-xs text-slate-500">{new Date(conv.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className={`text-sm truncate ${conv.isRead ? 'text-slate-500' : 'text-white font-medium'}`}>
                                    {conv.lastMessage}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-900">
                {selectedChat ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                    {selectedChat.user?.firstName?.[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{selectedChat.user?.firstName} {selectedChat.user?.lastName}</h3>
                                    <p className="text-xs text-green-500 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        Online
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                                    <Video className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {chatLoading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.senderId === userId;
                                    return (
                                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${isMe
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-slate-800 text-slate-200 rounded-bl-none'
                                                }`}>
                                                <p className="text-sm">{msg.content}</p>
                                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-500'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                <button type="button" className="p-2 text-slate-400 hover:text-white transition-all">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                                <button type="button" className="p-2 text-slate-400 hover:text-white transition-all">
                                    <Smile className="w-5 h-5" />
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-all"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                            <Send className="w-10 h-10 opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Your Messages</h3>
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
