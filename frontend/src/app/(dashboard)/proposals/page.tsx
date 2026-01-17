'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Clock,
    DollarSign,
    Loader2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronRight,
    Search,
    Info
} from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import Link from 'next/link';

interface Proposal {
    id: string;
    job_id: string;
    freelancer_id: string;
    coverLetter: string;
    bidAmount: number;
    status: string;
    createdAt: string;
    job?: {
        title: string;
        status: string;
    };
}

interface Invitation {
    id: string;
    jobId: string;
    message?: string;
    status: string;
    createdAt: string;
    job: {
        title: string;
        budget: number;
    };
}

export default function ProposalsPage() {
    const { userId } = useKeycloak();
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'PROPOSALS' | 'INVITATIONS'>('PROPOSALS');
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');

    const fetchData = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const [proposalsRes, invitationsRes] = await Promise.all([
                api.get(`/proposals?freelancerId=${userId}`),
                api.get('/invitations/freelancer')
            ]);

            const proposalsData = proposalsRes.data;
            const enhancedProposals = await Promise.all(
                proposalsData.map(async (p: Proposal) => {
                    try {
                        const jobRes = await api.get(`/jobs/${p.job_id}`);
                        return { ...p, job: jobRes.data };
                    } catch (err) {
                        return p;
                    }
                })
            );

            setProposals(enhancedProposals);
            setInvitations(invitationsRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userId]);

    const handleInviteAction = async (id: string, status: 'ACCEPTED' | 'DECLINED') => {
        try {
            await api.post(`/invitations/${id}/respond`, { status });
            fetchData();
        } catch (error) {
            console.error("Failed to respond to invitation", error);
        }
    };

    const filteredProposals = proposals.filter(p =>
        filter === 'ALL' ? true : p.status === filter
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Opportunities</h1>
                    <p className="text-slate-400">Manage your proposals and job invitations.</p>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
                        <button
                            onClick={() => setActiveTab('PROPOSALS')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'PROPOSALS'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Proposals ({proposals.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('INVITATIONS')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all relative ${activeTab === 'INVITATIONS'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Invitations ({invitations.length})
                            {invitations.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950" />}
                        </button>
                    </div>

                    {activeTab === 'PROPOSALS' && (
                        <div className="flex bg-slate-900/30 p-1 rounded-xl border border-slate-800 self-end">
                            {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f
                                        ? 'bg-slate-700 text-white'
                                        : 'text-slate-500 hover:text-white'
                                        }`}
                                >
                                    {f.charAt(0) + f.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {activeTab === 'PROPOSALS' ? (
                // Proposals View
                filteredProposals.length === 0 ? (
                    <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                        <FileText className="w-12 h-12 text-slate-700 mx-auto" />
                        <div className="space-y-1">
                            <p className="text-white font-bold">No proposals found</p>
                            <p className="text-slate-500 text-sm">
                                {filter === 'ALL'
                                    ? "You haven't submitted any proposals yet."
                                    : `You don't have any ${filter.toLowerCase()} proposals.`}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredProposals.map((proposal, idx) => (
                            <motion.div
                                key={proposal.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 transition-all group"
                            >
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                                {proposal.job?.title || 'Unknown Job'}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold border tracking-wider ${proposal.status === 'ACCEPTED' || proposal.status === 'HIRED'
                                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                : proposal.status === 'REJECTED'
                                                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                }`}>
                                                {proposal.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{proposal.coverLetter}</p>
                                        <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 rounded-lg">
                                                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                                <span className="text-slate-300">${proposal.bidAmount}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 rounded-lg">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(proposal.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Link
                                            href={`/proposals/${proposal.id}`}
                                            className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )
            ) : (
                // Invitations View
                invitations.length === 0 ? (
                    <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-16 h-16 bg-blue-500/10 flex items-center justify-center rounded-full mx-auto"
                        >
                            <Info className="w-8 h-8 text-blue-500" />
                        </motion.div>
                        <div className="space-y-1">
                            <p className="text-white font-bold">No active invitations</p>
                            <p className="text-slate-500 text-sm">When clients invite you to their jobs, they will appear here.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {invitations.map((invitation, idx) => (
                            <motion.div
                                key={invitation.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <FileText className="w-24 h-24" />
                                </div>
                                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <div className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] mb-1">New Invitation</div>
                                            <h3 className="text-xl font-bold text-white">{invitation.job.title}</h3>
                                        </div>
                                        {invitation.message && (
                                            <div className="p-4 bg-slate-800/50 rounded-xl italic text-slate-300 text-sm border-l-4 border-blue-500">
                                                "{invitation.message}"
                                            </div>
                                        )}
                                        <div className="flex gap-4 text-xs font-bold">
                                            <span className="text-emerald-500 flex items-center gap-1">
                                                <DollarSign className="w-4 h-4" />
                                                Budget: ${invitation.job.budget}
                                            </span>
                                            <span className="text-slate-500 flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {new Date(invitation.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-row md:flex-col gap-3 justify-center">
                                        <button
                                            onClick={() => handleInviteAction(invitation.id, 'DECLINED')}
                                            className="px-6 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 text-white font-bold transition-all text-sm"
                                        >
                                            Decline
                                        </button>
                                        <Link
                                            href={`/jobs/${invitation.jobId}?invited=${invitation.id}`}
                                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all text-sm text-center shadow-lg shadow-blue-600/20"
                                        >
                                            Apply Now
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
