'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Search, MoreVertical, Phone, Video, Paperclip, Smile, Loader2, Edit, Trash2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';

interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
    isRead: boolean;
    attachments?: string[];
    isEdited?: boolean;
    deletedAt?: string;
}

interface Conversation {
    otherId: string;
    lastMessage: string;
    timestamp: string;
    isRead: boolean;
    unreadCount?: number;
    user?: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

import { useSearchParams } from 'next/navigation';

export default function MessagesPage() {
    const { userId } = useKeycloak();
    const searchParams = useSearchParams();
    const participantId = searchParams.get('participantId');
    const [socket, setSocket] = useState<Socket | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [chatLoading, setChatLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [tempAttachments, setTempAttachments] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

    // Initialize Socket
    useEffect(() => {
        if (!userId) return;

        const newSocket = io('http://localhost:3006', {
            query: { userId }
        }); // Chat Service URL
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to Chat Service');
            newSocket.emit('getOnlineUsers', {}, (users: string[]) => {
                setOnlineUsers(new Set(users));
            });
        });

        // Fallback if callback not supported or event based
        newSocket.on('getOnlineUsers', (users: string[]) => { // If server emits event instead of ack
            setOnlineUsers(new Set(users));
        });

        newSocket.on('userOnline', (data: { userId: string }) => {
            setOnlineUsers(prev => new Set(prev).add(data.userId));
        });

        newSocket.on('userOffline', (data: { userId: string }) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(data.userId);
                return newSet;
            });
        });

        newSocket.on('newMessage', (message: Message) => {
            if (selectedChat && (message.senderId === selectedChat.otherId || message.receiverId === selectedChat.otherId)) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
                setIsTyping(false);
            }
            // Refresh conversations to update last message
            fetchConversations();
        });

        newSocket.on('typing', (data: { senderId: string }) => {
            if (selectedChat && data.senderId === selectedChat.otherId) {
                setIsTyping(true);
                scrollToBottom();
            }
        });

        newSocket.on('stopTyping', (data: { senderId: string }) => {
            if (selectedChat && data.senderId === selectedChat.otherId) {
                setIsTyping(false);
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [userId, selectedChat]);

    // Fetch Conversations and Handle ParticipantId
    const fetchConversations = async () => {
        if (!userId) return;
        try {
            const res = await api.get(`/chat/conversations/${userId}`);
            const convs = res.data;

            const enrichedConvs = await Promise.all(convs.map(async (c: any) => {
                try {
                    const userRes = await api.get(`/users/${c.otherId}`);
                    return { ...c, user: userRes.data };
                } catch (e) {
                    return { ...c, user: { firstName: 'Unknown', lastName: 'User', email: '' } };
                }
            }));

            setConversations(enrichedConvs);

            // Handle Deep Link to Chat
            if (participantId && enrichedConvs) {
                const existingConv = enrichedConvs.find(c => c.otherId === participantId);
                if (existingConv) {
                    setSelectedChat(existingConv);
                } else {
                    // Fetch user details for new chat
                    try {
                        const userRes = await api.get(`/users/${participantId}`);
                        const newConv: Conversation = {
                            otherId: participantId,
                            lastMessage: '',
                            timestamp: new Date().toISOString(),
                            isRead: true,
                            user: userRes.data
                        };
                        setConversations(prev => [newConv, ...prev]);
                        setSelectedChat(newConv);
                    } catch (e) {
                        console.error('Failed to fetch participant for new chat', e);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, [userId, participantId]);

    const [hasMore, setHasMore] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Fetch Chat History
    useEffect(() => {
        if (!selectedChat || !userId) return;

        const fetchHistory = async () => {
            setChatLoading(true);
            try {
                // Determine if we are fetching initial history or more history
                // Doing simple fetch for now for fresh select
                const res = await api.get(`/chat/history?user1=${userId}&user2=${selectedChat.otherId}`);
                setMessages(res.data);
                setHasMore(res.data.length === 50); // Assumption based on limit
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

    const loadMoreMessages = async () => {
        if (!messages.length || !selectedChat || !userId) return;

        const oldestMessageTime = messages[0].createdAt;
        try {
            const res = await api.get(`/chat/history?user1=${userId}&user2=${selectedChat.otherId}&before=${oldestMessageTime}`);
            const newMessages = res.data;

            if (newMessages.length < 50) {
                setHasMore(false);
            }

            if (newMessages.length > 0) {
                // Maintain scroll position
                const scrollContainer = scrollContainerRef.current; // Use container ref, not dummy
                const oldHeight = scrollContainer?.scrollHeight || 0;

                setMessages(prev => [...newMessages, ...prev]);

                setTimeout(() => {
                    if (scrollContainer) {
                        const newHeight = scrollContainer.scrollHeight;
                        scrollContainer.scrollTop = newHeight - oldHeight;
                    }
                }, 0);
            }
        } catch (error) {
            console.error('Failed to load more messages', error);
        }
    };

    const handleScroll = () => {
        if (scrollContainerRef.current && scrollContainerRef.current.scrollTop === 0 && hasMore) {
            loadMoreMessages();
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        if (!socket || !selectedChat || !userId) return;

        socket.emit('typing', { senderId: userId, receiverId: selectedChat.otherId });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stopTyping', { senderId: userId, receiverId: selectedChat.otherId });
        }, 1000);
    };

    // ---------- Message edit & delete handlers ----------
    const handleEditMessage = async (msgId: string, currentContent: string) => {
        const newContent = prompt('Edit your message:', currentContent);
        if (newContent === null || newContent.trim() === '' || !socket) return;
        try {
            await api.patch(`/chat/${msgId}`, { content: newContent });
            // Optimistically update UI
            setMessages(prev => prev.map(m => (m._id === msgId ? { ...m, content: newContent, isEdited: true } : m)));
        } catch (err) {
            console.error('Failed to edit message', err);
        }
    };

    const handleDeleteMessage = async (msgId: string) => {
        if (!socket) return;
        try {
            await api.delete(`/chat/${msgId}`);
            // Optimistically mark as deleted
            setMessages(prev => prev.map(m => (m._id === msgId ? { ...m, deletedAt: new Date().toISOString() } : m)));
        } catch (err) {
            console.error('Failed to delete message', err);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files.length) return;
        const file = e.target.files[0];

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Upload to storage service
            const uploadRes = await api.post('/storage/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const fileName = uploadRes.data.fileName;

            // Get accessible URL
            const urlRes = await api.get(`/storage/url/${fileName}`);
            const fileUrl = urlRes.data.url;

            setTempAttachments(prev => [...prev, fileUrl]);
        } catch (error) {
            console.error('Failed to upload file', error);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemoveAttachment = (index: number) => {
        setTempAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setNewMessage(prev => prev + emojiData.emoji);
        // setShowEmojiPicker(false); // Optional: keep open for multiple emojis
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        // Allow sending if there is text OR attachments
        if ((!newMessage.trim() && !tempAttachments.length) || !selectedChat || !userId || !socket) return;

        socket.emit('stopTyping', { senderId: userId, receiverId: selectedChat.otherId });

        const messageData = {
            senderId: userId,
            receiverId: selectedChat.otherId,
            content: newMessage,
            attachments: tempAttachments
        };

        socket.emit('sendMessage', messageData);
        setNewMessage('');
        setTempAttachments([]);
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
                                <div className="flex justify-between items-center">
                                    <p className={`text-sm truncate pr-2 ${conv.isRead ? 'text-slate-500' : 'text-white font-medium'}`}>
                                        {conv.lastMessage}
                                    </p>
                                    {conv.unreadCount !== undefined && conv.unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
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
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold relative">
                                    {selectedChat.user?.firstName?.[0]}
                                    {onlineUsers.has(selectedChat.otherId) && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{selectedChat.user?.firstName} {selectedChat.user?.lastName}</h3>
                                    <p className={`text-xs flex items-center gap-1 ${onlineUsers.has(selectedChat.otherId) ? 'text-green-500' : 'text-slate-500'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${onlineUsers.has(selectedChat.otherId) ? 'bg-green-500' : 'bg-slate-500'}`} />
                                        {onlineUsers.has(selectedChat.otherId) ? 'Online' : 'Offline'}
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
                        <div
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-6 space-y-4"
                        >
                            {!chatLoading && !messages.length && <div className="text-center text-slate-500 mt-10">No messages yet</div>}

                            {/* Loading more indicator, could be improved with state */}

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
                                                {msg.attachments && msg.attachments.length > 0 && (
                                                    <div className="space-y-2 mb-2">
                                                        {msg.attachments.map((url, i) => (
                                                            <div key={i}>
                                                                {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                                    <img src={url} alt="attachment" className="max-w-full rounded-lg max-h-48 object-cover" />
                                                                ) : (
                                                                    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors">
                                                                        <Paperclip className="w-4 h-4" />
                                                                        <span className="text-xs underline truncate max-w-[150px]">Attachment {i + 1}</span>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {msg.deletedAt ? (
                                                    <p className="text-sm italic text-slate-400">Message deleted</p>
                                                ) : (
                                                    <>
                                                        <p className="text-sm break-words whitespace-pre-wrap">
                                                            {msg.content}
                                                            {msg.isEdited && <span className="text-xs text-slate-500 ml-1">(Edited)</span>}
                                                        </p>
                                                        {isMe && (
                                                            <div className="flex gap-2 mt-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleEditMessage(msg._id, msg.content)}
                                                                    className="p-1 text-slate-400 hover:text-white"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteMessage(msg._id)}
                                                                    className="p-1 text-slate-400 hover:text-red-500"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-500'}`}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </>
                                                )}

                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800/50 text-slate-400 rounded-2xl rounded-bl-none px-4 py-2 text-xs flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                        <span className="ml-1">Typing...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input */}
                        {/* Input */}
                        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                            {/* Attachment Staging */}
                            {tempAttachments.length > 0 && (
                                <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                                    {tempAttachments.map((url, i) => (
                                        <div key={i} className="relative group shrink-0">
                                            {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                <img src={url} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-slate-700" />
                                            ) : (
                                                <div className="w-16 h-16 flex items-center justify-center bg-slate-800 rounded-lg border border-slate-700">
                                                    <Paperclip className="w-6 h-6 text-slate-400" />
                                                </div>
                                            )}
                                            <button
                                                onClick={() => handleRemoveAttachment(i)}
                                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {showEmojiPicker && (
                                <div className="absolute bottom-20 right-8 z-50">
                                    <EmojiPicker
                                        theme={Theme.DARK}
                                        onEmojiClick={onEmojiClick}
                                        searchDisabled
                                        width={300}
                                        height={400}
                                    />
                                </div>
                            )}

                            <form onSubmit={handleSendMessage} className="flex items-center gap-3 relative">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-slate-400 hover:text-white transition-all"
                                >
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={handleInputChange}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`p-2 transition-all ${showEmojiPicker ? 'text-yellow-400' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <Smile className="w-5 h-5" />
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() && !tempAttachments.length}
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
        </div >
    );
}
