'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import api from '@/lib/api';

interface AiStandupWidgetProps {
    contractId: string;
    messages?: string[]; // Optional: can be passed from parent if already available
}

export default function AiStandupWidget({ contractId, messages = [] }: AiStandupWidgetProps) {
    const [loading, setLoading] = useState(false);
    const [standup, setStandup] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const generateStandup = async () => {
        setLoading(true);
        setError(null);
        try {
            // In a real app, we might fetch recent messages from chat-service here 
            // if they weren't passed as props. For now we use the props or simulation.
            const sampleMessages = messages.length > 0 ? messages : [
                "I finished the frontend layout for the dashboard.",
                "Working on the API integration today.",
                "Found a bug in the auth flow, looking into it.",
                "Can you review the latest PR?",
                "Yes, I will check it in an hour."
            ];

            const res = await api.post(`/jobs/contracts/${contractId}/ai/standup`, {
                messages: sampleMessages
            });
            setStandup(res.data.summary);
            setIsExpanded(true);
        } catch (err) {
            console.error('Failed to generate standup', err);
            setError('Failed to generate AI update.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-all"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white">AI Daily Standup</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Automated Summary</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            generateStandup();
                        }}
                        disabled={loading}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        {standup ? 'Regenerate' : 'Generate Update'}
                    </button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-800"
                    >
                        <div className="p-4 space-y-4">
                            {loading ? (
                                <div className="py-8 flex flex-col items-center justify-center space-y-3 text-slate-500">
                                    <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                                    <p className="text-xs italic">Analyzing recent activity...</p>
                                </div>
                            ) : standup ? (
                                <div className="space-y-3">
                                    <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/50 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {standup}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 italic">
                                        <MessageSquare className="w-3 h-3" />
                                        Based on last 24h of coordination
                                    </div>
                                </div>
                            ) : (
                                <div className="py-6 text-center">
                                    <p className="text-xs text-slate-500">No update generated yet. Click above to summarize today's progress.</p>
                                </div>
                            )}

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                                    {error}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
