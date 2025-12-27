'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Briefcase,
    Clock,
    DollarSign,
    Star,
    ArrowUpRight,
    TrendingUp,
    FileText,
    Bell
} from 'lucide-react';
import Link from 'next/link';


import api from '@/lib/api';

export function FreelancerDashboard({ user }: { user: any }) {
    const [proposals, setProposals] = React.useState<any[]>([]);
    const [notifications, setNotifications] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    const stats = [
        { label: 'Available Connects', value: user?.availableConnects ?? 0, icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'Active Contracts', value: '12', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Total Earnings', value: '$4,250', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: 'Avg. Rating', value: '4.9', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    ];

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [proposalsRes, notificationsRes] = await Promise.all([
                    api.get('/proposals/my'),
                    api.get('/notifications?userId=' + user?.id)
                ]);
                setProposals(proposalsRes.data);
                setNotifications(notificationsRes.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchData();
    }, [user?.id]);

    const handleWithdraw = async (proposalId: string) => {
        if (!confirm('Are you sure you want to withdraw this proposal?')) return;

        try {
            await api.post(`/proposals/${proposalId}/withdraw`);
            // Refresh list or update local state
            setProposals(prev => prev.map(p =>
                p.id === proposalId ? { ...p, status: 'WITHDRAWN' } : p
            ));
        } catch (error) {
            console.error('Failed to withdraw proposal:', error);
            alert('Failed to withdraw proposal. Please try again.');
        }
    };

    const handleDuplicate = async (proposalId: string) => {
        try {
            const response = await api.post(`/proposals/${proposalId}/duplicate`);
            const cloneData = response.data;

            // Store in localStorage as a draft
            localStorage.setItem('proposal_draft', JSON.stringify({
                ...cloneData,
                sourceId: proposalId,
                timestamp: Date.now()
            }));

            alert('Proposal duplicated! Choose a new job to apply using these details.');
            window.location.href = '/jobs';
        } catch (error) {
            console.error('Failed to duplicate proposal:', error);
            alert('Failed to duplicate proposal.');
        }
    };

    const formatDistance = (date: string) => {
        const now = new Date();
        const past = new Date(date);
        const diffInMs = now.getTime() - past.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${Math.floor(diffInHours / 24)}d ago`;
    };
    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white">Freelancer Dashboard</h1>
                    <p className="text-slate-400 mt-1">
                        Welcome back, {user?.firstName || 'Freelancer'}! Here's what's happening with your projects.
                    </p>
                </div>
                <Link href="/marketplace" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2">
                    Browse Jobs <ArrowUpRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group"
                    >
                        <div className="flex justify-between items-start">
                            <div className={stat.bg + " p-3 rounded-xl"}>
                                <stat.icon className={stat.color + " w-6 h-6"} />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="mt-4">
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold text-white">Recent Proposals</h3>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        {loading ? (
                            <div className="p-12 flex justify-center items-center">
                                <Clock className="w-8 h-8 text-blue-500 animate-spin" />
                            </div>
                        ) : proposals.length === 0 ? (
                            <div className="p-12 text-center space-y-3">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                                    <FileText className="w-8 h-8 text-slate-600" />
                                </div>
                                <p className="text-slate-400">No proposals submitted yet.</p>
                                <Link href="/jobs" className="text-blue-400 hover:underline text-sm font-medium">Browse Jobs</Link>
                            </div>
                        ) : (
                            proposals.slice(0, 5).map((proposal, idx) => (
                                <div
                                    key={proposal.id}
                                    className={"p-5 flex items-center justify-between hover:bg-slate-800/40 transition-all " + (idx !== proposals.length - 1 ? "border-b border-slate-800" : "")}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
                                            <FileText className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white group-hover:text-blue-400 transition-colors">
                                                {proposal.job?.title || 'Untitled Job'}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {formatDistance(proposal.createdAt)}
                                                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                                ${proposal.bidAmount}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={"px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border " + (
                                            proposal.status === 'HIRED' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                proposal.status === 'PENDING' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                    proposal.status === 'REJECTED' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                        )}>
                                            {proposal.status}
                                        </span>
                                        {(proposal.status === 'PENDING' || proposal.status === 'SHORTLISTED') && (
                                            <button
                                                onClick={() => handleWithdraw(proposal.id)}
                                                className="text-[10px] text-slate-500 hover:text-red-400 transition-colors underline underline-offset-4"
                                            >
                                                Withdraw
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDuplicate(proposal.id)}
                                            className="text-[10px] text-slate-500 hover:text-blue-400 transition-colors underline underline-offset-4"
                                        >
                                            Duplicate
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Profile Strength */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Profile Strength</h3>
                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Completeness</span>
                                <span className="text-blue-400 font-medium">{user?.completionPercentage || 0}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-500"
                                    style={{ width: `${user?.completionPercentage || 0}%` }}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">Complete your profile to increase your chances of getting hired by 40%.</p>
                        <Link
                            href="/settings/profile"
                            className="block w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-center rounded-lg text-sm font-medium transition-all"
                        >
                            Complete Profile
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
