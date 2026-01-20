'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    HelpCircle,
    Ticket,
    ChevronRight,
    MessageSquare,
    Loader2,
    X,
    ArrowRight,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import api from '@/lib/api';

interface HelpArticle {
    id: string;
    title: string;
    slug: string;
    content: string;
    category: string;
}

export default function HelpCenter({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const res = await api.post('/community/help/search', { query });
            setResults(res.data);
            setSelectedArticle(null);
        } catch (error) {
            console.error('Help search failed', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden relative flex flex-col max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-500">
                                    <HelpCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Help Center</h2>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">AI-Powered Support</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-2xl text-slate-500 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="p-8 bg-slate-950/50">
                            <form onSubmit={handleSearch} className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="How can we help you today? (e.g. 'withdraw funds', 'dispute rules')"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full pl-16 pr-8 py-5 bg-slate-900 border border-slate-800 rounded-[2rem] text-white text-lg font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all shadow-lg shadow-blue-600/20"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                </button>
                            </form>
                        </div>

                        {/* Results / Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {!selectedArticle ? (
                                <div className="space-y-6">
                                    {results?.message && (
                                        <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-3xl flex gap-4">
                                            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-500 h-fit">
                                                <MessageSquare className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-white font-bold leading-relaxed">{results.message}</p>
                                                {results.ticket && (
                                                    <p className="text-xs text-slate-500">Ticket ID: <span className="font-mono text-blue-400">{results.ticket.id}</span></p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {Array.isArray(results) && results.length > 0 && (
                                        <div className="grid gap-3">
                                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Top Relevant Articles</h3>
                                            {results.map((article: HelpArticle) => (
                                                <button
                                                    key={article.id}
                                                    onClick={() => setSelectedArticle(article)}
                                                    className="w-full p-4 bg-slate-900 border border-white/5 rounded-2xl hover:border-blue-500/50 hover:bg-slate-800/50 transition-all text-left flex items-center justify-between group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2 bg-slate-800 rounded-xl text-slate-500 group-hover:text-blue-500 transition-colors">
                                                            <ChevronRight className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-white font-bold">{article.title}</span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-950 px-2 py-1 rounded-md">{article.category}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {!results && !loading && (
                                        <div className="py-12 flex flex-col items-center text-center space-y-4">
                                            <div className="p-6 bg-slate-800/50 rounded-full">
                                                <Search className="w-12 h-12 text-slate-700" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-bold text-white uppercase tracking-tight">What are you looking for?</h3>
                                                <p className="text-slate-500 max-w-xs font-medium">Search our knowledge base for instant answers to platform questions.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <button
                                        onClick={() => setSelectedArticle(null)}
                                        className="text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 hover:text-blue-400 transition-colors"
                                    >
                                        <ArrowRight className="w-4 h-4 rotate-180" />
                                        Back to Results
                                    </button>
                                    <div className="space-y-4">
                                        <h3 className="text-3xl font-black text-white leading-tight uppercase tracking-tighter">{selectedArticle.title}</h3>
                                        <div className="prose prose-invert max-w-none text-slate-300 font-medium leading-relaxed">
                                            {selectedArticle.content.split('\n').map((para, i) => (
                                                <p key={i} className="mb-4">{para}</p>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-8 border-t border-slate-800 flex items-center justify-between">
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Was this helpful?</p>
                                        <div className="flex gap-2">
                                            <button className="px-4 py-2 bg-slate-800 hover:bg-green-500/20 hover:text-green-500 rounded-xl transition-all text-xs font-black text-slate-400 uppercase tracking-widest">Yes</button>
                                            <button className="px-4 py-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-all text-xs font-black text-slate-400 uppercase tracking-widest">No</button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer / Escalation */}
                        <div className="p-8 bg-slate-950/50 border-t border-slate-800 flex justify-center">
                            <button className="flex items-center gap-3 px-6 py-4 bg-slate-900 border border-slate-800 rounded-[2rem] hover:border-blue-500/50 transition-all group">
                                <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500">
                                    <Ticket className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-black text-white uppercase tracking-tight">Contact Human Support</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Available 24/7 for account issues</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all ml-4" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
