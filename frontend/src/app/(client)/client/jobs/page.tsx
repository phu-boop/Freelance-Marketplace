'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    PlusCircle,
    Search,
    Filter,
    Briefcase,
    Clock,
    Users,
    MoreHorizontal,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface Job {
    id: string;
    title: string;
    budget: number;
    status: string;
    createdAt: string;
    proposalCount?: number;
}

export default function ClientJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                // In a real implementation, this would potentially be /jobs/my-jobs or filtered by current user ID
                const res = await api.get('/jobs');
                setJobs(res.data.results || []);
            } catch (error) {
                console.error('Failed to fetch jobs', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const filteredJobs = jobs.filter(job => filter === 'ALL' ? true : job.status === filter);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Jobs</h1>
                    <p className="text-slate-400">Manage your job postings and view proposals.</p>
                </div>
                <Link href="/marketplace/create">
                    <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20">
                        <PlusCircle className="w-5 h-5" />
                        Post New Job
                    </button>
                </Link>
            </div>

            <div className="flex items-center gap-3 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit">
                {['ALL', 'OPEN', 'In Progress', 'Completed'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredJobs.map((job) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                                            {job.title}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${job.status === 'OPEN'
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : 'bg-slate-800 text-slate-400 border-slate-700'
                                            }`}>
                                            {job.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Posted {new Date(job.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-4 h-4" />
                                            ${job.budget} Fixed Price
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            {job.proposalCount || 0} Proposals
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link href={`/client/jobs/${job.id}`}>
                                        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors">
                                            View Details
                                        </button>
                                    </Link>
                                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
                    <Briefcase className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No jobs found</h3>
                    <p className="text-slate-400 mb-6">You haven't posted any jobs in this category yet.</p>
                    <Link href="/marketplace/create">
                        <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all">
                            Post First Job
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}
