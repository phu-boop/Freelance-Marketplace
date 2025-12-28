'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';

interface ProposalModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string;
    jobTitle: string;
}

export function ProposalModal({ isOpen, onClose, jobId, jobTitle }: ProposalModalProps) {
    const { userId } = useKeycloak();
    const [coverLetter, setCoverLetter] = useState('');
    const [bidAmount, setBidAmount] = useState('');
    const [timeline, setTimeline] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDraftLoaded, setIsDraftLoaded] = useState(false);

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
            });
            setSuccess(true);
            clearDraft();
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setCoverLetter('');
                setBidAmount('');
                setTimeline('');
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
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Cover Letter</label>
                                        <textarea
                                            required
                                            rows={6}
                                            placeholder="Explain why you are the best fit for this job..."
                                            value={coverLetter}
                                            onChange={(e) => setCoverLetter(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                                        />
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
                                                Submit Proposal (-2 Connects)
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
