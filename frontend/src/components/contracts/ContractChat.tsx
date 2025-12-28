'use client';

import React from 'react';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';
import keycloak from '@/lib/keycloak';
import { Send, User, Clock, Paperclip, X, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
    contractId?: string;
    attachments?: string[];
}

interface ContractChatProps {
    contractId: string;
    freelancerId: string;
    clientId: string;
}

export default function ContractChat({ contractId, freelancerId, clientId }: ContractChatProps) {
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [newMessage, setNewMessage] = React.useState('');
    const [attachments, setAttachments] = React.useState<string[]>([]);
    const [isUploading, setIsUploading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [socket, setSocket] = React.useState<Socket | null>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const currentUserId = keycloak?.subject;

    const receiverId = currentUserId === freelancerId ? clientId : freelancerId;

    React.useEffect(() => {
        // Fetch History
        const fetchHistory = async () => {
            try {
                const res = await api.get(`/chat/contract/${contractId}`);
                setMessages(res.data);
            } catch (error) {
                console.error('Failed to fetch chat history', error);
            }
        };
        fetchHistory();

        // Initialize Socket
        // Kong routes /api/chat to chat-service:3006
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';
        const newSocket = io(socketUrl, {
            path: '/api/chat/socket.io',
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            console.log('Connected to chat socket');
            newSocket.emit('joinContract', { contractId });
        });

        newSocket.on('newMessage', (message: Message) => {
            if (message.contractId === contractId) {
                setMessages((prev) => [...prev, message]);
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [contractId]);

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await api.post('/storage/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const fileName = uploadRes.data.fileName;
            setAttachments((prev) => [...prev, fileName]);
        } catch (error) {
            console.error('Failed to upload file', error);
            alert('Failed to upload file');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeAttachment = (fileName: string) => {
        setAttachments((prev) => prev.filter((f) => f !== fileName));
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && attachments.length === 0) || !socket || !currentUserId) return;

        const messageData = {
            senderId: currentUserId,
            receiverId,
            content: newMessage.trim(),
            contractId,
            attachments
        };

        socket.emit('sendMessage', messageData);
        setNewMessage('');
        setAttachments([]);
    };

    return (
        <div className="flex flex-col h-[600px] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-700"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                        <div className="p-3 rounded-full bg-slate-800">
                            <User className="w-6 h-6" />
                        </div>
                        <p className="text-sm">Start a conversation about this contract</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === currentUserId;
                        return (
                            <div
                                key={msg._id}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] space-y-1`}>
                                    <div className={`px-4 py-2 rounded-2xl text-sm ${isMe
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-slate-800 text-slate-200 rounded-tl-none'
                                        }`}>
                                        {msg.content}
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                {msg.attachments.map((file, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={`${process.env.NEXT_PUBLIC_API_URL || '/api'}/storage/url/${file}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className={`flex items-center gap-2 p-2 rounded-lg text-xs ${isMe ? 'bg-blue-500/20 hover:bg-blue-500/30' : 'bg-slate-700/50 hover:bg-slate-700'} transition-all`}
                                                    >
                                                        <FileText className="w-3 h-3" />
                                                        <span className="truncate max-w-[150px]">{file}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`text-[10px] text-slate-500 flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <Clock className="w-3 h-3" />
                                        {format(new Date(msg.createdAt), 'HH:mm')}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
                {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {attachments.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300">
                                <span className="truncate max-w-[100px]">{file}</span>
                                <button onClick={() => removeAttachment(file)} className="hover:text-white">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors disabled:opacity-50"
                    >
                        {isUploading ? (
                            <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Paperclip className="w-5 h-5" />
                        )}
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={(!newMessage.trim() && attachments.length === 0) || isUploading}
                        className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
