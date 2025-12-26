'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Loader2, CheckCircle, AlertTriangle, Upload, Clock, MessageSquare, ChevronDown, ChevronUp, FileText, ExternalLink, XCircle, ShieldAlert } from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';
import ReviewModal from '@/components/ReviewModal';
import WorkSubmissionModal from '@/components/WorkSubmissionModal';
import DisputeModal from '@/components/DisputeModal';

interface Submission {
    id: string;
    content: string;
    attachments: string[];
    type: 'PROGRESS_REPORT' | 'FINAL_RESULT';
    createdAt: string;
}

interface Milestone {
    id: string;
    description: string;
    amount: number;
    status: 'PENDING' | 'ACTIVE' | 'IN_REVIEW' | 'COMPLETED';
    dueDate?: string;
    submissions: Submission[];
}

interface Contract {
    id: string;
    title: string;
    status: string;
    totalAmount: number;
    job_id: string;
    client_id: string;
    freelancer_id: string;
    milestones: Milestone[];
}

export default function ContractPage() {
    const { id } = useParams();
    const { userId } = useKeycloak();
    const [contract, setContract] = useState<Contract | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
    const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
    const [expandedMilestones, setExpandedMilestones] = useState<string[]>([]);

    const fetchContract = async () => {
        try {
            const res = await api.get(`/contracts/${id}`);
            setContract(res.data);
        } catch (error) {
            console.error('Failed to fetch contract', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContract();
    }, [id]);

    const toggleMilestone = (milestoneId: string) => {
        setExpandedMilestones(prev =>
            prev.includes(milestoneId)
                ? prev.filter(id => id !== milestoneId)
                : [...prev, milestoneId]
        );
    };

    const handleApproveWork = async (milestoneId: string) => {
        if (!confirm('Are you sure you want to approve this work and release payment?')) return;
        setActionLoading(true);
        try {
            await api.post(`/contracts/${id}/approve`, { milestoneId });
            await fetchContract();
        } catch (error) {
            console.error('Failed to approve work', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectWork = async (milestoneId: string) => {
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;

        setActionLoading(true);
        try {
            await api.post(`/contracts/${id}/reject-work`, { milestoneId, reason });
            await fetchContract();
        } catch (error) {
            console.error('Failed to reject work', error);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!contract) {
        return <div className="text-center text-slate-400">Contract not found</div>;
    }

    const isClient = userId === contract.client_id;
    const isFreelancer = userId === contract.freelancer_id;
    const revieweeId = isClient ? contract.freelancer_id : contract.client_id;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Contract Details</h1>
                    <p className="text-slate-400">ID: {contract.id}</p>
                </div>
                <div className="flex items-center gap-4">
                    {contract.status === 'COMPLETED' && (
                        <button
                            onClick={() => setIsReviewModalOpen(true)}
                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl text-sm font-medium flex items-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Leave Review
                        </button>
                    )}
                    {contract.status === 'ACTIVE' && (
                        <button
                            onClick={() => setIsDisputeModalOpen(true)}
                            className="px-4 py-2 bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border border-slate-700"
                        >
                            <ShieldAlert className="w-4 h-4" />
                            Dispute
                        </button>
                    )}
                    <div className={`px-4 py-2 rounded-full border text-sm font-bold ${contract.status === 'ACTIVE'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-green-500/10 text-green-400 border-green-500/20'
                        }`}>
                        {contract.status}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">Milestones</h2>
                {contract.milestones.map((milestone) => (
                    <div key={milestone.id} className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                        <div
                            className="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-800/50 transition-all"
                            onClick={() => toggleMilestone(milestone.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${milestone.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                                    milestone.status === 'IN_REVIEW' ? 'bg-yellow-500/10 text-yellow-500' :
                                        'bg-blue-500/10 text-blue-500'
                                    }`}>
                                    {milestone.status === 'COMPLETED' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{milestone.description}</h3>
                                    <div className="flex items-center gap-4 text-sm text-slate-400">
                                        <span className="font-bold text-slate-300">${milestone.amount}</span>
                                        {milestone.dueDate && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${milestone.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                    milestone.status === 'IN_REVIEW' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                        'bg-slate-800 text-slate-400 border-slate-700'
                                    }`}>
                                    {milestone.status.replace('_', ' ')}
                                </span>
                                {expandedMilestones.includes(milestone.id) ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                            </div>
                        </div>

                        {expandedMilestones.includes(milestone.id) && (
                            <div className="p-6 bg-slate-950/50 border-t border-slate-800 space-y-6">
                                {/* Submissions List */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Submissions</h4>
                                    {milestone.submissions.length === 0 ? (
                                        <p className="text-sm text-slate-500 italic">No submissions yet.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {milestone.submissions.map((sub) => (
                                                <div key={sub.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sub.type === 'FINAL_RESULT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                                                            }`}>
                                                            {sub.type.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500">
                                                            {new Date(sub.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-300 leading-relaxed">{sub.content}</p>
                                                    {sub.attachments.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {sub.attachments.map((url, i) => (
                                                                <a
                                                                    key={i}
                                                                    href={url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-blue-400 hover:text-blue-300 transition-all"
                                                                >
                                                                    <FileText className="w-3 h-3" />
                                                                    Attachment {i + 1}
                                                                    <ExternalLink className="w-2 h-2" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="pt-4 flex gap-3">
                                    {milestone.status === 'ACTIVE' && isFreelancer && (
                                        <button
                                            onClick={() => {
                                                setSelectedMilestoneId(milestone.id);
                                                setIsSubmitModalOpen(true);
                                            }}
                                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <Upload className="w-4 h-4" />
                                            Submit Work
                                        </button>
                                    )}

                                    {milestone.status === 'IN_REVIEW' && isClient && (
                                        <>
                                            <button
                                                onClick={() => handleRejectWork(milestone.id)}
                                                disabled={actionLoading}
                                                className="flex-1 py-2 bg-slate-800 hover:bg-red-500/10 text-slate-300 hover:text-red-400 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-slate-700"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Request Changes
                                            </button>
                                            <button
                                                onClick={() => handleApproveWork(milestone.id)}
                                                disabled={actionLoading}
                                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Approve & Pay
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {userId && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    onSuccess={() => { }}
                    contractId={contract.id}
                    jobId={contract.job_id}
                    reviewerId={userId}
                    revieweeId={revieweeId}
                />
            )}

            {selectedMilestoneId && (
                <WorkSubmissionModal
                    isOpen={isSubmitModalOpen}
                    onClose={() => setIsSubmitModalOpen(false)}
                    onSuccess={fetchContract}
                    contractId={contract.id}
                    milestoneId={selectedMilestoneId}
                />
            )}

            <DisputeModal
                isOpen={isDisputeModalOpen}
                onClose={() => setIsDisputeModalOpen(false)}
                onSuccess={fetchContract}
                contractId={contract.id}
            />
        </div>
    );
}
