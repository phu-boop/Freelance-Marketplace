'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, MoreVertical, Phone, Video, AlertTriangle } from 'lucide-react';

interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: string;
    isMe: boolean;
    isFlagged?: boolean;
    flagReason?: string;
}

interface ChatWindowProps {
    recipientName: string;
    recipientStatus?: string;
    messages: Message[];
    onSendMessage: (content: string) => void;
}

export function ChatWindow({ recipientName, recipientStatus = 'Online', messages, onSendMessage }: ChatWindowProps) {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">{recipientName}</h3>
                        <p className="text-xs text-slate-400">{recipientStatus}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all">
                        <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all">
                        <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className="flex flex-col gap-1">
                            <div
                                className={`max-w-[100%] p-3 rounded-2xl ${msg.isMe
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-slate-800 text-slate-200 rounded-bl-none'
                                    } ${msg.isFlagged ? 'border-2 border-red-500/50' : ''}`}
                            >
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-[10px] mt-1 text-right ${msg.isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            {msg.isFlagged && (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-red-500/10 p-2 rounded-lg mt-1 border border-red-500/20">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>SAFETY WARNING: {msg.flagReason || 'Potential security risk detected.'}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-slate-800">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-all"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
