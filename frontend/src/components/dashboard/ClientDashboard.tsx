'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Users,
    CreditCard,
    Layout,
    ArrowUpRight,
    TrendingUp,
    Briefcase
} from 'lucide-react';
import Link from 'next/link';

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
    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white">Client Dashboard</h1>
                    <p className="text-slate-400 mt-1">
                        Welcome back, {user?.firstName || 'Client'}! Ready to find more talent?
                    </p>
                </div>
                <Link href="/marketplace/create" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                    <Plus className="w-4 h-4" /> Post a Job
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group lg:hover:-translate-y-1"
                    >
                        <div className="flex justify-between items-start">
                            <div className={stat.bg + " p-3 rounded-xl"}>
                                <stat.icon className={stat.color + " w-6 h-6"} />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                        </div>
                        <div className="mt-4">
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* My Active Jobs */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">My Active Jobs</h3>
                        <Link href="/jobs/manage" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">View All</Link>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        {myJobs.map((job, idx) => (
                            <div
                                key={job.id}
                                className={"p-5 flex items-center justify-between hover:bg-slate-800/30 transition-all " + (idx !== myJobs.length - 1 ? "border-b border-slate-800" : "")}
                            >
                                <div className="space-y-1">
                                    <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{job.title}</div>
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                        <span>{job.proposals} proposals</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                        <span>{job.date}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={"px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider " + (
                                        job.status === 'Active' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                            job.status === 'Interviewing' ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                                                "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                                    )}>
                                        {job.status}
                                    </span>
                                    <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Find Talent Spotlight */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Talent Spotlight</h3>
                    <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/20 rounded-2xl space-y-6">
                        <div className="p-4 bg-indigo-600/10 rounded-xl border border-indigo-500/20">
                            <h4 className="font-bold text-white text-sm mb-1 uppercase tracking-tighter">Pro Tip</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Hire freelancers with the <span className="text-amber-400 font-bold">Top Rated</span> badge for 2x faster project turnaround.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <Link
                                href="/freelancers"
                                className="block w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-center rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
                            >
                                Hire Top Talent
                            </Link>
                            <Link
                                href="/marketplace/create"
                                className="block w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-center rounded-xl text-sm font-medium transition-all"
                            >
                                Post Another Job
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
