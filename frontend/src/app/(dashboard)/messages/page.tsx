'use client';

import React, { useState, useEffect } from 'react';
import { ChatWindow } from '@/components/ChatWindow';
import { Search, User } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useKeycloak } from '@/components/KeycloakProvider';

// Mock data for conversations
const mockConversations = [
    { id: '1', name: 'Alice Smith', lastMessage: 'Sounds good! When can you start?', time: '10:30 AM', unread: 2, status: 'Online' },
    { id: '2', name: 'Bob Jones', lastMessage: 'I sent over the contract.', time: 'Yesterday', unread: 0, status: 'Offline' },
    { id: '3', name: 'TechFlow HR', lastMessage: 'Thanks for applying.', time: '2 days ago', unread: 0, status: 'Online' },
];

// Mock messages for a conversation
const mockMessages = [
    { id: 'm1', senderId: 'other', content: 'Hi there! I saw your proposal.', timestamp: new Date(Date.now() - 3600000).toISOString(), isMe: false },
    { id: 'm2', senderId: 'me', content: 'Hi! Thanks for reaching out. I am very interested in this project.', timestamp: new Date(Date.now() - 3500000).toISOString(), isMe: true },
    { id: 'm3', senderId: 'other', content: 'Great. Do you have experience with Next.js 14?', timestamp: new Date(Date.now() - 3400000).toISOString(), isMe: false },
    { id: 'm4', senderId: 'me', content: 'Yes, I have been using it since the beta. I love the App Router.', timestamp: new Date(Date.now() - 3300000).toISOString(), isMe: true },
    { id: 'm5', senderId: 'other', content: 'Sounds good! When can you start?', timestamp: new Date(Date.now() - 300000).toISOString(), isMe: false },
];

export default function MessagesPage() {
    const { token } = useKeycloak();
    const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
    const [messages, setMessages] = useState(mockMessages);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (token) {
            // Connect to Chat Service
            const newSocket = io(process.env.NEXT_PUBLIC_CHAT_URL || 'http://localhost:3006', {
                auth: { token: `Bearer ${token}` }
            });

            newSocket.on('connect', () => {
                console.log('Connected to chat service');
            });

            newSocket.on('message', (msg) => {
                setMessages((prev) => [...prev, { ...msg, isMe: false }]);
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        }
    }, [token]);

    const handleSendMessage = (content: string) => {
        const newMessage = {
            id: Date.now().toString(),
            senderId: 'me',
            content,
            timestamp: new Date().toISOString(),
            isMe: true
        };

        // Optimistic update
        setMessages((prev) => [...prev, newMessage]);

        // Emit to socket
        if (socket) {
            socket.emit('sendMessage', {
                conversationId: selectedConversation.id,
                content
            });
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6">
            {/* Conversations List */}
            <div className="w-80 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {mockConversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => setSelectedConversation(conv)}
                            className={`p-4 border-b border-slate-800 cursor-pointer transition-all hover:bg-slate-800/50 ${selectedConversation.id === conv.id ? 'bg-blue-600/10 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={`font-semibold ${selectedConversation.id === conv.id ? 'text-blue-400' : 'text-white'}`}>
                                    {conv.name}
                                </h3>
                                <span className="text-xs text-slate-500">{conv.time}</span>
                            </div>
                            <p className="text-sm text-slate-400 line-clamp-1">{conv.lastMessage}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1">
                <ChatWindow
                    recipientName={selectedConversation.name}
                    recipientStatus={selectedConversation.status}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                />
            </div>
        </div>
    );
}
