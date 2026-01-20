'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Scale,
    FileText,
    Upload,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Gavel,
    MessageSquare,
    Info,
    Lock,
    ExternalLink,
    Percent,
    Sparkles,
    BrainCircuit,
    History
} from 'lucide-react';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';
import DisputeTimeline from './DisputeTimeline';
import { formatAmount } from '@/lib/utils';

interface Evidence {
    id: string;
    fileUrl: string;
    fileType: string;
    description: string;
    uploaderId: string;
    createdAt: string;
}

interface Dispute {
    id: string;
    reason: string;
    status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
    resolution?: string;
    evidence: Evidence[];
    arbitrationCase?: {
        id: string;
        status: string;
        fees: number;
        decision?: string;
    };
    createdAt: string;
}

interface DisputedContract {
    id: string;
    job_id: string;
    freelancer_id: string;
    client_id: string;
    status: string;
    totalAmount: number;
    job: {
        title: string;
    };
    disputes: Dispute[];
}

export default function DisputeCenter() {
    const { userId } = useKeycloak();
    const [contracts, setContracts] = useState<DisputedContract[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedContract, setSelectedContract] = useState<DisputedContract | null>(null);
    const [newEvidence, setNewEvidence] = useState({ fileUrl: '', description: '', fileType: 'IMAGE' });
    const [uploading, setUploading] = useState(false);
    const [escalating, setEscalating] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
    const [aiAnalysis, setAiAnalysis] = useState<{ summary: string; suggestedFreelancerPercentage: number; confidenceRating: number } | null>(null);
    const [loadingAi, setLoadingAi] = useState(false);

    useEffect(() => {
        fetchDisputedContracts();
    }, []);

    const fetchDisputedContracts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/contracts/my');
            // ContractsService.findOne returns disputes in our updated include, 
            // but api.get('/contracts/my') might not include them by default if it uses aDifferent method.
            // Let's assume it does if we updated findByClient/Freelancer too, or we fetch details on select.
            setContracts(res.data.filter((c: DisputedContract) => c.status === 'DISPUTED'));
        } catch (error) {
            console.error('Failed to fetch disputed contracts', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectContract = async (contract: DisputedContract) => {
        setLoading(true);
        setAiAnalysis(null);
        try {
            const [contractRes, timelineRes] = await Promise.all([
                api.get(`/contracts/${contract.id}`),
                api.get(`/contracts/${contract.id}/timeline`)
            ]);
            setSelectedContract(contractRes.data);
            setTimelineEvents(timelineRes.data);
            setSuccess(null);
        } catch (error) {
            console.error('Failed to fetch contract details', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAiAnalysis = async (disputeId: string) => {
        setLoadingAi(true);
        try {
            const res = await api.get(`/contracts/disputes/${disputeId}/ai-analysis`);
            setAiAnalysis(res.data);
        } catch (error) {
            console.error('AI analysis failed', error);
        } finally {
            setLoadingAi(false);
        }
    };

    const handleAddEvidence = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedContract?.disputes?.[0]) return;
        setUploading(true);
        try {
            await api.post(`/contracts/disputes/${selectedContract.disputes[0].id}/evidence`, newEvidence);
            setSuccess('Evidence uploaded successfully.');
            setNewEvidence({ fileUrl: '', description: '', fileType: 'IMAGE' });
            // Refresh details
            handleSelectContract(selectedContract);
        } catch (error) {
            console.error('Evidence upload failed', error);
            alert('Failed to upload evidence. Check if dispute is locked.');
        } finally {
            setUploading(false);
        }
    };

    const handleEscalate = async () => {
        if (!selectedContract?.disputes?.[0]) return;
        if (!confirm('Escalating to arbitration costs $50.00 (split between parties). Continue?')) return;
        setEscalating(true);
        try {
            await api.post(`/contracts/disputes/${selectedContract.disputes[0].id}/escalate`);
            setSuccess('Escalated to professional arbitration.');
            handleSelectContract(selectedContract);
        } catch (error) {
            console.error('Escalation failed', error);
            alert('Escalation failed. Ensure you have at least $25.00 in your wallet.');
        } finally {
            setEscalating(false);
        }
    };

    if (loading && contracts.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    const activeDispute = selectedContract?.disputes?.[0];

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Scale className="w-8 h-8 text-amber-500" />
                    Dispute & Arbitration Center
                </h1>
                <p className="text-slate-400">Manage contract disagreements through our fair evidence-based resolution process.</p>
                {success && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="w-5 h-5" />
                        {success}
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Disputed Contracts */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-2">Active Disagreements</h2>
                    <div className="space-y-3">
                        {contracts.map(contract => (
                            <button
                                key={contract.id}
                                onClick={() => handleSelectContract(contract)}
                                className={`w-full p-4 rounded-2xl border transition-all text-left flex flex-col gap-1 ${selectedContract?.id === contract.id
                                    ? 'bg-amber-500/10 border-amber-500'
                                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                    }`}
                            >
                                <span className="font-bold text-white">{contract.job?.title || 'Contract Dispute'}</span>
                                <span className="text-xs text-slate-500">Contract: {contract.id.slice(0, 8)}...</span>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-[10px] text-amber-400 font-bold flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        IN DISPUTE
                                    </span>
                                </div>
                            </button>
                        ))}
                        {contracts.length === 0 && (
                            <div className="p-8 text-center bg-green-500/5 border border-dashed border-green-500/20 rounded-2xl">
                                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                <p className="text-sm text-green-500 font-medium">No active disputes. Great job!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dispute Details */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedContract && activeDispute ? (
                            <motion.div
                                key={selectedContract.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                {/* Status Card */}
                                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">Dispute Details</h3>
                                            <p className="text-sm text-slate-400">Opened on {new Date(activeDispute.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className={`px-4 py-2 rounded-xl font-bold text-sm ${activeDispute.status === 'UNDER_REVIEW'
                                            ? 'bg-amber-500/20 text-amber-500'
                                            : 'bg-blue-500/20 text-blue-500'
                                            }`}>
                                            {activeDispute.status.replace('_', ' ')}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                                        <p className="text-sm font-bold text-slate-400 mb-2 flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" />
                                            Reason for Dispute
                                        </p>
                                        <p className="text-white text-sm italic">&quot;{activeDispute.reason}&quot;</p>
                                    </div>

                                    {activeDispute.arbitrationCase && (
                                        <div className="p-4 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Gavel className="w-6 h-6 text-purple-400" />
                                                <div>
                                                    <p className="text-sm font-bold text-purple-400">Under Professional Arbitration</p>
                                                    <p className="text-xs text-slate-400">Status: {activeDispute.arbitrationCase.status}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500">Case ID</p>
                                                <p className="text-xs text-white font-mono">{activeDispute.arbitrationCase.id.slice(0, 12)}...</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Mediation Assistant Trigger */}
                                    {!aiAnalysis && !loadingAi && activeDispute.status !== 'RESOLVED' && (
                                        <button
                                            onClick={() => fetchAiAnalysis(activeDispute.id)}
                                            className="w-full p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:scale-110 transition-transform">
                                                    <Sparkles className="w-5 h-5 text-indigo-400" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold text-indigo-400">Request AI Mediation Analysis</p>
                                                    <p className="text-xs text-slate-500">Get a neutral suggestion based on project history.</p>
                                                </div>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-slate-600" />
                                        </button>
                                    )}

                                    {loadingAi && (
                                        <div className="w-full p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col items-center justify-center gap-3">
                                            <BrainCircuit className="w-8 h-8 text-indigo-500 animate-pulse" />
                                            <p className="text-xs text-indigo-400 font-medium italic">Analyzing project timeline & evidence...</p>
                                        </div>
                                    )}

                                    {aiAnalysis && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 space-y-4"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="w-5 h-5 text-indigo-400" />
                                                    <h4 className="text-sm font-black text-white uppercase tracking-widest">AI Mediation Suggestion</h4>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Confidence</span>
                                                    <span className="text-xs text-indigo-400 font-black">{(aiAnalysis.confidenceRating * 100).toFixed(0)}%</span>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-slate-950/40 border border-indigo-500/10">
                                                <p className="text-sm text-slate-300 italic leading-relaxed">
                                                    &quot;{aiAnalysis.summary}&quot;
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500"
                                                        style={{ width: `${aiAnalysis.suggestedFreelancerPercentage}%` }}
                                                    />
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Recommended Split</span>
                                                    <span className="text-sm font-black text-white">
                                                        {aiAnalysis.suggestedFreelancerPercentage}% Freelancer / {100 - aiAnalysis.suggestedFreelancerPercentage}% Client
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Evidence Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Upload Evidence */}
                                    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 relative overflow-hidden">
                                        {(activeDispute.arbitrationCase?.status === 'IN_REVIEW' || activeDispute.status === 'RESOLVED') && (
                                            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                                                <Lock className="w-10 h-10 text-slate-500 mb-2" />
                                                <p className="text-sm font-bold text-white uppercase tracking-widest">Evidence Locked</p>
                                                <p className="text-xs text-slate-400 mt-1 max-w-[180px]">Case is under active review by an investigator.</p>
                                            </div>
                                        )}
                                        <h4 className="font-bold text-white flex items-center gap-2">
                                            <Upload className="w-4 h-4 text-blue-400" />
                                            Submit Evidence
                                        </h4>
                                        <form onSubmit={handleAddEvidence} className="space-y-4">
                                            <input
                                                required
                                                type="url"
                                                placeholder="File URL (Proof/Screenshot)"
                                                value={newEvidence.fileUrl}
                                                onChange={e => setNewEvidence({ ...newEvidence, fileUrl: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/20"
                                            />
                                            <textarea
                                                required
                                                placeholder="Describe how this supports your case..."
                                                value={newEvidence.description}
                                                onChange={e => setNewEvidence({ ...newEvidence, description: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white h-24 focus:ring-2 focus:ring-blue-500/20"
                                            />
                                            <button
                                                type="submit"
                                                disabled={uploading || activeDispute.status === 'RESOLVED' || activeDispute.arbitrationCase?.status === 'IN_REVIEW'}
                                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                            >
                                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                Add to Case
                                            </button>
                                        </form>
                                    </div>

                                    {/* Escalation */}
                                    {!activeDispute.arbitrationCase && activeDispute.status !== 'RESOLVED' && (
                                        <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 space-y-4">
                                            <h4 className="font-bold text-amber-500 flex items-center gap-2">
                                                <Gavel className="w-4 h-4" />
                                                Escalation
                                            </h4>
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                If you cannot reach a mutual resolution, you can escalate to a professional human investigator.
                                                <br /><br />
                                                <span className="text-amber-400 font-bold">Fee: $25.00 deductible from your wallet.</span>
                                            </p>
                                            <button
                                                onClick={handleEscalate}
                                                disabled={escalating}
                                                className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-600/50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20"
                                            >
                                                {escalating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
                                                Escalate to Arbitration
                                            </button>
                                        </div>
                                    )}

                                    {/* Warnings if Resolved */}
                                    {activeDispute.status === 'RESOLVED' && (
                                        <div className="col-span-full p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20 space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-500">
                                                    <CheckCircle2 className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-black text-white uppercase tracking-tight">Binding Resolution Issued</h4>
                                                    <p className="text-slate-400 text-sm font-medium">This case is officially closed and funds have been distributed.</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Decision Outcome</p>
                                                    <p className="text-white font-bold italic leading-relaxed">&quot;{activeDispute.resolution}&quot;</p>
                                                </div>
                                                {activeDispute.arbitrationCase?.decision && activeDispute.arbitrationCase.decision.includes('SPLIT') && (
                                                    <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-2">
                                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Financial Split Detail</p>
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                                                <Percent className="w-4 h-4 text-indigo-400" />
                                                            </div>
                                                            <p className="text-white font-black text-lg">{activeDispute.arbitrationCase.decision.split(':')[0]}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Timeline & Evidence Trail */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 min-h-[400px]">
                                        <DisputeTimeline events={timelineEvents} />
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-slate-500 uppercase px-2 flex items-center gap-2 tracking-widest">
                                            <History className="w-4 h-4" />
                                            Evidence Trail
                                        </h4>
                                        <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                                            {activeDispute.evidence.map(ev => (
                                                <div key={ev.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-2 hover:border-slate-700 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${ev.uploaderId === userId ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                                                            {ev.uploaderId === userId ? 'My Submission' : 'Counter-Evidence'}
                                                        </span>
                                                        <a href={ev.fileUrl} target="_blank" className="text-slate-500 hover:text-white transition-colors">
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>
                                                    <p className="text-white text-sm leading-snug">{ev.description}</p>
                                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/50">
                                                        <FileText className="w-3 h-3 text-slate-600" />
                                                        <span className="text-[10px] text-slate-600 font-mono truncate max-w-[150px]">{ev.fileUrl.split('/').pop()}</span>
                                                        <span className="ml-auto text-[9px] text-slate-600">{new Date(ev.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {activeDispute.evidence.length === 0 && (
                                                <div className="p-8 text-center bg-slate-800/20 border border-dashed border-slate-800 rounded-2xl">
                                                    <Info className="w-6 h-6 text-slate-700 mx-auto mb-1" />
                                                    <p className="text-xs text-slate-600">No evidence submitted yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-900 border border-dashed border-slate-800 rounded-3xl p-12 text-center">
                                <Scale className="w-12 h-12 text-slate-700 mb-6" />
                                <h3 className="text-xl font-bold text-white mb-2">Select a Disputed Contract</h3>
                                <p className="text-slate-500 max-w-xs">Follow the resolution steps, provide proof, and reach a fair settlement.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
