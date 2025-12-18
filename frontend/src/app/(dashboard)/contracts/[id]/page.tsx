'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Loader2, CheckCircle, AlertTriangle, Upload, Clock, MessageSquare } from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';
import ReviewModal from '@/components/ReviewModal';

interface Milestone {
    id: string;
    description: string;
    amount: number;
    status: 'PENDING' | 'ACTIVE' | 'SUBMITTED' | 'COMPLETED';
    dueDate?: string;
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

    const handleSubmitWork = async (milestoneId: string) => {
        setActionLoading(true);
        try {
            await api.post(`/contracts/${id}/submit`, { milestoneId, attachments: [] });
            await fetchContract();
        } catch (error) {
            console.error('Failed to submit work', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleApproveWork = async (milestoneId: string) => {
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
                    <div className="px-4 py-2 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                        {contract.status}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">Milestones</h2>
                {contract.milestones.map((milestone) => (
                    <div key={milestone.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-medium text-white">{milestone.description}</h3>
                            <p className="text-slate-400">${milestone.amount}</p>
                            {milestone.dueDate && (
                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                    <Clock className="w-4 h-4" />
                                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-sm ${milestone.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' :
                                milestone.status === 'SUBMITTED' ? 'bg-yellow-500/10 text-yellow-400' :
                                    'bg-slate-800 text-slate-400'
                                }`}>
                                {milestone.status}
                            </span>

                            {milestone.status === 'ACTIVE' && (
                                <button
                                    onClick={() => handleSubmitWork(milestone.id)}
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium"
                                >
                                    Submit Work
                                </button>
                            )}

                            {milestone.status === 'SUBMITTED' && isClient && (
                                <button
                                    onClick={() => handleApproveWork(milestone.id)}
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium"
                                >
                                    Approve & Pay
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {userId && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    onSuccess={() => {
                        // Optionally show a success message
                    }}
                    contractId={contract.id}
                    jobId={contract.job_id}
                    reviewerId={userId}
                    revieweeId={revieweeId}
                />
            )}
        </div>
    );
}
