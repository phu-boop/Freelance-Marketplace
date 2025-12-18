'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Filter,
    ExternalLink,
    Briefcase,
    Loader2
} from 'lucide-react';
import api from '@/lib/api';

interface Job {
    id: string;
    title: string;
    description: string;
    budget: number;
    status: string;
    createdAt: string;
    client_id: string;
    category?: { name: string };
    skills: { skill: { name: string } }[];
}

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [filter, setFilter] = useState('PENDING_APPROVAL');

    const fetchJobs = async () => {
        try {
            const res = await api.get('/jobs');
            setJobs(res.data);
        } catch (error) {
            console.error('Failed to fetch jobs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            await api.post(`/admins/jobs/${id}/approve`);
            await fetchJobs();
        } catch (error) {
            console.error('Failed to approve job', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: string) => {
        setActionLoading(id);
        try {
            await api.post(`/admins/jobs/${id}/reject`);
            await fetchJobs();
        } catch (error) {
            console.error('Failed to reject job', error);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredJobs = jobs.filter(job =>
        filter === 'ALL' ? true : job.status === filter
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-white">Job Approval Queue</h1>
                    <p className="text-slate-400">Review and moderate new job postings.</p>
                </div>

                <div className="flex items-center gap-3 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    {['PENDING_APPROVAL', 'OPEN', 'REJECTED', 'ALL'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                    ? 'bg-red-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                </div>
            ) : filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {filteredJobs.map((job) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{job.title}</h3>
                                            <p className="text-sm text-slate-500">Posted {new Date(job.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <p className="text-slate-400 line-clamp-2">{job.description}</p>

                                    <div className="flex flex-wrap gap-2">
                                        {job.category && (
                                            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                                                {job.category.name}
                                            </span>
                                        )}
                                        {job.skills && job.skills.map((s, idx) => (
                                            <span key={idx} className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                                                {s.skill.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-3">
                                    <div className="text-right mr-4 hidden lg:block">
                                        <p className="text-sm text-slate-500">Budget</p>
                                        <p className="text-xl font-bold text-white">${job.budget}</p>
                                    </div>

                                    {job.status === 'PENDING_APPROVAL' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(job.id)}
                                                disabled={actionLoading === job.id}
                                                className="w-full sm:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-green-600/50 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                                            >
                                                {actionLoading === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(job.id)}
                                                disabled={actionLoading === job.id}
                                                className="w-full sm:w-auto px-6 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                                            >
                                                {actionLoading === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                                Reject
                                            </button>
                                        </>
                                    )}

                                    {job.status === 'OPEN' && (
                                        <span className="px-4 py-2 rounded-xl bg-green-500/10 text-green-500 text-sm font-bold border border-green-500/20 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            Approved
                                        </span>
                                    )}

                                    {job.status === 'REJECTED' && (
                                        <span className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-sm font-bold border border-red-500/20 flex items-center gap-2">
                                            <XCircle className="w-4 h-4" />
                                            Rejected
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                    <Clock className="w-12 h-12 text-slate-700 mx-auto" />
                    <div className="space-y-1">
                        <p className="text-white font-bold">No jobs found</p>
                        <p className="text-slate-500 text-sm">There are no jobs in the {filter.replace('_', ' ').toLowerCase()} queue.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
