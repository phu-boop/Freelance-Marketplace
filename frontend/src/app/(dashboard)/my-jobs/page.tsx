'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Briefcase,
    MapPin,
    Clock,
    DollarSign,
    Plus,
    Loader2,
    Users,
    ChevronRight
} from 'lucide-react';
import api from '@/lib/api';

interface Job {
    id: string;
    title: string;
    location: string;
    budget: number;
    type: string;
    createdAt: string;
    status: string;
    proposalCount?: number;
}

export default function MyJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMyJobs = async () => {
            try {
                // In a real app, this endpoint would filter by the current user's ID
                // For now, we might need a specific endpoint or filter in the Job Service
                const response = await api.get('/jobs/my-jobs');
                setJobs(response.data);
            } catch (err) {
                console.error('Failed to fetch my jobs', err);
                // Fallback mock data for demonstration
                setJobs([
                    {
                        id: '1',
                        title: 'Senior React Developer',
                        location: 'Remote',
                        budget: 5000,
                        type: 'Full-time',
                        createdAt: new Date().toISOString(),
                        status: 'Open',
                        proposalCount: 3
                    },
                    {
                        id: '2',
                        title: 'Backend Node.js Engineer',
                        location: 'Remote',
                        budget: 4000,
                        type: 'Contract',
                        createdAt: new Date(Date.now() - 86400000).toISOString(),
                        status: 'Open',
                        proposalCount: 5
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchMyJobs();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Jobs</h1>
                    <p className="text-slate-400">Manage your job postings and view proposals.</p>
                </div>
                <Link
                    href="/jobs/create"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-5 h-5" />
                    Post New Job
                </Link>
            </div>

            {jobs.length === 0 ? (
                <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                        <Briefcase className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">No Jobs Posted Yet</h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                        You haven't posted any jobs yet. Create your first job posting to start finding talent.
                    </p>
                    <Link
                        href="/jobs/create"
                        className="inline-flex px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all mt-4"
                    >
                        Post a Job
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {jobs.map((job, idx) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/30 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                            {job.title}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${job.status === 'Open'
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                : 'bg-slate-800 text-slate-400 border-slate-700'
                                            }`}>
                                            {job.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4" />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <DollarSign className="w-4 h-4" />
                                            ${job.budget}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            {new Date(job.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end mr-4">
                                        <div className="flex items-center gap-2 text-white font-medium">
                                            <Users className="w-4 h-4 text-blue-400" />
                                            {job.proposalCount || 0} Proposals
                                        </div>
                                        <span className="text-xs text-slate-500">Received so far</span>
                                    </div>
                                    <Link
                                        href={`/my-jobs/${job.id}/proposals`}
                                        className="px-4 py-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-2"
                                    >
                                        View Proposals
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
