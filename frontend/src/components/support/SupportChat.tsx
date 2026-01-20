'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpCircle, MessageSquare, Send, X, Bot, User, Loader2, Link as LinkIcon, Ticket } from 'lucide-react';
import api from '@/lib/api';

interface Message {
    id: string;
    role: 'bot' | 'user';
    content: string;
    timestamp: Date;
    suggestTickets?: boolean;
}

export default function SupportChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'bot', content: "Hi! I'm your Marketplace Assistant. How can I help you today?", timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/community/api/help/search', { query: input });

            if (res.data.suggestTickets) {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'bot',
                    content: res.data.message,
                    timestamp: new Date(),
                    suggestTickets: true
                }]);
            } else if (Array.isArray(res.data)) {
                // Return top match
                const topMatch = res.data[0];
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'bot',
                    content: `I found an article that might help: "${topMatch.title}". \n\n${topMatch.content.substring(0, 150)}...`,
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                content: "I'm having some trouble connecting. Please try again or open a ticket.",
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenTicket = async () => {
        const lastUserMsg = messages.filter(m => m.role === 'user').pop();
        try {
            await api.post('/community/api/help/tickets', {
                subject: 'AI Support Escalation',
                description: lastUserMsg?.content || 'No description provided.'
            });
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'bot',
                content: "Ticket created! Our team will get back to you soon.",
                timestamp: new Date()
            }]);
        } catch (error) {
            console.error("Ticket creation failed:", error);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen ? (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 shadow-2xl shadow-blue-500/40 flex items-center justify-center group transition-transform hover:scale-110 active:scale-95"
                >
                    <HelpCircle className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
                </Button>
            ) : (
                <Card className="w-[380px] h-[520px] bg-slate-900 border-slate-800 shadow-3xl shadow-black/50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 fade-in duration-300">
                    <CardHeader className="bg-slate-950 border-b border-slate-800 flex flex-row items-center justify-between p-4 space-y-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold text-white">Marketplace Bot</CardTitle>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Online</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white hover:bg-slate-800 rounded-full h-8 w-8">
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>

                    <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 scroll-smooth">
                        <CardContent className="p-0 space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-slate-800 text-slate-200 rounded-tl-none'
                                        } shadow-md`}>
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                        {msg.suggestTickets && (
                                            <Button
                                                onClick={handleOpenTicket}
                                                variant="outline"
                                                className="mt-3 w-full border-slate-700 hover:bg-slate-700 text-xs font-bold gap-2"
                                            >
                                                <Ticket className="w-3.5 h-3.5" />
                                                Open Support Ticket
                                            </Button>
                                        )}
                                        <p className={`text-[9px] mt-1.5 font-medium ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-500'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800 rounded-2xl rounded-tl-none p-3 shadow-md">
                                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </div>

                    <CardFooter className="p-4 border-t border-slate-800 bg-slate-950">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex w-full items-center gap-2"
                        >
                            <Input
                                placeholder="Ask a question..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="bg-slate-900 border-slate-800 text-white focus:ring-blue-500 placeholder:text-slate-600 h-10 text-sm rounded-xl"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!input.trim() || loading}
                                className="bg-blue-600 hover:bg-blue-500 text-white h-10 w-10 shrink-0 rounded-xl shadow-lg shadow-blue-500/20"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
