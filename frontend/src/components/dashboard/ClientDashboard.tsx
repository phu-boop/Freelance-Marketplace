'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Users,
    CreditCard,
    Layout,
    TrendingUp,
    Briefcase,
    Zap,
    MapPin,
    Clock,
    DollarSign,
    Star
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { ActivityStream } from './ActivityStream';
import { DashboardSkeleton } from './DashboardSkeleton';

const stats = [
    { label: 'Active Jobs', value: '4', icon: Layout, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Total Spent', value: '$8,400', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Talent Hired', value: '7', icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Active Contracts', value: '3', icon: Briefcase, color: 'text-pink-500', bg: 'bg-pink-500/10' },
];

const myJobs = [
    { id: 1, title: 'Senior React Developer', proposals: 12, status: 'Active', date: 'Posted 2h ago' },
    { id: 2, title: 'Logo Design for Fintech', proposals: 8, status: 'Interviewing', date: 'Posted 1d ago' },
    { id: 3, title: 'Cloud Migration Expert', proposals: 3, status: 'Draft', date: 'Saved 3d ago' },
];

export function ClientDashboard({ user }: { user: any }) {
    const [jobs, setJobs] = React.useState<any[]>([]);
    const [notifications, setNotifications] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    const stats = [
        { label: 'Active Jobs', value: jobs.filter(j => j.status === 'OPEN').length.toString(), icon: Layout, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { label: 'Total Spent', value: '$8,400', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Talent Hired', value: '7', icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Active Contracts', value: '3', icon: Briefcase, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    ];

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobsRes, notificationsRes] = await Promise.all([
                    api.get('/jobs/my-jobs'),
                    api.get('/notifications?userId=' + user?.id)
                ]);
                setJobs(jobsRes.data);
                setNotifications(notificationsRes.data);
            } catch (error) {
                console.error('Failed to fetch client dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchData();
    }, [user?.id]);

    if (loading) return <DashboardSkeleton />;

    const activities = notifications.slice(0, 5).map(n => ({
        id: n.id,
        type: (n.type === 'MESSAGE' ? 'MESSAGE' : n.type === 'PAYMENT' ? 'PAYMENT' : n.type === 'PROPOSAL' ? 'PROPOSAL' : 'JOB') as any,
        title: n.title,
        description: n.message,
        timestamp: n.createdAt,
        status: (n.isRead ? 'SUCCESS' : 'PENDING') as any
    }));

    return (
        <div className="space-y-8 pb-12">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <span className="text-indigo-500 bg-indigo-500/10 p-2 rounded-xl">
                            <Zap className="w-8 h-8" />
                        </span>
                        Talent Hub
                    </h1>
                    <p className="text-slate-400 font-medium">
                        Welcome back, <span className="text-white">{user?.firstName || 'Client'}</span>! You have <span className="text-indigo-400">{jobs.filter(j => j.status === 'OPEN').length} active listings</span>.
                    </p>
                </div>
                <Link href="/marketplace/create" className="px-6 py-3 bg-indigo-600 shadow-xl shadow-indigo-500/20 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Post a Job
                </Link>
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
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none mb-1">Health</span>
                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest">Good</span>
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
                {/* Main Content Column */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Activity Stream */}
                    <ActivityStream activities={activities} />

                    {/* Active Jobs Section */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-indigo-400" />
                                    Active Postings
                                </h2>
                                <p className="text-xs text-slate-500 font-medium">Manage your open roles and incoming proposals.</p>
                            </div>
                            <Link href="/jobs" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white transition-all">
                                View Marketplace
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-800/50">
                            {jobs.length === 0 ? (
                                <div className="p-16 text-center space-y-4">
                                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto">
                                        <Layout className="w-8 h-8 text-slate-600" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No open postings yet.</p>
                                    <Link href="/marketplace/create" className="text-indigo-400 text-sm font-bold hover:underline">Post your first job</Link>
                                </div>
                            ) : (
                                jobs.map((job) => (
                                    <div key={job.id} className="p-8 hover:bg-slate-800/20 transition-all group">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-white text-lg group-hover:text-indigo-400 transition-colors">{job.title}</h3>
                                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/10 text-emerald-400`}>
                                                        {job.status}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {job._count?.proposals || 0} Proposals</span>
                                                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                                                    {job.budget && <span className="flex items-center gap-1.5 text-slate-400"><DollarSign className="w-3.5 h-3.5" /> ${job.budget}</span>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={`/my-jobs/${job.id}/proposals`}
                                                    className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 transition-all"
                                                >
                                                    Review Proposals
                                                </Link>
                                                <button className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 rounded-xl transition-all">
                                                    <Layout className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Insights Card */}
                    <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 space-y-6">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Market Data</h4>
                            <TrendingUp className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                                <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Average Rate</p>
                                <p className="text-xl font-black text-white">$65/hr</p>
                                <p className="text-[10px] text-slate-500 mt-1">For your active categories</p>
                            </div>
                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                <p className="text-[10px] font-bold text-emerald-400 uppercase mb-1">Talent Score</p>
                                <p className="text-xl font-black text-white">92/100</p>
                                <p className="text-[10px] text-slate-500 mt-1">Based on hired freelancer reviews</p>
                            </div>
                        </div>
                    </div>

                    {/* Spotlight Link */}
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-2xl space-y-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Star className="w-6 h-6 fill-white" />
                        </div>
                        <h3 className="text-xl font-black tracking-tight leading-6">Hire Verified Talent</h3>
                        <p className="text-sm text-indigo-100 font-medium">Verify your payment method to unlock access to Top Rated Plus talent.</p>
                        <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl">
                            Verify Now
                        </button>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Expert Tips</h4>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">Invite at least 3 freelancers to your job for better hire rates.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <MapPin className="w-4 h-4 text-blue-500" />
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">Region-specific jobs get 40% more localized expertise.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
