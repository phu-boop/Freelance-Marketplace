'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Loader2,
    CheckCircle2,
    XCircle,
    MessageSquare,
    ChevronLeft,
    DollarSign,
    Clock,
    User,
    FileText,
    Award,
    Briefcase
} from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function ClientProposalReviewPage() {
    const { id: jobId, proposalId } = useParams();
    const router = useRouter();
    const { userId } = useKeycloak();
    const [proposal, setProposal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchProposal = async () => {
            try {
                const res = await api.get(`/proposals/${proposalId}`);
                const proposalData = res.data;

                // Fetch freelancer details
                if (proposalData.freelancer_id) {
                    const userRes = await api.get(`/users/${proposalData.freelancer_id}`);
                    proposalData.freelancer = userRes.data;
                }

                setProposal(proposalData);
            } catch (err) {
                console.error('Failed to fetch proposal details', err);
                toast.error('Failed to load proposal');
            } finally {
                setLoading(false);
            }
        };

        if (proposalId) fetchProposal();
    }, [proposalId]);

    const handleAccept = async () => {
        if (!confirm('Are you sure you want to hire this freelancer? This will create a contract.')) return;
        setProcessing(true);
        try {
            // Note: In this system, 'Accepting' a proposal from client side usually triggers contract creation
            const contractRes = await api.post('/contracts', {
                jobId: jobId,
                proposalId: proposalId,
                freelancerId: proposal.freelancer_id,
                bidAmount: proposal.bidAmount,
                timeline: proposal.timeline || 'TBD'
            });

            toast.success('Hiring successful! Redirecting to contract...');
            router.push(`/client/contracts/${contractRes.data.id}`);
        } catch (error: any) {
            console.error('Hiring failed', error);
            toast.error(error.response?.data?.message || 'Failed to complete hiring');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!confirm('Are you sure you want to reject this proposal?')) return;
        setProcessing(true);
        try {
            await api.patch(`/proposals/${proposalId}`, { status: 'REJECTED' });
            toast.success('Proposal rejected');
            setProposal({ ...proposal, status: 'REJECTED' });
        } catch (error) {
            console.error('Rejection failed', error);
            toast.error('Failed to reject proposal');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (!proposal) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white mb-4">Proposal Not Found</h2>
                <button onClick={() => router.back()} className="text-indigo-400 hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <button onClick={() => router.back()} className="flex items-center text-slate-400 hover:text-white transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Proposals
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Applicant Profile & Terms */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-8"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-indigo-500/20">
                                    {proposal.freelancer?.firstName?.[0]}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white">
                                        {proposal.freelancer?.firstName} {proposal.freelancer?.lastName}
                                    </h1>
                                    <p className="text-indigo-400 font-medium">{proposal.freelancer?.title || 'Expert Freelancer'}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border tracking-wider uppercase ${proposal.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    proposal.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}>
                                {proposal.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Bid Amount</p>
                                <div className="flex items-center text-2xl font-bold text-white">
                                    <DollarSign className="w-5 h-5 text-emerald-500 mr-1" />
                                    {proposal.bidAmount}
                                </div>
                            </div>
                            <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Est. Timeline</p>
                                <div className="flex items-center text-2xl font-bold text-white">
                                    <Clock className="w-5 h-5 text-indigo-500 mr-2" />
                                    {proposal.timeline || 'N/A'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-400" />
                                Cover Letter
                            </h3>
                            <div className="p-6 bg-slate-950/30 rounded-2xl text-slate-400 leading-relaxed whitespace-pre-wrap border border-slate-800/50">
                                {proposal.coverLetter}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right: Actions */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 sticky top-24"
                    >
                        <h3 className="font-bold text-white border-b border-slate-800 pb-4">Decision Actions</h3>

                        <div className="space-y-3">
                            {proposal.status !== 'REJECTED' && (
                                <button
                                    onClick={handleAccept}
                                    disabled={processing}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                                >
                                    {processing ? <Loader2 className="animate-spin w-5 h-5" /> : <Award className="w-5 h-5" />}
                                    Hire Freelancer
                                </button>
                            )}

                            <button
                                onClick={() => router.push(`/messages?recipient=${proposal.freelancer_id}`)}
                                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-5 h-5" />
                                Message candidate
                            </button>

                            {proposal.status !== 'REJECTED' && (
                                <button
                                    onClick={handleReject}
                                    disabled={processing}
                                    className="w-full py-4 bg-transparent hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-5 h-5" />
                                    Reject Proposal
                                </button>
                            )}
                        </div>

                        <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                            <p className="text-xs text-slate-500 leading-relaxed italic">
                                "Tip: Message the candidate to clarify requirements before making a formal job offer."
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
