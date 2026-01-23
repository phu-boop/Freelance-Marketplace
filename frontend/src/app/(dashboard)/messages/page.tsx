'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ContractContextSidebar } from '@/components/chat/ContractContextSidebar';
import { motion } from 'framer-motion';
import {
    Search,
    Send,
    MoreVertical,
    Phone,
    Video,
    Paperclip,
    Smile,
    X,
    MessageSquare,
    Loader2,
    FileText,
    Image as ImageIcon,
    Download,
    Edit,
    Trash2,
    ArrowLeft,
    Archive,
    Check,
    CheckCheck,
    Reply,
    CornerUpLeft,
    Flag,
    AlertTriangle,
    Pin
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';
import CallModal from '@/components/chat/CallModal';
import { PhoneOff } from 'lucide-react'; // Make sure icons are imported
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
    replyTo?: Message;
    isFlagged?: boolean;
    flagReason?: string;
    isPinned?: boolean;
    pinnedAt?: string;
    reactions?: { emoji: string; userIds: string[] }[];
}

interface Conversation {
    id?: string; // Added id for easier key tracking
    otherId: string;
    lastMessage: string;
    timestamp: string;
    isRead: boolean;
    unreadCount?: number;
    user?: {
        firstName: string;
        lastName: string;
        email: string;
        profileHtml?: string; // Added profileHtml
    };
    isArchived?: boolean; // Added isArchived
    isMuted?: boolean; // Added isMuted
}

import { useSearchParams } from 'next/navigation';

