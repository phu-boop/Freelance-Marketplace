'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, CheckCircle2, Sparkles, Briefcase } from 'lucide-react';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';

interface ProposalModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string;
    jobTitle: string;
    invitationId?: string;
}

export function ProposalModal({ isOpen, onClose, jobId, jobTitle, invitationId }: ProposalModalProps) {
    const { userId } = useKeycloak();
    const [coverLetter, setCoverLetter] = useState('');
    const [bidAmount, setBidAmount] = useState('');
    const [timeline, setTimeline] = useState('');
    const [boostAmount, setBoostAmount] = useState('0');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDraftLoaded, setIsDraftLoaded] = useState(false);
    const [screeningQuestions, setScreeningQuestions] = useState<string[]>([]);
    const [screeningAnswers, setScreeningAnswers] = useState<Record<string, string>>({});
    const [aiLoading, setAiLoading] = useState(false);
    const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
    const [selectedPortfolioIds, setSelectedPortfolioIds] = useState<string[]>([]);

    React.useEffect(() => {
        if (isOpen) {
            api.get(`/jobs/${jobId}`).then(res => {
                setScreeningQuestions(res.data.screeningQuestions || []);
            }).catch(console.error);

            if (userId) {
                api.get(`/users/${userId}`).then(res => {
                    setPortfolioItems(res.data.portfolio || []);
                }).catch(console.error);
            }
        }
    }, [isOpen, jobId, userId]);

    React.useEffect(() => {
        if (isOpen && !isDraftLoaded) {
            const draft = localStorage.getItem('proposal_draft');
            if (draft) {
                try {
                    const data = JSON.parse(draft);
                    // Only pre-fill if fields are empty
                    if (!coverLetter) setCoverLetter(data.coverLetter || '');
                    if (!bidAmount) setBidAmount(data.bidAmount?.toString() || '');
                    if (!timeline) setTimeline(data.timeline || '');
                    setIsDraftLoaded(true);
                } catch (e) {
                    console.error('Failed to parse draft', e);
                }
            }
        }
    }, [isOpen, isDraftLoaded, coverLetter, bidAmount, timeline]);

    const clearDraft = () => {
        localStorage.removeItem('proposal_draft');
        setIsDraftLoaded(false);
    };

    const handleMagicDraft = async () => {
        setAiLoading(true);
        setError(null);
        try {
            const res = await api.post(`/jobs/${jobId}/ai/generate-proposal`);
            setCoverLetter(res.data.content);
            if (res.data.recommendedPortfolioIds) {
                setSelectedPortfolioIds(res.data.recommendedPortfolioIds);
            }
        } catch (err) {
            console.error('Magic Draft failed', err);
            setError('AI assistant is currently unavailable.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/proposals', {
                jobId: jobId,
                coverLetter: coverLetter,
                bidAmount: parseFloat(bidAmount),
                timeline: timeline,
                invitationId: invitationId,
                boostAmount: parseInt(boostAmount) || 0,
                screeningAnswers: screeningAnswers,
                portfolioItemIds: selectedPortfolioIds
            });
            setSuccess(true);
            clearDraft();
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setCoverLetter('');
                setBidAmount('');
                setTimeline('');
                setBoostAmount('0');
            }, 2000);
        } catch (err) {
            console.error('Failed to submit proposal', err);
            setError('Failed to submit proposal. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
                    >
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-white">Submit Proposal</h3>
                                <p className="text-sm text-slate-400 mt-1">For: {jobTitle}</p>
                                {isDraftLoaded && localStorage.getItem('proposal_draft') && (
                                    <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg w-fit">
                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Using Duplicated Details</span>
                                        <button onClick={clearDraft} className="text-[10px] text-slate-500 hover:text-white underline">Clear</button>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {success ? (
                                <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                                    </div>
                                    <h4 className="text-xl font-bold text-white">Proposal Sent!</h4>
                                    <p className="text-slate-400">Your proposal has been submitted successfully.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">Bid Amount ($)</label>
                                            <input
                                                type="number"
                                                required
                                                placeholder="e.g. 500"
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">Estimated Delivery</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. 1 week"
                                                value={timeline}
                                                onChange={(e) => setTimeline(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-medium text-slate-300">Cover Letter</label>
                                            <button
                                                type="button"
                                                onClick={handleMagicDraft}
                                                disabled={aiLoading}
                                                className="text-[10px] font-bold bg-purple-500/10 text-purple-400 px-2 py-1 rounded-lg border border-purple-500/20 hover:bg-purple-500/20 transition-all flex items-center gap-1.5"
                                            >
                                                {aiLoading ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <Sparkles className="w-3 h-3" />
                                                )}
                                                ✨ Magic Draft
                                            </button>
                                        </div>
                                        <textarea
                                            required
                                            rows={6}
                                            placeholder="Explain why you are the best fit for this job..."
                                            value={coverLetter}
                                            onChange={(e) => setCoverLetter(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none text-sm"
                                        />
                                    </div>

                                    {portfolioItems.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-slate-400" />
                                                <label className="text-sm font-bold text-white">Relevant Portfolio Items</label>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {portfolioItems.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedPortfolioIds(prev =>
                                                                prev.includes(item.id)
                                                                    ? prev.filter(id => id !== item.id)
                                                                    : [...prev, item.id]
                                                            );
                                                        }}
                                                        className={`p-3 rounded-xl border text-left transition-all ${selectedPortfolioIds.includes(item.id)
                                                                ? 'bg-blue-500/10 border-blue-500/50'
                                                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                                            }`}
                                                    >
                                                        <div className="text-xs font-bold text-white truncate">{item.title}</div>
                                                        <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">{item.description}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {screeningQuestions.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                                <span className="p-1 bg-blue-500/20 rounded text-[10px]">AI</span>
                                                Screening Questions
                                            </h4>
                                            <div className="space-y-4">
                                                {screeningQuestions.map((q, i) => (
                                                    <div key={i} className="space-y-2">
                                                        <label className="text-xs font-medium text-slate-400">{q}</label>
                                                        <textarea
                                                            required
                                                            rows={2}
                                                            placeholder="Your answer..."
                                                            value={screeningAnswers[q] || ''}
                                                            onChange={(e) => setScreeningAnswers(prev => ({ ...prev, [q]: e.target.value }))}
                                                            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none text-sm"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                                                    <span className="text-xs">🚀</span>
                                                </div>
                                                <label className="text-sm font-semibold text-blue-400">Boost Your Proposal</label>
                                            </div>
                                            <div className="px-2 py-1 bg-blue-500/20 rounded-lg text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                                                Top Placement
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-slate-500">Spend more Connects to rank higher in the client's proposal list. If the client doesn't view your proposal, some connects may be refunded.</p>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Amount"
                                                value={boostAmount}
                                                onChange={(e) => setBoostAmount(e.target.value)}
                                                className="w-24 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm"
                                            />
                                            <span className="text-xs text-slate-400">Additional Connects</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center px-2 py-1 bg-slate-800/50 rounded-lg text-xs">
                                        <span className="text-slate-500">Total Connects to Spend:</span>
                                        <span className="font-bold text-white">{2 + (parseInt(boostAmount) || 0)} Connects</span>
                                    </div>

                                    {error && <p className="text-sm text-red-400">{error}</p>}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Submit Proposal ({2 + (parseInt(boostAmount) || 0)} Connects)
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
