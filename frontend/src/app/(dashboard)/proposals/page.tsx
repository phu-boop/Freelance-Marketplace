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
    Search
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

export default function ProposalsPage() {
    const { userId } = useKeycloak();
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');

    const fetchProposals = async () => {
        if (!userId) return;
        try {
            const response = await api.get(`/proposals?freelancerId=${userId}`);
            const proposalsData = response.data;

            // Fetch job details for each proposal
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
        } catch (error) {
            console.error('Failed to fetch proposals', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProposals();
    }, [userId]);

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Proposals</h1>
                    <p className="text-slate-400">Track and manage your submitted job proposals.</p>
                </div>
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                    {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === f
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {filteredProposals.length === 0 ? (
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
                    {filter === 'ALL' && (
                        <Link
                            href="/marketplace"
                            className="inline-flex px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all mt-4"
                        >
                            Browse Jobs
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredProposals.map((proposal, idx) => (
                        <motion.div
                            key={proposal.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/30 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                            {proposal.job?.title || 'Unknown Job'}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${proposal.status === 'ACCEPTED'
                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                            : proposal.status === 'REJECTED'
                                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                            }`}>
                                            {proposal.status}
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                                        {proposal.coverLetter}
                                    </p>

                                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <DollarSign className="w-4 h-4 text-emerald-500" />
                                            <span className="font-bold text-slate-300">${proposal.bidAmount}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            {new Date(proposal.createdAt).toLocaleDateString()}
                                        </div>
                                        {proposal.job?.status === 'CLOSED' && (
                                            <div className="flex items-center gap-1.5 text-red-400">
                                                <AlertCircle className="w-4 h-4" />
                                                Job Closed
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link
                                        href={`/jobs/${proposal.job_id}`}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                                    >
                                        View Job
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
