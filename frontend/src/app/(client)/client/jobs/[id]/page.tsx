'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Briefcase,
    MapPin,
    Clock,
    DollarSign,
    Loader2,
    Users,
    ChevronRight,
    ChevronLeft,
    Search,
    Filter,
    ArrowUpRight,
    MessageSquare,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import Link from 'next/link';

interface Job {
    id: string;
    title: string;
    description: string;
    location: string;
    budget: number;
    type: string;
    createdAt: string;
    status: string;
}

interface Proposal {
    id: string;
    freelancer_id: string;
    bidAmount: number;
    coverLetter: string;
    status: string;
    createdAt: string;
    freelancer?: {
        firstName: string;
        lastName: string;
        title?: string;
    }
}

export default function ClientJobDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { userId } = useKeycloak();
    const [job, setJob] = useState<Job | null>(null);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'DETAILS' | 'PROPOSALS'>('PROPOSALS');

    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [jobRes, proposalsRes] = await Promise.all([
                api.get(`/jobs/${id}`),
                api.get(`/proposals?jobId=${id}`)
            ]);

            setJob(jobRes.data);

            // Enhance proposals with freelancer info
            const proposalsWithInfo = await Promise.all(proposalsRes.data.map(async (p: any) => {
                try {
                    const userRes = await api.get(`/users/${p.freelancer_id}`);
                    return { ...p, freelancer: userRes.data };
                } catch (err) {
                    return p;
                }
            }));

            setProposals(proposalsWithInfo);
        } catch (err) {
            console.error('Failed to fetch job details or proposals', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-slate-400 mt-4">Loading management dashboard...</p>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white mb-4">Job Not Found</h2>
                <button onClick={() => router.back()} className="text-indigo-400 hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <button onClick={() => router.back()} className="text-slate-500 hover:text-white flex items-center gap-1 text-sm mb-2 transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Back to Jobs
                    </button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-white">{job.title}</h1>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border tracking-wider uppercase ${job.status === 'OPEN' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                            {job.status}
                        </span>
                    </div>
                </div>

                <div className="flex bg-slate-900 grid grid-cols-2 p-1 rounded-xl border border-slate-800">
                    <button
                        onClick={() => setActiveTab('PROPOSALS')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'PROPOSALS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Proposals ({proposals.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('DETAILS')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'DETAILS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Job Details
                    </button>
                </div>
            </div>

            {activeTab === 'DETAILS' ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                            <h2 className="text-xl font-bold text-white">Description</h2>
                            <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">{job.description}</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                            <h3 className="font-bold text-white">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Budget</span>
                                    <span className="text-white font-bold">${job.budget}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Type</span>
                                    <span className="text-white font-bold">{job.type}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Created</span>
                                    <span className="text-white font-bold">{new Date(job.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {proposals.length === 0 ? (
                        <div className="p-20 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                            <Users className="w-12 h-12 text-slate-700 mx-auto" />
                            <h3 className="text-xl font-bold text-white">No proposals yet</h3>
                            <p className="text-slate-500">Wait for freelancers to find your job or invite some talent!</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {proposals.map((proposal, idx) => (
                                <motion.div
                                    key={proposal.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group lg:flex items-center justify-between gap-6"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                                            {proposal.freelancer?.firstName?.[0] || 'U'}
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-white font-bold group-hover:text-indigo-400 transition-colors">
                                                {proposal.freelancer?.firstName} {proposal.freelancer?.lastName}
                                            </h4>
                                            <p className="text-xs text-slate-500 line-clamp-1">{proposal.freelancer?.title || 'Freelancer'}</p>
                                        </div>
                                    </div>

                                    <div className="hidden lg:flex items-center gap-12 text-center">
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Bid Amount</p>
                                            <p className="text-white font-bold">${proposal.bidAmount}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Status</p>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${proposal.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                                                }`}>
                                                {proposal.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 lg:mt-0 flex items-center gap-3">
                                        <Link
                                            href={`/client/jobs/${job.id}/proposals/${proposal.id}`}
                                            className="px-4 py-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                                        >
                                            Review Proposal
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
