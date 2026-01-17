'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Briefcase, Calendar, DollarSign, CheckCircle, Plus, Clock, FileText, ChevronLeft, ArrowUpRight, ShieldCheck, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { formatDistance } from 'date-fns';
import ContractChat from '@/components/contracts/ContractChat';
import { TransactionHistory } from '@/components/contracts/TransactionHistory';
import TimesheetView from '@/components/contracts/TimesheetView';
import CollaborativeEditor from '@/components/workspace/CollaborativeEditor';

export default function ContractDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [contract, setContract] = React.useState<any>(null);
    const [transactions, setTransactions] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [transactionsLoading, setTransactionsLoading] = React.useState(false);

    // UI State
    const [activeTab, setActiveTab] = React.useState<'milestones' | 'files' | 'messages' | 'payments' | 'timesheet' | 'workspace'>('milestones');
    const [isAddMilestoneOpen, setIsAddMilestoneOpen] = React.useState(false);
    const [isSubmitWorkOpen, setIsSubmitWorkOpen] = React.useState(false);
    const [isApprovalOpen, setIsApprovalOpen] = React.useState(false);
    const [isRequestChangesOpen, setIsRequestChangesOpen] = React.useState(false);
    const [isSubHistoryOpen, setIsSubHistoryOpen] = React.useState(false);
    const [isExtensionModalOpen, setIsExtensionModalOpen] = React.useState(false);
    const [isTerminationOpen, setIsTerminationOpen] = React.useState(false);
    const [isDisputeModalOpen, setIsDisputeModalOpen] = React.useState(false);
    const [disputeReason, setDisputeReason] = React.useState('');
    const [selectedMilestoneId, setSelectedMilestoneId] = React.useState<string | null>(null);
    const [viewingSubmissions, setViewingSubmissions] = React.useState<any[]>([]);
    const [feedback, setFeedback] = React.useState('');
    const [currentUser, setCurrentUser] = React.useState<any>(null);

    // Form states...
    const [description, setDescription] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [dueDate, setDueDate] = React.useState('');
    const [extensionDate, setExtensionDate] = React.useState('');
    const [extensionReason, setExtensionReason] = React.useState('');
    const [terminationReason, setTerminationReason] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);
    const [submissionContent, setSubmissionContent] = React.useState('');
    const [submissionFiles, setSubmissionFiles] = React.useState<string[]>([]);

    const getTimeRemaining = React.useCallback((date: string) => {
        const remaining = new Date(date).getTime() - new Date().getTime();
        if (remaining <= 0) return 'Processing...';
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m remaining`;
    }, []);

    const fetchContract = React.useCallback(async () => {
        try {
            const res = await api.get(`/contracts/${params.id}`);
            setContract(res.data);
        } catch (error) {
            console.error('Failed to fetch contract details', error);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    const fetchTransactions = React.useCallback(async () => {
        setTransactionsLoading(true);
        try {
            const res = await api.get(`/payments/transactions/reference/${params.id}`);
            setTransactions(res.data);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setTransactionsLoading(false);
        }
    }, [params.id]);

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/users/me');
                setCurrentUser(res.data);
            } catch (error) {
                console.error('Failed to fetch user', error);
            }
        };
        fetchUser();
    }, []);

    React.useEffect(() => {
        fetchContract();
        fetchTransactions();
    }, [fetchContract, fetchTransactions]);

    const handleAddMilestone = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post(`/contracts/${params.id}/milestones`, {
                description,
                amount: parseFloat(amount),
                dueDate: dueDate || undefined
            });
            setIsAddMilestoneOpen(false);
            setDescription('');
            setAmount('');
            setDueDate('');
            fetchContract(); // Refresh list
        } catch (error) {
            console.error('Failed to add milestone', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitWork = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMilestoneId) return;

        setSubmitting(true);
        try {
            await api.post(`/contracts/${params.id}/submit`, {
                milestoneId: selectedMilestoneId,
                content: submissionContent,
                attachments: submissionFiles,
                type: 'FINAL_RESULT'
            });

            setSubmissionContent('');
            setSubmissionFiles([]);
            setIsSubmitWorkOpen(false);
            fetchContract();
        } catch (error) {
            console.error('Failed to submit work', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleApproveWork = async (milestoneId: string) => {
        setLoading(true);
        try {
            await api.post(`/contracts/${params.id}/approve`, { milestoneId });
            fetchContract();
        } catch (error: any) {
            console.error('Failed to approve work', error);
            alert('Approval failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleRequestChanges = async (milestoneId: string) => {
        if (!feedback.trim()) return;

        setLoading(true);
        try {
            await api.post(`/contracts/${params.id}/reject-work`, {
                milestoneId,
                reason: feedback
            });
            setFeedback('');
            setIsRequestChangesOpen(false);
            fetchContract();
        } catch (error: any) {
            console.error('Failed to request changes', error);
            alert('Request failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleActivateMilestone = async (milestoneId: string) => {
        setLoading(true);
        try {
            await api.post(`/contracts/${params.id}/milestones/${milestoneId}/activate`);
            fetchContract();
            alert('Milestone activated and escrow funded successfully');
        } catch (error: any) {
            console.error('Failed to activate milestone', error);
            alert('Activation failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Modals
    const handleCloseSubmitModal = () => setIsSubmitWorkOpen(false);
    const handleOpenSubmitModal = (milestoneId: string) => {
        setSelectedMilestoneId(milestoneId);
        setIsSubmitWorkOpen(true);
    };

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = React.useState(false);

    const handlePauseContract = async () => {
        setLoading(true);
        try {
            await api.post(`/contracts/${params.id}/pause`);
            fetchContract();
        } catch (error) {
            console.error('Failed to pause contract', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResumeContract = async () => {
        setLoading(true);
        try {
            await api.post(`/contracts/${params.id}/resume`);
            fetchContract();
        } catch (error) {
            console.error('Failed to resume contract', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestExtension = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post(`/contracts/${params.id}/extend`, {
                newEndDate: extensionDate,
                reason: extensionReason
            });
            setIsExtensionModalOpen(false);
            setExtensionDate('');
            setExtensionReason('');
            fetchContract();
            alert('Extension request sent successfully');
        } catch (error) {
            console.error('Failed to request extension', error);
            alert('Failed to request extension');
        } finally {
            setSubmitting(false);
        }
    };

    const handleTerminateContract = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!terminationReason.trim()) return;

        setSubmitting(true);
        try {
            // contract-service might use dispute or just update status
            // For now, let's use the generic update or dispute
            await api.patch(`/contracts/${params.id}`, {
                status: 'TERMINATED',
                disputeReason: terminationReason
            });
            setIsTerminationOpen(false);
            setTerminationReason('');
            fetchContract();
            alert('Contract terminated successfully');
        } catch (error) {
            console.error('Failed to terminate contract', error);
            alert('Failed to terminate contract');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRaiseDispute = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!disputeReason.trim()) return;

        setSubmitting(true);
        try {
            await api.post(`/contracts/${params.id}/dispute`, {
                reason: disputeReason,
            });
            setIsDisputeModalOpen(false);
            setDisputeReason('');
            fetchContract();
            alert('Dispute raised successfully. Our team will review it soon.');
        } catch (error: any) {
            console.error('Failed to raise dispute', error);
            alert('Failed to raise dispute: ' + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await api.post('/storage/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const fileName = uploadRes.data.fileName;

            await api.patch(`/proposals/${params.id}/attachments`, { fileName });
            fetchContract();
        } catch (error) {
            console.error('Failed to upload file', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmissionFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await api.post('/storage/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const fileName = uploadRes.data.fileName;
            setSubmissionFiles(prev => [...prev, fileName]);
        } catch (error) {
            console.error('Failed to upload submission file', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const removeSubmissionFile = (fileName: string) => {
        setSubmissionFiles(prev => prev.filter(f => f !== fileName));
    };

    const [progress, setProgress] = React.useState(0);
    const [isEditingProgress, setIsEditingProgress] = React.useState(false);

    React.useEffect(() => {
        if (contract) {
            setProgress(contract.progress || 0);
        }
    }, [contract]);

    const handleSaveProgress = async () => {
        try {
            await api.patch(`/proposals/contracts/${params.id}/progress`, { progress });
            setContract((prev: any) => ({ ...prev, progress }));
            setIsEditingProgress(false);
        } catch (error) {
            console.error('Failed to update progress', error);
            alert('Failed to update progress');
        }
    };

    const handleOpenSubHistory = (submissions: any[]) => {
        setViewingSubmissions(submissions);
        setIsSubHistoryOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!contract) return null;

    const { job, milestones } = contract;

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-6">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <Link href="/contracts" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Contracts
                    </Link>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{job.title}</h1>
                            <div className="flex items-center gap-4 text-slate-400">
                                <span className="flex items-center gap-1.5 text-sm">
                                    <Clock className="w-4 h-4" />
                                    Started {formatDistance(new Date(contract.updatedAt), new Date(), { addSuffix: true })}
                                </span>
                                <span className="flex items-center gap-1.5 text-sm">
                                    <CheckCircle className={`w-4 h-4 ${contract.status === 'PAUSED' ? 'text-yellow-500' : contract.status === 'DISPUTED' ? 'text-red-500' : 'text-green-500'}`} />
                                    {contract.status === 'TERMINATED' ? 'Terminated' :
                                        contract.status === 'PAUSED' ? 'Paused' :
                                            contract.status === 'DISPUTED' ? 'In Dispute' : 'Active'}
                                </span>
                                {contract.extensionRequestStatus === 'PENDING' && (
                                    <span className="flex items-center gap-1.5 text-sm text-yellow-500">
                                        <Clock className="w-4 h-4" />
                                        Extension Requested
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {/* Client Actions */}
                            {currentUser?.id === contract.job.client_id && contract.status !== 'TERMINATED' && (
                                <>
                                    {contract.status === 'PAUSED' ? (
                                        <button
                                            onClick={handleResumeContract}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors text-sm font-medium"
                                        >
                                            Resume Contract
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handlePauseContract}
                                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors text-sm font-medium"
                                        >
                                            Pause Contract
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsExtensionModalOpen(true)}
                                        className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        Extend
                                    </button>
                                    <button
                                        onClick={() => setIsTerminationOpen(true)}
                                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        End Contract
                                    </button>
                                    <button
                                        onClick={() => setIsDisputeModalOpen(true)}
                                        className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border border-purple-500/20 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        Dispute
                                    </button>
                                </>
                            )}

                            {/* Freelancer Actions */}
                            {currentUser?.id === contract.freelancer_id && contract.status !== 'TERMINATED' && (
                                <>
                                    <button
                                        onClick={() => setIsExtensionModalOpen(true)}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium border border-slate-700"
                                    >
                                        {currentUser?.id === contract.job.client_id ? 'Extend Contract' : 'Request Extension'}
                                    </button>
                                    <button
                                        onClick={() => setIsTerminationOpen(true)}
                                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        Terminate
                                    </button>
                                    <button
                                        onClick={() => setIsDisputeModalOpen(true)}
                                        className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border border-purple-500/20 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        Dispute
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress Section */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Project Progress
                        </h3>
                        {/* Freelancer Edit Controls */}
                        {isEditingProgress ? (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setIsEditingProgress(false);
                                        setProgress(contract.progress || 0);
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProgress}
                                    className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                                >
                                    Save Update
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsEditingProgress(true)}
                                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors border border-slate-700 rounded-lg hover:border-blue-500/50"
                            >
                                Update Progress
                            </button>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Completion</span>
                            <span className="text-white font-medium">{progress}%</span>
                        </div>

                        {isEditingProgress ? (
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={progress}
                                onChange={(e) => setProgress(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        ) : (
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        )}
                        <p className="text-xs text-slate-500 mt-2">
                            {progress === 100 ? 'Project marked as complete.' : 'Keep the client updated on your progress.'}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-slate-800">
                    <button
                        onClick={() => setActiveTab('milestones')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'milestones' ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}
                    >
                        Milestones
                        {activeTab === 'milestones' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('timesheet')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'timesheet' ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}
                    >
                        Timesheet
                        {activeTab === 'timesheet' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'files' ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}
                    >
                        Files
                        {activeTab === 'files' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('workspace')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'workspace' ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}
                    >
                        Workspace
                        {activeTab === 'workspace' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'messages' ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}
                    >
                        Messages
                        {activeTab === 'messages' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'payments' ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}
                    >
                        Payments
                        {activeTab === 'payments' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
                    </button>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {activeTab === 'timesheet' && (
                            <TimesheetView
                                contractId={params.id as string}
                                currentUser={currentUser}
                                isClient={contract?.job?.client_id === currentUser?.id}
                            />
                        )}
                        {activeTab === 'workspace' && (
                            <CollaborativeEditor contractId={params.id as string} />
                        )}
                        {activeTab === 'milestones' ? (
                            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-500" />
                                        Milestones
                                    </h2>
                                    <button
                                        onClick={() => setIsAddMilestoneOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Milestone
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {milestones && milestones.length > 0 ? (
                                        milestones.map((milestone: any) => (
                                            <div key={milestone.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium text-white mb-1">{milestone.description}</div>
                                                    <div className="text-sm text-slate-400 flex items-center gap-3">
                                                        {milestone.dueDate && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                Due {new Date(milestone.dueDate).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${milestone.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                                                            milestone.status === 'IN_REVIEW' ? 'bg-blue-500/10 text-blue-500' :
                                                                milestone.status === 'ACTIVE' ? 'bg-indigo-500/10 text-indigo-500' :
                                                                    'bg-slate-700 text-slate-300'
                                                            } uppercase tracking-wide`}>
                                                            {milestone.status.replace('_', ' ')}
                                                        </span>
                                                        {milestone.escrowStatus === 'FUNDED' && milestone.status !== 'COMPLETED' && (
                                                            <span className="flex items-center gap-1 text-[10px] text-green-400 font-medium bg-green-500/5 px-2 py-0.5 rounded-full border border-green-500/10">
                                                                <ShieldCheck className="w-3 h-3" />
                                                                Escrow Funded
                                                            </span>
                                                        )}
                                                        {milestone.status === 'IN_REVIEW' && milestone.autoReleaseDate && (
                                                            <span className="flex items-center gap-1 text-[10px] text-blue-400 font-medium bg-blue-500/5 px-2 py-0.5 rounded-full border border-blue-500/10">
                                                                <Clock className="w-3 h-3" />
                                                                Auto-release in {getTimeRemaining(milestone.autoReleaseDate)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Latest Submission Info */}
                                                    {milestone.submissions && milestone.submissions.length > 0 && (
                                                        <div className="mt-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Latest Submission</div>
                                                                {milestone.submissions.length > 1 && (
                                                                    <button
                                                                        onClick={() => handleOpenSubHistory(milestone.submissions)}
                                                                        className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-medium"
                                                                    >
                                                                        View All {milestone.submissions.length}
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-slate-300 line-clamp-2 italic">
                                                                "{milestone.submissions[0].content}"
                                                            </div>
                                                            {milestone.submissions[0].attachments?.length > 0 && (
                                                                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                                                                    {milestone.submissions[0].attachments.map((file: string, idx: number) => (
                                                                        <a
                                                                            key={idx}
                                                                            href={`${process.env.NEXT_PUBLIC_API_URL || '/api'}/storage/url/${file}`}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="text-[10px] bg-slate-800 text-blue-400 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                                                                        >
                                                                            Attachment {idx + 1}
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="font-bold text-white text-lg">${milestone.amount}</div>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        {milestone.status === 'PENDING' && contract.status !== 'PAUSED' && currentUser?.id === contract.job.client_id && (
                                                            <button
                                                                onClick={() => handleActivateMilestone(milestone.id)}
                                                                className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-medium transition-colors"
                                                            >
                                                                Fund & Activate
                                                            </button>
                                                        )}
                                                        {milestone.status === 'ACTIVE' && contract.status !== 'PAUSED' && currentUser?.id === contract.freelancer_id && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedMilestoneId(milestone.id);
                                                                    setIsSubmitWorkOpen(true);
                                                                }}
                                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
                                                            >
                                                                Submit Work
                                                            </button>
                                                        )}
                                                        {milestone.status === 'IN_REVIEW' && contract.status !== 'PAUSED' && currentUser?.id === contract.job.client_id && (
                                                            <div className="flex flex-col gap-2">
                                                                <button
                                                                    onClick={() => handleApproveWork(milestone.id)}
                                                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-medium transition-colors"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRequestChanges(milestone.id)}
                                                                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium transition-colors"
                                                                >
                                                                    Request Changes
                                                                </button>
                                                            </div>
                                                        )}
                                                        {milestone.status === 'COMPLETED' && milestone.submissions?.length > 0 && (
                                                            <button
                                                                onClick={() => handleOpenSubHistory(milestone.submissions)}
                                                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                                                            >
                                                                History
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-slate-500">
                                            No milestones added yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : activeTab === 'messages' ? (
                            <ContractChat
                                contractId={params.id as string}
                                freelancerId={contract.freelancer_id}
                                clientId={contract.job.client_id}
                            />
                        ) : activeTab === 'payments' ? (
                            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                                <TransactionHistory
                                    transactions={transactions}
                                    isLoading={transactionsLoading}
                                />
                            </div>
                        ) : ( // This is the 'files' tab
                            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-500" />
                                        Shared Files
                                    </h2>
                                    <div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            {uploading ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Plus className="w-4 h-4" />
                                            )}
                                            Upload File
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {contract.attachments && contract.attachments.length > 0 ? (
                                        contract.attachments.map((fileName: string, index: number) => (
                                            <a
                                                key={index}
                                                href={`${process.env.NEXT_PUBLIC_API_URL || '/api'}/storage/url/${fileName}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-white truncate max-w-[200px] md:max-w-md">
                                                            {fileName}
                                                        </div>
                                                        <div className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Workspace File</div>
                                                    </div>
                                                </div>
                                                <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-blue-500 transition-colors" />
                                            </a>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                                            No files uploaded yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-green-500" />
                                Financial Summary
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="text-sm text-slate-400">Total Contract Value</div>
                                    <div className="text-xl font-bold text-white">${contract.bidAmount}</div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="text-sm text-slate-400">Paid to Date</div>
                                    <div className="text-xl font-bold text-green-500">
                                        ${contract.milestones.filter((m: any) => m.status === 'PAID').reduce((acc: number, m: any) => acc + Number(m.amount), 0).toFixed(2)}
                                    </div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="text-sm text-slate-400">Remaining</div>
                                    <div className="text-xl font-bold text-slate-300">
                                        ${(Number(contract.bidAmount) - contract.milestones.filter((m: any) => m.status === 'PAID').reduce((acc: number, m: any) => acc + Number(m.amount), 0)).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-800">
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Contract Details</div>
                                <div className="space-y-2">
                                    <div className="text-sm text-white">Timeline: <span className="text-slate-400">{contract.timeline}</span></div>
                                    <div className="text-sm text-white">Project ID: <span className="text-slate-400 font-mono text-[10px]">{contract.jobId}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Modals --- */}

            {isAddMilestoneOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Add New Milestone</h3>
                            <button
                                type="button"
                                onClick={async () => {
                                    setSubmitting(true);
                                    try {
                                        const res = await api.post('/jobs/ai/scope', {
                                            description: contract.job.description,
                                            budget: parseFloat(contract.bidAmount)
                                        });
                                        const suggestions = res.data;
                                        if (suggestions.length > 0) {
                                            // Fill the first suggestion or show a list. 
                                            // For simplicity in modal, let's fill with the first one 
                                            // or better: just let the user see them. 
                                            // Actually, a simple prompt choice might be better, 
                                            // but for now, let's just pick the first one that hasn't been used?
                                            // Minimal implementation: alert the first suggestion to fill or just fill first.
                                            const first = suggestions[0];
                                            setDescription(first.title + ': ' + first.description);
                                            setAmount(((first.percentage / 100) * parseFloat(contract.bidAmount)).toFixed(2));
                                        }
                                    } catch (err) {
                                        console.error('AI Suggestion failed', err);
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}
                                className="text-xs font-semibold bg-blue-500/10 text-blue-400 px-2 py-1 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-all flex items-center gap-1"
                            >
                                ✨ AI Suggest
                            </button>
                        </div>
                        <form onSubmit={handleAddMilestone} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                                <input
                                    type="text"
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    placeholder="e.g. First Draft"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Amount ($)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsAddMilestoneOpen(false)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 transition-all">
                                    {submitting ? 'Adding...' : 'Add Milestone'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Submit Work Modal */}
            {isSubmitWorkOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-lg border border-slate-800">
                        <h2 className="text-xl font-bold text-white mb-4">Submit Work</h2>
                        <form onSubmit={handleSubmitWork} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">
                                    Description of Work
                                </label>
                                <textarea
                                    required
                                    value={submissionContent}
                                    onChange={(e) => setSubmissionContent(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    placeholder="Describe what you have completed..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">
                                    Attachments
                                </label>
                                <div className="space-y-2">
                                    {submissionFiles.map((file, i) => (
                                        <div key={i} className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800">
                                            <span className="text-sm text-slate-300 truncate max-w-[200px]">{file}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeSubmissionFile(file)}
                                                className="text-red-400 hover:text-red-300 text-xs"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                    <label className="flex items-center justify-center gap-2 w-full p-2 border border-dashed border-slate-700 rounded-lg hover:border-slate-500 transition-colors cursor-pointer text-slate-400 hover:text-white text-sm">
                                        <Plus className="w-4 h-4" />
                                        Add File
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleSubmissionFileUpload}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsSubmitWorkOpen(false)}
                                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !submissionContent.trim()}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Work'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Approval Confirmation Modal */}
            {isApprovalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-sm p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 text-center">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Approve Deliverables?</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            By approving this work, the funds for this milestone will be released instantly to the freelancer. This action cannot be undone.
                        </p>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => {
                                    handleApproveWork(selectedMilestoneId!);
                                    setIsApprovalOpen(false);
                                }}
                                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-900/20"
                            >
                                Confirm & Pay
                            </button>
                            <button
                                onClick={() => setIsApprovalOpen(false)}
                                className="w-full py-3 text-slate-400 hover:text-white transition-colors"
                            >
                                Not yet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Changes Modal */}
            {isRequestChangesOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-white mb-2">Request Changes</h3>
                        <p className="text-slate-400 text-sm mb-4">Provide detailed feedback to help the freelancer improve the deliverables.</p>
                        <div className="space-y-4">
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 h-32 resize-none"
                                placeholder="What needs to be changed? Be specific..."
                            />
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => setIsRequestChangesOpen(false)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">Cancel</button>
                                <button
                                    onClick={() => {
                                        handleRequestChanges(selectedMilestoneId!);
                                        setIsRequestChangesOpen(false);
                                        setFeedback('');
                                    }}
                                    disabled={!feedback.trim()}
                                    className="px-6 py-2 rounded-lg bg-yellow-600/20 text-yellow-500 font-medium hover:bg-yellow-600/30 disabled:opacity-50 transition-all border border-yellow-600/50"
                                >
                                    Send Feedback
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Submission History Modal */}
            {isSubHistoryOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Submission History</h3>
                            <button onClick={() => setIsSubHistoryOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                            {viewingSubmissions.map((sub, idx) => (
                                <div key={sub.id} className="relative pl-8 border-l border-slate-800 pb-2 last:pb-0">
                                    <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            {sub.status === 'APPROVED' ? 'Final Deliverable' : `Submission #${viewingSubmissions.length - idx}`}
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            {formatDistance(new Date(sub.createdAt), new Date(), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{sub.content}</p>
                                        {sub.attachments?.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {sub.attachments.map((file: string, fIdx: number) => (
                                                    <a
                                                        key={fIdx}
                                                        href={`${process.env.NEXT_PUBLIC_API_URL || '/api'}/storage/url/${file}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-blue-400 font-medium transition-all"
                                                    >
                                                        <FileText className="w-3 h-3" />
                                                        {file.split('-').slice(1).join('-') || file}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* Dispute Modal */}
            {isDisputeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Raise a Dispute</h3>
                            <button onClick={() => setIsDisputeModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleRaiseDispute} className="space-y-4">
                            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl mb-4">
                                <p className="text-sm text-purple-400">
                                    Disputing a contract stops all payments and triggers an investigation by our team. Please provide a detailed reason.
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Reason for Dispute</label>
                                <textarea
                                    value={disputeReason}
                                    onChange={(e) => setDisputeReason(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 h-32 resize-none"
                                    placeholder="Explain why you are raising this dispute..."
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsDisputeModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={submitting || !disputeReason.trim()}
                                    className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20"
                                >
                                    {submitting ? 'Raising Dispute...' : 'Raise Dispute'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Extension Modal */}
            {isExtensionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">
                                {currentUser?.id === contract.job.client_id ? 'Extend Contract' : 'Request Extension'}
                            </h3>
                            <button onClick={() => setIsExtensionModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleRequestExtension} className="space-y-4">
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-4">
                                <p className="text-sm text-blue-400">
                                    {currentUser?.id === contract.job.client_id
                                        ? 'Set a new end date for the contract. The freelancer will be notified.'
                                        : 'Suggest a new end date to your client. They will receive a notification to approve.'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">New End Date</label>
                                <input
                                    type="date"
                                    required
                                    value={extensionDate}
                                    onChange={(e) => setExtensionDate(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Reason (Optional)</label>
                                <textarea
                                    value={extensionReason}
                                    onChange={(e) => setExtensionReason(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 h-24 resize-none"
                                    placeholder="Why is an extension needed?"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsExtensionModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={submitting || !extensionDate}
                                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
                                >
                                    {submitting ? 'Processing...' : (currentUser?.id === contract.job.client_id ? 'Extend Contract' : 'Send Request')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
