'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    User,
    DollarSign,
    Clock,
    CheckCircle2,
    MessageSquare,
    Loader2
} from 'lucide-react';
import api from '@/lib/api';

interface Proposal {
    id: string;
    freelancerName: string;
    freelancerTitle: string;
    coverLetter: string;
    bidAmount: number;
    createdAt: string;
    status: string;
}

export default function JobProposalsPage() {
    const params = useParams();
    const router = useRouter();
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                const response = await api.get(`/proposals?jobId=${params.id}`);
                setProposals(response.data);
            } catch (err) {
                console.error('Failed to fetch proposals', err);
                // Fallback mock data
                setProposals([
                    {
                        id: 'p1',
                        freelancerName: 'Alice Smith',
                        freelancerTitle: 'Senior Frontend Developer',
                        coverLetter: 'I have 5 years of experience with React and Next.js. I am confident I can deliver this project on time.',
                        bidAmount: 4800,
                        createdAt: new Date().toISOString(),
                        status: 'Pending'
                    },
                    {
                        id: 'p2',
                        freelancerName: 'Bob Jones',
                        freelancerTitle: 'Full Stack Engineer',
                        coverLetter: 'I specialize in building scalable web applications. I have worked on similar projects before.',
                        bidAmount: 5200,
                        createdAt: new Date(Date.now() - 3600000).toISOString(),
                        status: 'Pending'
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchProposals();
    }, [params.id]);

    const handleAcceptProposal = async (proposalId: string) => {
        setAcceptingId(proposalId);
        try {
            // Create contract
            await api.post('/contracts', {
                proposal_id: proposalId,
                job_id: params.id,
                terms: 'Standard terms apply.'
            });

            // Update local state
            setProposals(prev => prev.map(p =>
                p.id === proposalId ? { ...p, status: 'Accepted' } : p
            ));

            // Ideally show success message or redirect
            alert('Proposal accepted! Contract created.');
        } catch (err) {
            console.error('Failed to accept proposal', err);
            alert('Failed to accept proposal. Please try again.');
        } finally {
            setAcceptingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white">Review Proposals</h1>
                    <p className="text-slate-400">Select the best candidate for your job.</p>
                </div>
            </div>

            <div className="grid gap-6">
                {proposals.map((proposal, idx) => (
                    <motion.div
                        key={proposal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/30 transition-all"
                    >
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Freelancer Info */}
                            <div className="lg:w-1/4 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                                        <User className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{proposal.freelancerName}</h3>
                                        <p className="text-sm text-slate-400">{proposal.freelancerTitle}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        Bid: <span className="text-white font-medium">${proposal.bidAmount}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {new Date(proposal.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {/* Proposal Content */}
                            <div className="lg:flex-1 space-y-4">
                                <h4 className="font-semibold text-white">Cover Letter</h4>
                                <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                                    {proposal.coverLetter}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="lg:w-48 flex flex-col gap-3 justify-center">
                                {proposal.status === 'Accepted' ? (
                                    <div className="px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 flex items-center justify-center gap-2 font-medium">
                                        <CheckCircle2 className="w-5 h-5" />
                                        Accepted
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleAcceptProposal(proposal.id)}
                                            disabled={acceptingId === proposal.id}
                                            className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                                        >
                                            {acceptingId === proposal.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    Hire Now
                                                </>
                                            )}
                                        </button>
                                        <button className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all">
                                            <MessageSquare className="w-5 h-5" />
                                            Message
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
