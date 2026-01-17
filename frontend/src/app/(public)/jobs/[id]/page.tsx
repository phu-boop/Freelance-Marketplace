'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Briefcase,
    MapPin,
    Clock,
    DollarSign,
    Calendar,
    ChevronLeft,
    Share2,
    Flag,
    CheckCircle2,
    Loader2,
    Tags,
    Building2,
    Info
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';
import { ProposalModal } from '@/components/ProposalModal';

interface Job {
    id: string;
    title: string;
    description: string;
    budget: number;
    location: string;
    type: string;
    status: string;
    createdAt: string;
    client_id: string;
    category?: {
        id: string;
        name: string;
    };
    skills?: {
        skill: {
            id: string;
            name: string;
        };
    }[];
}

export default function JobDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const invitationId = searchParams.get('invited');
    const { authenticated, login, userId } = useKeycloak();
    const [job, setJob] = useState<Job | null>(null);
    const [invitation, setInvitation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobRes, invRes] = await Promise.all([
                    api.get(`/jobs/${id}`),
                    invitationId ? api.get(`/invitations/freelancer`) : Promise.resolve({ data: [] })
                ]);

                setJob(jobRes.data);

                if (invitationId && invRes.data) {
                    const inv = invRes.data.find((i: any) => i.id === invitationId);
                    setInvitation(inv);
                }

                setError(null);
            } catch (err) {
                console.error('Failed to fetch details', err);
                setError('Could not find the job you are looking for.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, invitationId]);

    const handleApply = () => {
        if (!authenticated) {
            login();
            return;
        }
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-400 animate-pulse">Loading job details...</p>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <Info className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Job Not Found</h1>
                <p className="text-slate-400 mb-8 max-w-md">{error || "The job post might have been removed or is no longer available."}</p>
                <Link href="/jobs" className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white hover:bg-slate-800 transition-all flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back to Job List
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
            {/* Navigation Header */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                                FreelanceHub
                            </span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-slate-900 rounded-xl text-slate-400 transition-all">
                                <Share2 className="w-5 h-5" />
                            </button>
                            <button onClick={() => router.back()} className="text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-4 max-w-5xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {invitation && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-6 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-start gap-4 mb-8"
                            >
                                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                                    <Info className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-bold text-white">You're Invited!</h4>
                                    <p className="text-blue-100/70 text-sm mt-1">
                                        The client has invited you to apply for this job.
                                        {invitation.message && (
                                            <span className="block mt-2 p-3 bg-blue-500/5 rounded-xl italic text-blue-200">
                                                "{invitation.message}"
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20 uppercase tracking-wider">
                                            {job.type}
                                        </span>
                                        {job.category && (
                                            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700">
                                                {job.category.name}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                        {job.title}
                                    </h1>
                                    <div className="flex flex-wrap gap-6 text-sm text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-blue-400" />
                                            Client ID: {job.client_id.slice(0, 8)}...
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-blue-400" />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-blue-400" />
                                            Posted {new Date(job.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-800" />

                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold text-white">Job Description</h2>
                                    <div className="prose prose-invert max-w-none text-slate-400 leading-relaxed whitespace-pre-wrap">
                                        {job.description}
                                    </div>
                                </div>

                                {job.skills && job.skills.length > 0 && (
                                    <div className="space-y-4 pt-4">
                                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Required Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {job.skills.map((s) => (
                                                <span key={s.skill.id} className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-300 transition-colors hover:border-blue-500/30">
                                                    {s.skill.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-6 rounded-3xl bg-blue-600 space-y-6 shadow-2xl shadow-blue-600/20"
                        >
                            <div className="space-y-2">
                                <p className="text-blue-100 text-sm font-medium">Budget</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-white">${job.budget}</span>
                                    {job.type === 'FIXED_PRICE' ? null : <span className="text-blue-100 text-sm">/ hr</span>}
                                </div>
                            </div>

                            <button
                                onClick={handleApply}
                                className="w-full py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                            >
                                {authenticated
                                    ? (invitationId ? 'Accept Invitation & Apply' : 'Apply for this Job')
                                    : 'Sign in to Apply'
                                }
                                <CheckCircle2 className="w-5 h-5" />
                            </button>

                            <p className="text-xs text-blue-100/70 text-center px-4 leading-relaxed">
                                {authenticated
                                    ? "Proposals are directly sent to the client for immediate review."
                                    : "You must be logged in to submit a proposal for this position."
                                }
                            </p>
                        </motion.div>

                        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                            <h3 className="font-bold text-white">Project Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <DollarSign className="w-4 h-4" />
                                        <span className="text-sm">Budget Type</span>
                                    </div>
                                    <span className="text-sm font-semibold">{job.type === 'FIXED_PRICE' ? 'Fixed Price' : 'Hourly Rate'}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm">Posted</span>
                                    </div>
                                    <span className="text-sm font-semibold">{new Date(job.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <Tags className="w-4 h-4" />
                                        <span className="text-sm">Category</span>
                                    </div>
                                    <span className="text-sm font-semibold">{job.category?.name || 'Uncategorized'}</span>
                                </div>
                            </div>

                            <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-400 transition-colors pt-4">
                                <Flag className="w-4 h-4" /> Report job post
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <ProposalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                jobId={job.id}
                jobTitle={job.title}
                invitationId={invitationId || undefined}
            />
        </div>
    );
}
