'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import {
    Loader2,
    Calendar,
    DollarSign,
    Clock,
    CheckCircle2,
    XCircle,
    MessageSquare,
    ChevronLeft,
    AlertTriangle,
    FileText
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ProposalDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [proposal, setProposal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [counterOffer, setCounterOffer] = useState(false);
    const [counterAmount, setCounterAmount] = useState('');
    const [counterTimeline, setCounterTimeline] = useState('');

    useEffect(() => {
        const fetchProposal = async () => {
            try {
                const res = await api.get(`/proposals/${params.id}`);
                setProposal(res.data);
                // Initialize counter values
                setCounterAmount(res.data.bidAmount);
                setCounterTimeline(res.data.timeline);
            } catch (error) {
                console.error('Failed to fetch proposal', error);
                toast.error('Failed to load proposal details');
            } finally {
                setLoading(false);
            }
        };
        fetchProposal();
    }, [params.id]);

    const handleAccept = async () => {
        if (!confirm('Are you sure you want to accept this offer?')) return;
        setProcessing(true);
        try {
            await api.post(`/proposals/${params.id}/offer/accept`);
            toast.success('Offer accepted! Redirecting to contract...');
            router.push('/contracts');
        } catch (error: any) {
            console.error('Failed to accept offer', error);
            toast.error(error.response?.data?.message || 'Failed to accept offer');
        } finally {
            setProcessing(false);
        }
    };

    const handleDecline = async () => {
        if (!confirm('Are you sure you want to decline this offer?')) return;
        setProcessing(true);
        try {
            await api.post(`/proposals/${params.id}/offer/decline`);
            toast.success('Offer declined');
            router.refresh(); // Or reload proposal
            setProposal({ ...proposal, status: 'REJECTED' });
        } catch (error: any) {
            console.error('Failed to decline offer', error);
            toast.error(error.response?.data?.message || 'Failed to decline offer');
        } finally {
            setProcessing(false);
        }
    };

    const handleCounter = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await api.post(`/proposals/${params.id}/offer/counter`, {
                amount: parseFloat(counterAmount),
                timeline: counterTimeline
            });
            toast.success('Counter offer sent!');
            setCounterOffer(false);
            setProposal({ ...proposal, status: 'NEGOTIATION', bidAmount: parseFloat(counterAmount), timeline: counterTimeline });
        } catch (error: any) {
            console.error('Failed to send counter offer', error);
            toast.error(error.response?.data?.message || 'Failed to send counter offer');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!proposal) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-400">Proposal not found</p>
                <Link href="/proposals" className="text-blue-500 hover:underline mt-4 inline-block">
                    Back to Proposals
                </Link>
            </div>
        );
    }

    const isOffered = proposal.status === 'OFFERED';
    const isPending = proposal.status === 'PENDING';

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link href="/proposals" className="flex items-center text-slate-400 hover:text-white transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Proposals
            </Link>

            {isOffered && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6" // Use 500/20 for better visibility
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-emerald-500/20 rounded-full">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">You recieved a Job Offer!</h2>
                            <p className="text-slate-300 mt-1">
                                The client has reviewed your proposal and wants to hire you.
                                Please review the terms below.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-800">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">{proposal.job?.title}</h1>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <span className="bg-slate-800 px-2 py-1 rounded text-xs uppercase tracking-wider">
                                    {proposal.job?.type?.replace('_', ' ')}
                                </span>
                                <span>Posted {new Date(proposal.job?.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isOffered
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                            {proposal.status}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">
                    {/* Terms */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-4 bg-slate-800/50 rounded-xl space-y-1">
                            <label className="text-slate-500 text-sm font-medium">Offered Rate</label>
                            <div className="flex items-center text-3xl font-bold text-white">
                                <DollarSign className="w-5 h-5 text-emerald-500 mr-1" />
                                {proposal.bidAmount}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-xl space-y-1">
                            <label className="text-slate-500 text-sm font-medium">Timeline</label>
                            <div className="flex items-center text-3xl font-bold text-white">
                                <Clock className="w-6 h-6 text-blue-500 mr-2" />
                                {proposal.timeline}
                            </div>
                        </div>
                    </div>

                    {/* Proposal Details */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-3">Your Cover Letter</h3>
                        <div className="p-4 bg-slate-800/30 rounded-xl text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {proposal.coverLetter}
                        </div>
                    </div>

                    {/* Actions */}
                    {isOffered && (
                        <div className="flex flex-col gap-4 border-t border-slate-800 pt-6">
                            <h3 className="text-lg font-bold text-white">Response Actions</h3>

                            {!counterOffer ? (
                                <div className="flex flex-wrap gap-4">
                                    <button
                                        onClick={handleAccept}
                                        disabled={processing}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                                    >
                                        {processing ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                        Accept Offer
                                    </button>
                                    <button
                                        onClick={() => setCounterOffer(true)}
                                        disabled={processing}
                                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        Make Counter Offer
                                    </button>
                                    <button
                                        onClick={handleDecline}
                                        disabled={processing}
                                        className="flex-1 bg-slate-800 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 text-slate-300 border border-slate-700 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Decline Offer
                                    </button>
                                </div>
                            ) : (
                                <motion.form
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-slate-800/50 p-6 rounded-xl space-y-4"
                                    onSubmit={handleCounter}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-white">Counter Offer Terms</h4>
                                        <button
                                            type="button"
                                            onClick={() => setCounterOffer(false)}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">New Amount ($)</label>
                                            <input
                                                type="number"
                                                value={counterAmount}
                                                onChange={(e) => setCounterAmount(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">New Timeline</label>
                                            <input
                                                type="text"
                                                value={counterTimeline}
                                                onChange={(e) => setCounterTimeline(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setCounterOffer(false)}
                                            className="px-4 py-2 text-slate-400 hover:text-white"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold"
                                        >
                                            {processing ? 'Sending...' : 'Send Counter Offer'}
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
