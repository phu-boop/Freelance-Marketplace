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

import { OfferDetails } from './OfferDetails';

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

            <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {stats.map((stat, i) => (
                                <div key={i} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                            <stat.icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                                    <div className="text-xs text-slate-400 font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Active Proposals */}
                        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                    Active Proposals
                                </h2>
                                <Link href="/proposals" className="text-sm text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1">
                                    View All <ArrowUpRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="divide-y divide-slate-800">
                                {proposals.length === 0 ? (
                                    <p className="text-slate-400 text-center py-8">No active proposals found.</p>
                                ) : (
                                    proposals.map((proposal) => (
                                        <div key={proposal.id} className="p-6 hover:bg-slate-800/50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-white text-lg">{proposal.job?.title || 'Unknown Job'}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                                ${proposal.status === 'HIRED' || proposal.status === 'OFFERED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                        proposal.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                            'bg-slate-700 text-slate-300'}`}>
                                                    {proposal.status}
                                                </span>
                                            </div>
                                            <div className="flex gap-6 text-sm text-slate-400 mb-4">
                                                <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> ${proposal.bidAmount}</span>
                                                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {proposal.timeline}</span>
                                            </div>
                                            {(proposal.status === 'PENDING' || proposal.status === 'OFFERED') && (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleWithdraw(proposal.id)}
                                                        className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border border-slate-700"
                                                    >
                                                        Withdraw Proposal
                                                    </button>
                                                    <button
                                                        onClick={() => handleDuplicate(proposal.id)}
                                                        className="px-4 py-2 rounded-lg text-sm font-medium text-blue-400 hover:bg-blue-500/10 transition-colors border border-blue-500/30"
                                                    >
                                                        Copy to New Proposal
                                                    </button>
                                                    {proposal.status === 'OFFERED' && (
                                                        <button
                                                            onClick={() => setSelectedOffer(proposal)}
                                                            className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-green-600 hover:bg-green-500 transition-colors shadow-lg shadow-green-600/20"
                                                        >
                                                            View Offer
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notifications & Recommended Jobs Sidebar */}
                    <div className="space-y-8">
                        {/* Notifications Panel */}
                        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-yellow-500" />
                                    Notifications
                                </h2>
                                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">{notifications.length}</span>
                            </div>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <p className="text-slate-400 text-center py-4">No new notifications</p>
                                ) : (
                                    notifications.map((notif: any) => (
                                        <div
                                            key={notif.id}
                                            onClick={() => handleNotificationClick(notif)}
                                            className="p-4 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 group-hover:bg-blue-400" />
                                                <div>
                                                    <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{notif.title}</h4>
                                                    <p className="text-xs text-slate-400 mt-1">{notif.message}</p>
                                                    <span className="text-[10px] text-slate-500 mt-2 block">
                                                        {formatDistance(notif.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                            <h3 className="text-lg font-bold mb-2">Upgrade to Plus</h3>
                            <p className="text-blue-100 text-sm mb-4">Get 80 connects per month and see competitor bids.</p>
                            <button className="w-full py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                                Upgrade Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <OfferDetails
                offer={selectedOffer}
                onClose={() => setSelectedOffer(null)}
                onUpdate={() => {
                    // Refetch data
                    const fetchUserData = async () => {
                        try {
                            const [proposalsRes, notificationsRes] = await Promise.all([
                                api.get('/proposals/my'),
                                api.get('/notifications?userId=' + user?.id)
                            ]);
                            setProposals(proposalsRes.data);
                            setNotifications(notificationsRes.data);
                        } catch (error) {
                            console.error('Failed to refresh data', error);
                        }
                    };
                    fetchUserData();
                }}
            />
        </div>
    );
}
