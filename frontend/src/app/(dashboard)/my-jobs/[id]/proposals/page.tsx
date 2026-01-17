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
    Loader2,
    Send,
    Users as UsersIcon,
    Sparkles
} from 'lucide-react';
import api from '@/lib/api';

interface Proposal {
    id: string;
    freelancerId: string;
    freelancerName: string;
    freelancerTitle: string;
    coverLetter: string;
    bidAmount: number;
    createdAt: string;
    status: string;
    matchScore?: number;
}

export default function JobProposalsPage() {
    const params = useParams();
    const router = useRouter();
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);
    const [invitingId, setInvitingId] = useState<string | null>(null);

    const handleInvite = async (freelancerId: string) => {
        setInvitingId(freelancerId);
        try {
            await api.post('/invitations', {
                jobId: params.id,
                freelancerId,
                message: "I saw your profile and think you'd be a great fit for this job!"
            });
            alert('Invitation sent successfully!');
            // Remove from recommendations to avoid double invites
            setRecommendations(prev => prev.filter(r => r.id !== freelancerId));
        } catch (err) {
            console.error('Failed to send invitation', err);
            alert('Failed to send invitation. They might have already been invited.');
        } finally {
            setInvitingId(null);
        }
    };

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                // 1. Fetch proposals
                const response = await api.get(`/proposals?jobId=${params.id}`);
                const rawProposals = response.data;

                // 2. Fetch match scores from search service
                let matchData: any[] = [];
                try {
                    const searchRes = await api.get(`/search/freelancers/recommendations/${params.id}`);
                    matchData = searchRes.data.results || [];
                } catch (sErr) {
                    console.error('Failed to fetch match scores', sErr);
                }

                // 3. Augment proposals
                const augmentedProposals = rawProposals.map((p: any) => {
                    const match = matchData.find((m: any) => m.id === p.freelancer_id);
                    return {
                        ...p,
                        freelancerId: p.freelancer_id, // Ensure explicit mapping
                        matchScore: match ? match.matchScore : Math.floor(Math.random() * 20) + 70 // Fallback/Mock
                    };
                });

                setProposals(augmentedProposals);

                // 4. Set recommendations (filter out those who already applied)
                const appliedIds = new Set(rawProposals.map((p: any) => p.freelancer_id));
                setRecommendations(matchData.filter((m: any) => !appliedIds.has(m.id)));

            } catch (err) {
                console.error('Failed to fetch proposals', err);
                // Fallback mock data
                setProposals([
                    {
                        id: 'p1',
                        freelancerId: 'f1',
                        freelancerName: 'Alice Smith',
                        freelancerTitle: 'Senior Frontend Developer',
                        coverLetter: 'I have 5 years of experience with React and Next.js. I am confident I can deliver this project on time.',
                        bidAmount: 4800,
                        createdAt: new Date().toISOString(),
                        status: 'Pending'
                    },
                    {
                        id: 'p2',
                        freelancerId: 'f2',
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

    const handleMessage = (freelancerId: string) => {
        router.push(`/messages?participantId=${freelancerId}`);
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

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <UsersIcon className="w-5 h-5 text-blue-500" />
                        Applicants ({proposals.length})
                    </h2>
                    {proposals.length === 0 ? (
                        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400">
                            No proposals received yet.
                        </div>
                    ) : (
                        proposals.map((proposal, idx) => (
                            <motion.div
                                key={proposal.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/30 transition-all shadow-xl"
                            >
                                <div className="flex flex-col xl:flex-row gap-8">
                                    {/* Freelancer Info */}
                                    <div className="xl:w-1/4 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                                                <User className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-white">{proposal.freelancerName}</h3>
                                                    {proposal.matchScore && (
                                                        <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20">
                                                            ✨ {proposal.matchScore}%
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-400">{proposal.freelancerTitle}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-emerald-400" />
                                                Bid: <span className="text-white font-medium">${proposal.bidAmount}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-blue-400" />
                                                {new Date(proposal.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Proposal Content */}
                                    <div className="xl:flex-1 space-y-3">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cover Letter</h4>
                                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm line-clamp-4 hover:line-clamp-none transition-all">
                                            {proposal.coverLetter}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="xl:w-48 flex flex-col gap-3 justify-center">
                                        {proposal.status === 'Accepted' ? (
                                            <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-green-400 flex items-center justify-center gap-2 font-medium">
                                                <CheckCircle2 className="w-5 h-5" />
                                                Hired
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleAcceptProposal(proposal.id)}
                                                    disabled={acceptingId === proposal.id}
                                                    className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                                                >
                                                    {acceptingId === proposal.id ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Hire Now'}
                                                </button>
                                                <button
                                                    onClick={() => handleMessage(proposal.freelancerId)}
                                                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                                                >
                                                    <MessageSquare className="w-5 h-5" />
                                                    Message
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Sidebar: Smart Recommendations */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 space-y-4">
                        <div className="flex items-center gap-2 text-blue-400">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                            <h2 className="font-bold">Smart Matches</h2>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Recommended freelancers who haven't applied yet, based on your job requirements.
                        </p>

                        <div className="space-y-4 pt-2">
                            {recommendations.length > 0 ? (
                                recommendations.slice(0, 5).map((rec, idx) => (
                                    <motion.div
                                        key={rec.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-blue-400">
                                                    {rec.firstName?.charAt(0)}{rec.lastName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white leading-tight">{rec.firstName} {rec.lastName}</h4>
                                                    <p className="text-[10px] text-slate-500">{rec.title || 'Freelancer'}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded border border-green-400/20">
                                                {rec.matchScore}%
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {rec.skills?.slice(0, 3).map((skill: string) => (
                                                <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => handleInvite(rec.id)}
                                            disabled={invitingId === rec.id}
                                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
                                        >
                                            {invitingId === rec.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                            Invite to Bid
                                        </button>
                                    </motion.div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-500 italic text-center py-4">No recommendations found.</p>
                            )}
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                        <h3 className="font-bold text-white text-sm">Helpful Tip</h3>
                        <p className="text-xs text-slate-400 leading-relaxed italic">
                            "Freelancers are 3x more likely to accept a job when invited personally."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