const LinkPreview = ({ url }: { url: string }) => {
    const [data, setData] = useState<{ ogTitle?: string, ogDescription?: string, ogImage?: { url: string }[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.post('/chat/link-preview', { url })
            .then(res => setData(res.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, [url]);

    if (loading) return <div className="mt-2 p-2 rounded-lg bg-slate-900/50 animate-pulse h-20" />;
    if (!data || (!data.ogTitle && !data.ogDescription)) return null;

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-2 rounded-lg bg-slate-900/50 overflow-hidden hover:bg-slate-900 transition-colors border border-white/5">
            {data.ogImage?.[0]?.url && (
                <img src={data.ogImage[0].url} alt="Preview" className="w-full h-32 object-cover" />
            )}
            <div className="p-3">
                <h4 className="text-sm font-semibold text-white line-clamp-1">{data.ogTitle}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{data.ogDescription}</p>
            </div>
        </a>
    );
};

const MessagesPage = () => {
    const { userId, roles } = useKeycloak();
    const searchParams = useSearchParams();
    const participantId = searchParams.get('participantId');
    const [socket, setSocket] = useState<Socket | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [chatLoading, setChatLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [contract, setContract] = useState<any>(null);
    const [contractLoading, setContractLoading] = useState(false);

    const fetchContractContext = React.useCallback(async (otherId: string) => {
        if (!userId) return;
        setContractLoading(true);
        try {
            const contractRes = await api.get(`/contracts/between/${otherId}`);
            setContract(contractRes.data);
        } catch (error) {
            console.error('Failed to fetch contract context', error);
        } finally {
            setContractLoading(false);
        }
    }, [userId]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [prevScrollHeight, setPrevScrollHeight] = useState(0);

    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [tempAttachments, setTempAttachments] = useState<string[]>([]);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [lastSeen, setLastSeen] = useState<string | null>(null);
    const [myStatus, setMyStatus] = useState<'online' | 'dnd'>('online');
    const [userStatuses, setUserStatuses] = useState<Map<string, string>>(new Map());
    const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);

    const [viewArchived, setViewArchived] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, chat: Conversation } | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchMode, setSearchMode] = useState<'PEOPLE' | 'MESSAGES'>('PEOPLE');
    const [globalSearchResults, setGlobalSearchResults] = useState<Message[]>([]);
    const [isGlobalSearching, setIsGlobalSearching] = useState(false);
    const [chatSearchTerm, setChatSearchTerm] = useState(''); // Search within chat

    const [isConnected, setIsConnected] = useState(false); // Connection status

    // Call State
    const [callData, setCallData] = useState<{ senderId: string, offer: any, isVideo: boolean, callerName?: string } | null>(null);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isIncomingCall, setIsIncomingCall] = useState(false);
    const [isVideoCall, setIsVideoCall] = useState(true);

    // Report State
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [showPinnedList, setShowPinnedList] = useState(false);
    const [reportType, setReportType] = useState('SPAM');
    const [reportReason, setReportReason] = useState('');
    const [reporting, setReporting] = useState(false);

    const [lastSendTime, setLastSendTime] = useState(0);
    const MESSAGE_COOLDOWN = 1000; // 1 second

    // Refs for socket listeners to avoid reconnections
    const selectedChatRef = useRef<Conversation | null>(null);
    const contractRef = useRef<any>(null);
    const userIdRef = useRef<string | null>(null);

    useEffect(() => { selectedChatRef.current = selectedChat; }, [selectedChat]);
    useEffect(() => { contractRef.current = contract; }, [contract]);
    useEffect(() => { userIdRef.current = userId; }, [userId]);

    // Initialize Socket
    useEffect(() => {
        if (!userId) return;

        const newSocket = io('http://localhost:3006', {
            query: { userId: userId! }
        }); // Chat Service URL
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to Chat Service');
            setIsConnected(true);
            newSocket.emit('getOnlineUsers', {}, (users: string[]) => {
                setOnlineUsers(new Set(users));
            });
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from Chat Service');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.error('Connection Error:', err);
            setIsConnected(false);
        });

        // Call Events
        newSocket.on('incoming_call', (data: { senderId: string, offer: any, isVideo: boolean }) => {
            // Find caller name from conversations or users list if possible
            // For now just show ID or "User"
            setCallData({ ...data, callerName: 'User' });
            setIsIncomingCall(true);
            setIsVideoCall(data.isVideo);
        });

        newSocket.on('call_ended', () => {
            setCallData(null);
            setIsCallActive(false);
            setIsIncomingCall(false);
        });

        // Fallback if callback not supported or event based
        newSocket.on('getOnlineUsers', (users: string[]) => {
            setOnlineUsers(new Set(users));
        });

        newSocket.on('userOnline', (data: { userId: string, status?: string }) => {
            setOnlineUsers(prev => new Set(prev).add(data.userId));
            if (data.status) {
                const status = data.status;
                setUserStatuses(prev => {
                    const next = new Map(prev);
                    next.set(data.userId, status);
                    return next;
                });
            }
        });

        newSocket.on('userOffline', (data: { userId: string, lastSeen?: string }) => {
            setOnlineUsers(prev => {
                const next = new Set(prev);
                next.delete(data.userId);
                return next;
            });
            if (selectedChat?.otherId === data.userId && data.lastSeen) {
                setLastSeen(data.lastSeen);
            }
        });

        newSocket.on('user_status_change', (data: { userId: string, status: string, lastSeen?: string }) => {
            if (data.status === 'offline') {
                if (data.userId === selectedChatRef.current?.otherId) {
                    setLastSeen(data.lastSeen || new Date().toISOString());
                }
                setOnlineUsers(prev => {
                    const next = new Set(prev);
                    next.delete(data.userId);
                    return next;
                });
            } else {
                setOnlineUsers(prev => new Set(prev).add(data.userId));
                setUserStatuses(prev => new Map(prev).set(data.userId, data.status));
            }
        });

        newSocket.on('newMessage', (message: Message) => {
            const currentSelectedChat = selectedChatRef.current;
            if (currentSelectedChat && (message.senderId === currentSelectedChat.otherId || message.receiverId === currentSelectedChat.otherId)) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
                setIsTyping(false);

                // If message is from other and we are in chat, mark as read
                if (message.senderId === currentSelectedChat.otherId) {
                    api.post(`/chat/conversations/${currentSelectedChat.otherId}/read`, { userId: userIdRef.current });
                    newSocket.emit('messageRead', { senderId: userIdRef.current || '', receiverId: currentSelectedChat.otherId });
                }
            }
            // Refresh conversations to update last message
            fetchConversations();
        });

        newSocket.on('typing', (data: { senderId: string }) => {
            if (selectedChatRef.current && data.senderId === selectedChatRef.current.otherId) {
                setIsTyping(true);
                scrollToBottom();
            }
        });

        newSocket.on('stopTyping', (data: { senderId: string }) => {
            if (selectedChatRef.current && data.senderId === selectedChatRef.current.otherId) {
                setIsTyping(false);
            }
        });

        newSocket.on('messageUpdated', (data: { id: string; content: string }) => {
            setMessages(prev => prev.map(m => m._id === data.id ? { ...m, content: data.content, isEdited: true } : m));
        });

        newSocket.on('messageDeleted', (data: { id: string }) => {
            setMessages(prev => prev.map(m => m._id === data.id ? { ...m, deletedAt: new Date().toISOString() } : m));
        });

        newSocket.on('readReceipt', (data: { id: string }) => {
            setMessages(prev => prev.map(m => m._id === data.id || !data.id ? { ...m, isRead: true } : m));
        });

        newSocket.on('newNotification', (data: any) => {
            console.log('Notification received:', data);
            const currentSelectedChat = selectedChatRef.current;
            const currentContract = contractRef.current;
            // If the notification has a contractId and it matches current, refresh contract
            if (data.metadata?.contractId && currentSelectedChat?.id && currentContract?.id === data.metadata.contractId) {
                fetchContractContext(currentSelectedChat.otherId);
            }
        });

        newSocket.on('messagePinned', (message: Message) => {
            setMessages(prev => prev.map(m => m._id === message._id ? message : m));
            if (message.isPinned) {
                setPinnedMessages(prev => [message, ...prev.filter(p => p._id !== message._id)]);
            } else {
                setPinnedMessages(prev => prev.filter(p => p._id !== message._id));
            }
        });

        newSocket.on('messageUpdated', (updated: Message) => {
            setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));
            setPinnedMessages(prev => prev.map(p => p._id === updated._id ? updated : p));
        });

        return () => {
            newSocket.disconnect();
        };
    }, [userId]); // Only reconnect on userId change

    // Fetch Conversations
    const fetchConversations = React.useCallback(async () => {
        if (!userId) return;
        try {
            const res = await api.get('/chat/conversations');
            const convs = res.data;

            const enrichedConvs = await Promise.all(convs.map(async (c: any) => {
                try {
                    const userRes = await api.get(`/users/${c.otherId}`);
                    return { ...c, user: userRes.data, id: c.otherId };
                } catch (e) {
                    return { ...c, user: { firstName: 'Unknown', lastName: 'User', email: '' }, id: c.otherId };
                }
            }));

            setConversations(enrichedConvs);
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Handle Deep Link to Chat
    useEffect(() => {
        if (!participantId || !userId || loading) return;

        const handleDeepLink = async () => {
            const existingConv = conversations.find(c => c.otherId === participantId);
            if (existingConv) {
                if (selectedChatRef.current?.otherId !== participantId) {
                    setSelectedChat(existingConv);
                }
            } else {
                try {
                    const userRes = await api.get(`/users/${participantId}`);
                    const newConv: Conversation = {
                        otherId: participantId,
                        lastMessage: '',
                        timestamp: new Date().toISOString(),
                        isRead: true,
                        user: userRes.data,
                        id: `temp-${participantId}`
                    };
                    if (selectedChatRef.current?.otherId !== participantId) {
                        setSelectedChat(newConv);
                    }
                } catch (e) {
                    console.error('Failed to fetch participant for new chat', e);
                }
            }
        };

        handleDeepLink();
    }, [participantId, userId, conversations, loading]);

    // Global Search Logic
    useEffect(() => {
        if (searchMode !== 'MESSAGES' || searchTerm.length < 3 || !userId) {
            setGlobalSearchResults([]);
            return;
        }

        const runGlobalSearch = async () => {
            setIsGlobalSearching(true);
            try {
                const res = await api.get(`/chat/search?q=${searchTerm}`);
                setGlobalSearchResults(res.data);
            } catch (err) {
                console.error('Global search failed', err);
            } finally {
                setIsGlobalSearching(false);
            }
        };

        const timeoutId = setTimeout(runGlobalSearch, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, searchMode, userId]);

    // Fetch Chat History & Contract context
    useEffect(() => {
        if (!selectedChat || !userId) return;

        const fetchHistory = async () => {
            setChatLoading(true);
            try {
                let data = [];
                if (chatSearchTerm.length > 2) {
                    const res = await api.get(`/chat/search?q=${chatSearchTerm}&peerId=${selectedChat.otherId}`);
                    data = res.data;
                    setHasMore(false); // Disable scrolling for search results for now
                } else {
                    // Fetch Messages
                    const res = await api.get(`/chat/history?user1=${userId}&user2=${selectedChat.otherId}`);
                    data = res.data;
                    setHasMore(res.data.length === 50);
                    setTimeout(() => scrollToBottom(), 100);
                }
                setMessages(data);

                if (!chatSearchTerm) {
                    // Fetch Pinned Messages
                    socket?.emit('getPinnedMessages', { senderId: userId, receiverId: selectedChat.otherId }, (pinned: Message[]) => {
                        setPinnedMessages(pinned);
                    });

                    // Join socket room only if not searching (or keep it joined)
                    socket?.emit('joinRoom', { senderId: userId, receiverId: selectedChat.otherId });

                    // Fetch Contract Context
                    fetchContractContext(selectedChat.otherId);

                    // Mark as read
                    await api.post(`/chat/conversations/${selectedChat.otherId}/read`, { userId });
                    socket?.emit('messageRead', { senderId: userId, receiverId: selectedChat.otherId });

                    // Refresh conversations locally to clear badge
                    setConversations(prev => prev.map(c =>
                        c.otherId === selectedChat.otherId ? { ...c, unreadCount: 0, isRead: true } : c
                    ));
                }

            } catch (error) {
                console.error('Failed to fetch history', error);
            } finally {
                setChatLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchHistory();
        }, 500); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [selectedChat, userId, socket, fetchContractContext, chatSearchTerm]);

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

    const handleTogglePin = (message: Message) => {
        if (!socket || !selectedChat) return;
        socket.emit('pinMessage', {
            messageId: message._id,
            senderId: userId,
            receiverId: selectedChat.otherId
        });
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
    // Fetch last seen when selecting a chat
    useEffect(() => {
        if (selectedChat && !onlineUsers.has(selectedChat.otherId) && socket) {
            socket.emit('getLastSeen', { userId: selectedChat.otherId }, (timestamp: string | null) => {
                setLastSeen(timestamp);
            });
        } else {
            setLastSeen(null);
        }
    }, [selectedChat, onlineUsers, socket]);



    // Fetch custom status when selecting a chat
    useEffect(() => {
        if (selectedChat && onlineUsers.has(selectedChat.otherId) && socket) {
            socket.emit('getUserStatus', { userId: selectedChat.otherId }, (status: string) => {
                setUserStatuses(prev => new Map(prev).set(selectedChat.otherId, status));
            });
        }
    }, [selectedChat, onlineUsers, socket]);

    const toggleMyStatus = () => {
        if (!socket || !userId) return;
        const newStatus = myStatus === 'online' ? 'dnd' : 'online';
        setMyStatus(newStatus);
        socket.emit('setStatus', { userId, status: newStatus });
    };

    const initiateCall = (isVideo: boolean) => {
        if (!selectedChat || !userId || !socket) return;
        setIsVideoCall(isVideo);
        setIsCallActive(true);
        // We don't need to set callData for outgoing, CallModal handles it via otherId
    };

    // ---------- Message edit & delete handlers ----------
    const handleEditMessage = async (msgId: string, currentContent: string) => {
        const newContent = prompt('Edit your message:', currentContent);
        if (newContent === null || newContent.trim() === '' || !socket) return;
        try {
            await api.patch(`/chat/${msgId}`, { content: newContent });
            socket.emit('messageUpdate', {
                id: msgId,
                senderId: userId,
                receiverId: selectedChat!.otherId,
                content: newContent
            });
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
            socket.emit('messageDelete', {
                id: msgId,
                senderId: userId,
                receiverId: selectedChat!.otherId
            });
            // Optimistically mark as deleted
            setMessages(prev => prev.map(m => (m._id === msgId ? { ...m, deletedAt: new Date().toISOString() } : m)));
        } catch (err) {
            console.error('Failed to delete message', err);
        }
    };

    const handleToggleReaction = (msgId: string, emoji: string) => {
        if (!socket || !userId || !selectedChat) return;
        socket.emit('toggleReaction', {
            messageId: msgId,
            userId,
            emoji,
            receiverId: selectedChat.otherId,
        });
    };

    const handleReply = (msg: Message) => {
        setReplyingTo(msg);
        // Focus the input
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        input?.focus();
    };

    const uploadFile = async (file: File) => {
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
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files.length) return;
        await uploadFile(e.target.files[0]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            for (const file of files) {
                await uploadFile(file);
            }
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
        // Rate limiting check
        const now = Date.now();
        if (now - lastSendTime < MESSAGE_COOLDOWN) {
            console.warn('Sending too fast');
            return;
        }

        // Allow sending if there is text OR attachments
        if ((!newMessage.trim() && !tempAttachments.length) || !selectedChat || !userId || !socket) return;

        socket.emit('stopTyping', { senderId: userId, receiverId: selectedChat.otherId });

        const messageData = {
            senderId: userId,
            receiverId: selectedChat.otherId,
            content: newMessage,
            attachments: tempAttachments,
            replyTo: replyingTo?._id
        };

        socket.emit('sendMessage', messageData);
        setNewMessage('');
        setTempAttachments([]);
        setReplyingTo(null);
        setLastSendTime(now);
    };

    const handleReportUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedChat || !userId) return;

        setReporting(true);
        try {
            await api.post('/admins/reports', {
                reporterId: userId,
                targetId: selectedChat.otherId,
                type: reportType,
                reason: reportReason
            });
            setIsReportModalOpen(false);
            setReportReason('');
            alert('Report submitted successfully. Thank you for making the platform safer.');
        } catch (err) {
            console.error('Failed to report user', err);
            alert('Failed to submit report. Please try again.');
        } finally {
            setReporting(false);
        }
    };

    const filteredConversations = useMemo(() => {
        return conversations.filter(c => {
            const matchesSearch = (c.user?.firstName + ' ' + c.user?.lastName).toLowerCase().includes(searchTerm.toLowerCase());
            const matchesArchive = viewArchived ? c.isArchived : !c.isArchived;
            return matchesSearch && matchesArchive;
        });
    }, [conversations, searchTerm, viewArchived]);

    const handleContextMenu = (e: React.MouseEvent, chat: Conversation) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, chat });
    };

    const handleArchiveToggle = async (chat: Conversation) => {
        if (!userId) return;
        try {
            if (chat.isArchived) {
                await api.delete(`/chat/conversations/${chat.id}/archive`, { data: { userId } });
            } else {
                await api.post(`/chat/conversations/${chat.id}/archive`, { userId });
            }
            // Update local state
            setConversations(prev => prev.map(c => c.id === chat.id ? { ...c, isArchived: !c.isArchived } : c));
            setContextMenu(null);
        } catch (err) {
            console.error('Failed to toggle archive', err);
        }
    };

    const handleDeleteConversation = async (chat: Conversation) => {
        if (!userId || !confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) return;
        try {
            await api.delete(`/chat/conversations/${chat.otherId}`, { data: { userId } });
            // Remove from local state
            setConversations(prev => prev.filter(c => c.id !== chat.id));
            if (selectedChat?.id === chat.id) setSelectedChat(null);
            setContextMenu(null);
        } catch (err) {
            console.error('Failed to delete conversation', err);
        }
    };

    // Close context menu on click elsewhere
    useEffect(() => {
        const closeMenu = () => setContextMenu(null);
        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-120px)] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex relative flex-col">
            {/* Connection Warning */}
            {!isConnected && (
                <div className="bg-amber-500/10 text-amber-500 text-xs text-center py-1 font-medium border-b border-amber-500/20">
                    Connection lost. Reconnecting...
                </div>
            )}
            <div className="flex-1 flex overflow-hidden">
                {/* Context Menu */}
                {contextMenu && (
                    <div
                        className="fixed z-50 bg-slate-800 border border-white/10 rounded-lg shadow-xl py-1 min-w-[150px]"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                    >
                        <button
                            onClick={() => handleArchiveToggle(contextMenu.chat)}
                            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <Archive className="w-4 h-4" />
                            {contextMenu.chat.isArchived ? 'Unarchive' : 'Archive'}
                        </button>
                        <button
                            onClick={() => handleDeleteConversation(contextMenu.chat)}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                )}

                {/* Sidebar - Conversations */}
                <div className={`w-80 border-r border-slate-800 flex flex-col bg-slate-950/50 md:flex ${selectedChat ? 'hidden' : 'flex'}`}>
                    <div className="p-4 border-b border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-xl font-bold text-white">Messages</h1>
                            <button
                                onClick={() => setViewArchived(!viewArchived)}
                                className={`p-1.5 rounded-lg transition-colors ${viewArchived ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                title={viewArchived ? "Show Active Chats" : "Show Archived Chats"}
                            >
                                <Archive className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex gap-1 mb-3 p-1 bg-slate-900 rounded-lg">
                            <button
                                onClick={() => setSearchMode('PEOPLE')}
                                className={`flex-1 py-1 px-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${searchMode === 'PEOPLE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                People
                            </button>
                            <button
                                onClick={() => setSearchMode('MESSAGES')}
                                className={`flex-1 py-1 px-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${searchMode === 'MESSAGES' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Messages
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder={searchMode === 'PEOPLE' ? "Search people..." : "Search in all messages..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                            />
                            {isGlobalSearching && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
                            )}
                        </div>
                    </div>

                    {/* Filtered Content */}
                    <div className="flex-1 overflow-y-auto">
                        {searchMode === 'MESSAGES' && searchTerm.length >= 3 ? (
                            <div className="py-2">
                                {globalSearchResults.length === 0 && !isGlobalSearching ? (
                                    <div className="p-8 text-center text-slate-500 text-xs">No messages found matching "{searchTerm}"</div>
                                ) : (
                                    globalSearchResults.map((msg) => {
                                        const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
                                        const chat = conversations.find(c => c.otherId === otherId);
                                        return (
                                            <div
                                                key={msg._id}
                                                onClick={() => {
                                                    if (chat) {
                                                        setSelectedChat(chat);
                                                    } else {
                                                        // Fallback: create temporary chat if not found in recent convs
                                                        api.get(`/users/${otherId}`).then(u => {
                                                            setSelectedChat({
                                                                otherId,
                                                                lastMessage: msg.content,
                                                                timestamp: msg.createdAt,
                                                                isRead: true,
                                                                user: u.data,
                                                                id: `temp-${otherId}`
                                                            });
                                                        });
                                                    }
                                                }}
                                                className="p-4 border-b border-slate-800/50 cursor-pointer hover:bg-slate-800/40 transition-all"
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                                                        {chat?.user?.firstName} {chat?.user?.lastName}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500">
                                                        {new Date(msg.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-300 line-clamp-2 italic">"{msg.content}"</p>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        ) : (
                            filteredConversations.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => {
                                        setSelectedChat(chat);
                                    }}
                                    onContextMenu={(e) => handleContextMenu(e, chat)}
                                    className={`p-4 border-b border-slate-800/50 cursor-pointer hover:bg-slate-800/50 transition-colors ${selectedChat?.id === chat.id ? 'bg-slate-800/80 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                                {chat.user?.firstName?.[0]}{chat.user?.lastName?.[0]}
                                            </div>
                                            {onlineUsers.has(chat.otherId) && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0B0F19] rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-semibold text-white truncate">
                                                    {chat.user?.firstName} {chat.user?.lastName}
                                                </h3>
                                                <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                                    {new Date(chat.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className={`text-sm truncate ${(chat.unreadCount || 0) > 0 ? 'text-white font-medium' : 'text-slate-400'}`}>
                                                {chat.lastMessage}
                                            </p>
                                        </div>
                                        {(chat.unreadCount || 0) > 0 && (
                                            <div className="flex flex-col justify-center">
                                                <span className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                                                    {chat.unreadCount}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area & Sidebar */}
                <div className={`flex-1 flex md:flex ${selectedChat ? 'flex' : 'hidden'}`}>
                    <div className="flex-1 flex flex-col bg-slate-900 border-r border-slate-800 relative min-w-0">
                        {selectedChat ? (
                            <>
                                {/* Chat Header */}
                                <div className="absolute top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 z-10">
                                    <div className="flex items-center gap-3">
                                        {/* Back button for Mobile */}
                                        <button
                                            onClick={() => setSelectedChat(null)}
                                            className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg relative group overflow-hidden">
                                            {selectedChat.user?.profileHtml ? (
                                                <div dangerouslySetInnerHTML={{ __html: selectedChat.user.profileHtml }} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{selectedChat.user?.firstName?.[0]}{selectedChat.user?.lastName?.[0]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="font-semibold text-white">
                                                    {selectedChat.user?.firstName} {selectedChat.user?.lastName}
                                                </h2>
                                                {onlineUsers.has(selectedChat.otherId) ? (
                                                    <div className="flex items-center gap-1">
                                                        {userStatuses.get(selectedChat.otherId) === 'dnd' ? (
                                                            <>
                                                                <span className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                                                                <span className="text-xs text-red-400 font-medium">Do Not Disturb</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                                                <span className="text-xs text-green-400 font-medium">Online</span>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-start leading-tight">
                                                        <div className="flex items-center gap-1">
                                                            <span className="w-2 h-2 bg-slate-500 rounded-full" />
                                                            <span className="text-xs text-slate-400">Offline</span>
                                                        </div>
                                                        {lastSeen && (
                                                            <span className="text-[10px] text-slate-500">
                                                                Last seen {new Date(lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Status Toggle */}
                                        <button
                                            onClick={toggleMyStatus}
                                            className={`p-2 rounded-full transition-colors ${myStatus === 'dnd' ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'}`}
                                            title={`Set status to ${myStatus === 'online' ? 'Do Not Disturb' : 'Online'}`}
                                        >
                                            <div className={`w-3 h-3 rounded-full ${myStatus === 'dnd' ? 'bg-red-500' : 'bg-green-500'}`} />
                                        </button>
                                        <button
                                            onClick={() => initiateCall(false)}
                                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                                            title="Audio Call"
                                        >
                                            <Phone className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => initiateCall(true)}
                                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                                            title="Video Call"
                                        >
                                            <Video className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setIsReportModalOpen(true)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Report User"
                                        >
                                            <Flag className="w-5 h-5" />
                                        </button>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search..."
                                                value={chatSearchTerm}
                                                onChange={(e) => setChatSearchTerm(e.target.value)}
                                                className={`bg-slate-800 border-none rounded-lg py-1 px-3 text-sm text-white focus:ring-1 focus:ring-blue-500 transition-all ${chatSearchTerm ? 'w-40' : 'w-0 opacity-0 group-hover:w-40 group-hover:opacity-100 focus:w-40 focus:opacity-100'}`}
                                            />
                                            <button
                                                onClick={() => setChatSearchTerm('')}
                                                className={`absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white ${!chatSearchTerm && 'pointer-events-none'}`}
                                            >
                                                <Search className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div
                                    ref={scrollContainerRef}
                                    onScroll={handleScroll}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className="flex-1 overflow-y-auto p-4 space-y-4 pt-20 pb-4 relative"
                                >
                                    {pinnedMessages.length > 0 && (
                                        <div className="sticky top-0 left-0 right-0 z-20 mx-2 mb-4">
                                            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-3 flex items-center justify-between shadow-lg">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                                        <Pin className="w-4 h-4 rotate-45" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">Pinned Message</p>
                                                        <p className="text-xs text-slate-200 truncate font-medium italic">"{pinnedMessages[0].content}"</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0 ml-4">
                                                    <button
                                                        onClick={() => {
                                                            const el = document.getElementById(`msg-${pinnedMessages[0]._id}`);
                                                            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                            // Optional: briefly highlight
                                                            el?.classList.add('bg-indigo-500/20');
                                                            setTimeout(() => el?.classList.remove('bg-indigo-500/20'), 2000);
                                                        }}
                                                        className="text-[10px] font-bold text-slate-400 hover:text-white px-2 py-1 transition-colors"
                                                    >
                                                        GOTO
                                                    </button>
                                                    <span className="text-slate-800">|</span>
                                                    <button
                                                        onClick={() => handleTogglePin(pinnedMessages[0])}
                                                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                                                        title="Unpin"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            {pinnedMessages.length > 1 && (
                                                <div className="mt-1 flex justify-center">
                                                    <button
                                                        onClick={() => setShowPinnedList(true)}
                                                        className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-indigo-400 transition-colors"
                                                    >
                                                        + {pinnedMessages.length - 1} more pinned
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {isDragging && (
                                        <div className="absolute inset-0 z-50 bg-indigo-600/20 backdrop-blur-sm flex flex-col items-center justify-center border-2 border-dashed border-indigo-500 rounded-xl m-4 pointer-events-none">
                                            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white mb-4 animate-bounce">
                                                <Paperclip className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white">Drop files to upload</h3>
                                            <p className="text-indigo-200">Release to attach files to your message</p>
                                        </div>
                                    )}

                                    {!chatLoading && !messages.length && <div className="text-center text-slate-500 mt-10">No messages yet</div>}

                                    {/* Loading more indicator, could be improved with state */}

                                    {chatLoading ? (
                                        <div className="flex justify-center py-10">
                                            <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
                                        </div>
                                    ) : (


                                        messages
                                            .map((msg, idx) => {
                                                const isMe = msg.senderId === userId;
                                                const showDateSeparator = idx === 0 || new Date(messages[idx - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

                                                return (
                                                    <div key={msg._id} id={`msg-${msg._id}`}>
                                                        {showDateSeparator && (
                                                            <div className="flex justify-center my-4">
                                                                <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded-full">
                                                                    {new Date(msg.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                                            <div className={`max-w-[70%] rounded-2xl px-4 py-3 relative ${isMe
                                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                                : 'bg-slate-800 text-slate-200 rounded-bl-none'
                                                                }`}>
                                                                {msg.isPinned && (
                                                                    <div className={`mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${isMe ? 'text-blue-100' : 'text-blue-400'}`}>
                                                                        <Pin className="w-3 h-3 rotate-45" />
                                                                        Pinned
                                                                    </div>
                                                                )}
                                                                {msg.replyTo && (
                                                                    <div className={`mb-2 p-2 rounded-lg text-xs border-l-4 ${isMe ? 'bg-white/10 border-white/30 text-white/80' : 'bg-slate-900/50 border-blue-500/50 text-slate-400'}`}>
                                                                        <div className="font-bold mb-1 flex items-center gap-1">
                                                                            <CornerUpLeft className="w-3 h-3" />
                                                                            {msg.replyTo.senderId === userId ? 'You' : 'Them'}
                                                                        </div>
                                                                        <p className="line-clamp-1 italic">{msg.replyTo.content}</p>
                                                                    </div>
                                                                )}
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
                                                                        {msg.content?.match(/(https?:\/\/[^\s]+)/g)?.map((url, i) => (
                                                                            <LinkPreview key={i} url={url} />
                                                                        ))}

                                                                        {msg.isFlagged && !isMe && (
                                                                            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 animate-pulse">
                                                                                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                                                                <div>
                                                                                    <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-1">Safety Warning</p>
                                                                                    <p className="text-xs text-amber-200/80 leading-relaxed font-medium">
                                                                                        {msg.flagReason || "This message was flagged as suspicious. Please avoid sharing sensitive info or moving off-platform."}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Reactions Display */}
                                                                        {msg.reactions && msg.reactions.length > 0 && (
                                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                                {msg.reactions.map((r, i) => (
                                                                                    <button
                                                                                        key={i}
                                                                                        onClick={() => handleToggleReaction(msg._id, r.emoji)}
                                                                                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] transition-all ${r.userIds.includes(userId!)
                                                                                            ? 'bg-blue-500/30 text-blue-200 border border-blue-500/50'
                                                                                            : 'bg-slate-700/50 text-slate-400 border border-white/5'
                                                                                            }`}
                                                                                        title={r.userIds.length > 0 ? "Users: " + r.userIds.join(', ') : ""}
                                                                                    >
                                                                                        <span>{r.emoji}</span>
                                                                                        <span className="font-bold">{r.userIds.length}</span>
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        )}

                                                                        <div className="flex gap-2 mt-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <div className="relative group/react">
                                                                                <button
                                                                                    className={`p-1 hover:text-white ${isMe ? 'text-blue-200' : 'text-slate-400'}`}
                                                                                    title="React"
                                                                                >
                                                                                    <Smile className="w-3 h-3" />
                                                                                </button>
                                                                                <div className="absolute bottom-full right-0 mb-1 hidden group-hover/react:flex bg-slate-800 border border-slate-700 rounded-full p-1 shadow-xl gap-1 z-50 animate-in fade-in slide-in-from-bottom-1 duration-200">
                                                                                    {['👍', '❤️', '😂', '😮', '😢', '🔥'].map(emoji => (
                                                                                        <button
                                                                                            key={emoji}
                                                                                            onClick={() => handleToggleReaction(msg._id, emoji)}
                                                                                            className="hover:scale-125 transition-transform px-1 py-0.5 text-sm"
                                                                                        >
                                                                                            {emoji}
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleReply(msg)}
                                                                                className={`p-1 hover:text-white ${isMe ? 'text-blue-200' : 'text-slate-400'}`}
                                                                                title="Reply"
                                                                            >
                                                                                <Reply className="w-3 h-3" />
                                                                            </button>
                                                                            {isMe && (
                                                                                <>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleTogglePin(msg)}
                                                                                        className={`p-1 hover:text-white ${isMe ? 'text-blue-200' : 'text-slate-400'}`}
                                                                                        title={msg.isPinned ? "Unpin Message" : "Pin Message"}
                                                                                    >
                                                                                        <Pin className={`w-3 h-3 ${msg.isPinned ? 'text-blue-300 fill-blue-300' : ''}`} />
                                                                                    </button>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleEditMessage(msg._id, msg.content)}
                                                                                        className="p-1 text-blue-200 hover:text-white"
                                                                                    >
                                                                                        <Edit className="w-3 h-3" />
                                                                                    </button>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleDeleteMessage(msg._id)}
                                                                                        className="p-1 text-blue-200 hover:text-red-300"
                                                                                    >
                                                                                        <Trash2 className="w-3 h-3" />
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                        <div className={`flex items-center gap-1 justify-end mt-1 ${isMe ? 'text-blue-200' : 'text-slate-500'}`}>
                                                                            <p className="text-[10px]">
                                                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                            </p>
                                                                            {isMe && (
                                                                                msg.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
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

                                    {replyingTo && (
                                        <div className="mx-4 mb-2 p-3 bg-slate-800 rounded-xl border-l-4 border-blue-500 flex items-center justify-between animate-in slide-in-from-bottom-2 fade-in duration-200">
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                    <Reply className="w-3 h-3" />
                                                    Replying to {replyingTo.senderId === userId ? 'yourself' : 'them'}
                                                </p>
                                                <p className="text-xs text-slate-300 truncate italic">"{replyingTo.content}"</p>
                                            </div>
                                            <button
                                                onClick={() => setReplyingTo(null)}
                                                className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
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
                                            disabled={(!newMessage.trim() && !tempAttachments.length) || !isConnected}
                                            className="p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-all"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
                                <div className="w-24 h-24 rounded-full bg-indigo-500/5 flex items-center justify-center mb-6 relative">
                                    <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping opacity-20" />
                                    <Send className="w-10 h-10 text-indigo-500/50" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Your Workspace</h3>
                                <p className="text-sm max-w-xs leading-relaxed text-slate-400 font-medium">
                                    Select a person from the left menu to start a conversation or continue where you left off.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Contract Context Sidebar */}
                    {selectedChat && (
                        <ContractContextSidebar
                            contract={contract}
                            loading={contractLoading}
                            participantId={selectedChat.otherId}
                            participantName={selectedChat.user ? `${selectedChat.user.firstName} ${selectedChat.user.lastName}` : undefined}
                            showHireButton={roles?.includes('CLIENT')}
                        />
                    )}
                </div>
            </div>

            {/* Incoming Call Dialog */}
            {isIncomingCall && callData && !isCallActive && (
                <div className="fixed top-10 right-10 z-50 bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-2xl flex border-l-4 border-l-indigo-500 animate-pulse-border flex-col gap-4 animate-in slide-in-from-top-10 fade-in duration-300 w-80">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xl animate-pulse">
                            {callData.callerName?.[0] || '?'}
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">{callData.callerName || 'Unknown'}</h3>
                            <p className="text-slate-400 text-sm">Incoming {callData.isVideo ? 'Video' : 'Audio'} Call...</p>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-2">
                        <button
                            onClick={() => {
                                socket?.emit('end_call', { senderId: userId, receiverId: callData.senderId });
                                setIsIncomingCall(false);
                                setCallData(null);
                            }}
                            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            <PhoneOff className="w-5 h-5" /> Decline
                        </button>
                        <button
                            onClick={() => {
                                setIsCallActive(true);
                                setIsIncomingCall(false);
                            }}
                            className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            <Video className="w-5 h-5" /> Accept
                        </button>
                    </div>
                </div>
            )}

            {/* Pinned Messages List Modal */}
            {showPinnedList && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Pin className="w-4 h-4 text-indigo-400 rotate-45" />
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Pinned Messages</h3>
                            </div>
                            <button
                                onClick={() => setShowPinnedList(false)}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
                            {pinnedMessages.map((msg) => (
                                <div
                                    key={msg._id}
                                    className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 group hover:border-indigo-500/30 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-300 line-clamp-3 italic mb-2">"{msg.content}"</p>
                                            <p className="text-[10px] text-slate-500 font-medium">
                                                {new Date(msg.pinnedAt || msg.createdAt).toLocaleDateString()} at {new Date(msg.pinnedAt || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => {
                                                    setShowPinnedList(false);
                                                    const el = document.getElementById(`msg-${msg._id}`);
                                                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    el?.classList.add('bg-indigo-500/20');
                                                    setTimeout(() => el?.classList.remove('bg-indigo-500/20'), 2000);
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-indigo-400 transition-colors"
                                                title="Go to message"
                                            >
                                                <Search className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleTogglePin(msg)}
                                                className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                                                title="Unpin"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-slate-800/20 border-t border-slate-800 flex justify-center">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{pinnedMessages.length} total pinned items</p>
                        </div>
                    </div>
                </div>
            )}
            {/* Report Modal */}
            {isReportModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Flag className="w-5 h-5 text-red-500" />
                                Report User
                            </h3>
                            <button onClick={() => setIsReportModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleReportUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                                <select
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="SPAM">Spam or Scams</option>
                                    <option value="HARASSMENT">Harassment or Abuse</option>
                                    <option value="INAPPROPRIATE_CONTENT">Inappropriate Content</option>
                                    <option value="FRAUD">Fraudulent Activity</option>
                                    <option value="OFF_PLATFORM_PAYMENT">Soliciting Off-Platform Payment</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Details</label>
                                <textarea
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 h-32 resize-none"
                                    placeholder="Please provide more details about the issue..."
                                    required
                                />
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                <p className="text-xs text-amber-500 leading-relaxed">
                                    Our moderation team will review your report and the chat history. False reporting may result in actions against your account.
                                </p>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsReportModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={reporting || !reportReason.trim()}
                                    className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium disabled:opacity-50 transition-all shadow-lg shadow-red-500/20"
                                >
                                    {reporting ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Video Call Modal */}
            <CallModal
                isOpen={isCallActive}
                onClose={() => {
                    setIsCallActive(false);
                    setCallData(null);
                }}
                socket={socket}
                myId={userId || ''}
                otherId={callData?.senderId || selectedChat?.otherId || ''}
                isIncoming={!!callData?.offer}
                offer={callData?.offer}
                callerName={callData?.callerName || selectedChat?.user?.firstName}
                isVideo={isVideoCall}
            />
        </div>
    );
};


export default MessagesPage;
