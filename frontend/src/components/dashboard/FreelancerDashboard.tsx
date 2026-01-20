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
    Bell,
    CheckCircle2,
    MessageSquare,
    Zap,
    Plus
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

import api from '@/lib/api';

import { OfferDetails } from './OfferDetails';
import { ProfileCompleteness } from '../ProfileCompleteness';
import { ActivityStream } from './ActivityStream';
import { DashboardSkeleton } from './DashboardSkeleton';
import ReferralWidget from '../ReferralWidget';

export function FreelancerDashboard({ user }: { user: any }) {
    const [proposals, setProposals] = React.useState<any[]>([]);
    const [notifications, setNotifications] = React.useState<any[]>([]);
    const [selectedOffer, setSelectedOffer] = React.useState<any | null>(null);
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

    if (loading) return <DashboardSkeleton />;

    // Transform notifications to activity stream
    const activities = notifications.slice(0, 5).map(n => ({
        id: n.id,
        type: (n.type === 'MESSAGE' ? 'MESSAGE' : n.type === 'PAYMENT' ? 'PAYMENT' : n.type === 'PROPOSAL' ? 'PROPOSAL' : 'JOB') as any,
        title: n.title,
        description: n.message,
        timestamp: n.createdAt,
        status: (n.isRead ? 'SUCCESS' : 'PENDING') as 'SUCCESS' | 'PENDING' | 'ALERT'
    }));

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

    const handleNotificationClick = async (notif: any) => {
        try {
            if (notif.metadata?.proposalId) {
                const res = await api.get(`/proposals/${notif.metadata.proposalId}`);
                setSelectedOffer(res.data);
            }
        } catch (error) {
            console.error('Failed to load offer details', error);
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
        <div className="space-y-8 pb-12">
            {/* Project/Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <span className="text-blue-500 bg-blue-500/10 p-2 rounded-xl">
                            <Zap className="w-8 h-8" />
                        </span>
                        Workspace
                    </h1>
                    <p className="text-slate-400 font-medium">
                        Welcome back, <span className="text-white">{user?.firstName || 'Freelancer'}</span>. You have <span className="text-blue-400">{proposals.filter(p => p.status === 'PENDING').length} active proposals</span>.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/profile" className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
                        Edit Profile
                    </Link>
                    <Link href="/marketplace" className="px-5 py-2.5 bg-blue-600 shadow-xl shadow-blue-500/20 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition-all flex items-center gap-2">
                        Browse Marketplace <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none mb-1">Status</span>
                                <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest">Live</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl font-black text-white tracking-tight">{stat.value}</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Side: Main Column */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Activity Stream */}
                    <ActivityStream activities={activities} />

                    {/* Active Contracts & Health Analysis */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-emerald-400" />
                                    Active Contracts
                                </h2>
                                <p className="text-xs text-slate-500 font-medium">AI-monitored project health status.</p>
                            </div>
                            <Link href="/my-jobs" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white transition-all">
                                View All
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-800/50">
                            {[
                                { id: 'c1', title: 'E-commerce React Frontend', client: 'Acme Corp', health: 'GOOD', healthReason: 'On track with milestones', lastUpdate: '2h ago' },
                                { id: 'c2', title: 'Python Data Scraper', client: 'DataInc', health: 'AT_RISK', healthReason: 'Deadline approaching, no commits in 3 days', lastUpdate: '4d ago' }
                            ].map((contract) => (
                                <div key={contract.id} className="p-6 hover:bg-slate-800/20 transition-all flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-white text-base">{contract.title}</h3>
                                        <p className="text-xs text-slate-500 mt-1">{contract.client} • Last active {contract.lastUpdate}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${contract.health === 'GOOD'
                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${contract.health === 'GOOD' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                            {contract.health === 'GOOD' ? 'On Track' : 'At Risk'}
                                        </div>
                                        {contract.health === 'AT_RISK' && (
                                            <div className="hidden md:block text-[10px] font-medium text-amber-500/80 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                                                AI Insight: {contract.healthReason}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Proposals Section */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-400" />
                                    Active Proposals
                                </h2>
                                <p className="text-xs text-slate-500 font-medium">Manage and track your ongoing applications.</p>
                            </div>
                            <Link href="/proposals" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white transition-all">
                                View Full History
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-800/50">
                            {proposals.length === 0 ? (
                                <div className="p-16 text-center space-y-4">
                                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto">
                                        <FileText className="w-8 h-8 text-slate-600" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No active proposals at the moment.</p>
                                </div>
                            ) : (
                                proposals.map((proposal) => (
                                    <div key={proposal.id} className="p-8 hover:bg-slate-800/20 transition-all group">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{proposal.job?.title || 'Job Application'}</h3>
                                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${proposal.status === 'HIRED' || proposal.status === 'OFFERED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                        proposal.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                            'bg-slate-800 text-slate-400 border-slate-700'
                                                        }`}>
                                                        {proposal.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-green-500" /> ${proposal.bidAmount}</span>
                                                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {proposal.timeline}</span>
                                                    <span className="text-slate-600">• {new Date(proposal.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            {(proposal.status === 'PENDING' || proposal.status === 'OFFERED') && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleWithdraw(proposal.id)}
                                                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                                                    >
                                                        Withdraw
                                                    </button>
                                                    <button
                                                        onClick={() => handleDuplicate(proposal.id)}
                                                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 transition-all"
                                                    >
                                                        Copy
                                                    </button>
                                                    {proposal.status === 'OFFERED' && (
                                                        <button
                                                            onClick={() => setSelectedOffer(proposal)}
                                                            className="px-6 py-2 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/20 transition-all"
                                                        >
                                                            View Offer
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Sidebar */}
                <div className="space-y-8">
                    {/* Premium Upgrade */}
                    <div className="relative group overflow-hidden p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                        <div className="relative z-10 space-y-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Zap className="w-6 h-6 fill-white" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black tracking-tight">Level Up Your Career</h3>
                                <p className="text-sm text-blue-100 font-medium leading-relaxed">
                                    Get 80 Connects per month, see competitor bid ranges, and get a profile badge.
                                </p>
                            </div>
                            <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all transform active:scale-95 shadow-xl">
                                Upgrade to Plus
                            </button>
                        </div>
                    </div>

                    <ProfileCompleteness user={user} />

                    <ReferralWidget />

                    <div className="p-8 rounded-[2rem] bg-slate-900 border border-slate-800 space-y-6">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Quick Tips</h4>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                    <Star className="w-4 h-4 text-green-500" />
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">Keep your JSS above 90% to qualify for Top Rated status.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <MessageSquare className="w-4 h-4 text-blue-500" />
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">Average response time under 24h increases hire rates by 34%.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {selectedOffer && (
                <OfferDetails
                    offer={selectedOffer}
                    onClose={() => setSelectedOffer(null)}
                    onUpdate={() => {
                        setLoading(true);
                        // fetchData will be re-run by useEffect if we handle state better, 
                        // but here we can just window.location.reload() or re-fetch
                        api.get('/proposals/my').then(p => {
                            setProposals(p.data);
                            setLoading(false);
                        });
                    }}
                />
            )}
        </div>
    );
}
