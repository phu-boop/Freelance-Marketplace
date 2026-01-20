'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface ProposalAssistantProps {
    jobId: string;
    onApply: (content: string) => void;
}

export default function ProposalAssistant({ jobId, onApply }: ProposalAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [tone, setTone] = useState<'professional' | 'casual' | 'direct'>('professional');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            // Assuming authorization header is handled globally or via interceptor
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${jobId}/ai/generate-proposal`,
                { tone },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const content = res.data.content;
            setGeneratedContent(content);
            toast.success('Proposal drafted by AI!');
        } catch (error) {
            console.error('Failed to generate proposal:', error);
            toast.error('Failed to generate proposal. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUseContent = () => {
        onApply(generatedContent);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-indigo-500/25 transition-all text-sm font-medium"
            >
                <Sparkles className="w-4 h-4" />
                AI Assistant
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-12 right-0 z-50 w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden glass"
                    >
                        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Wand2 className="w-4 h-4 text-violet-400" />
                                Proposal Generator
                            </h3>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400 font-medium">Choose Tone</label>
                                <div className="flex bg-slate-800 rounded-lg p-1">
                                    {(['professional', 'casual', 'direct'] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTone(t)}
                                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${tone === t ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {generatedContent ? (
                                <div className="space-y-3">
                                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-sm text-slate-300 h-48 overflow-y-auto custom-scrollbar">
                                        {generatedContent}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleUseContent}
                                            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Check className="w-4 h-4" />
                                            Use This
                                        </button>
                                        <button
                                            onClick={() => setGeneratedContent('')}
                                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
                                    {isGenerating ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-xs text-indigo-400 animate-pulse">Analyzing job details...</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <Sparkles className="w-8 h-8 text-slate-600 mb-1" />
                                            <p className="text-sm text-slate-400">Ready to draft your proposal?</p>
                                            <button
                                                onClick={handleGenerate}
                                                className="mt-2 px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors shadow-sm"
                                            >
                                                Generate Draft
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
