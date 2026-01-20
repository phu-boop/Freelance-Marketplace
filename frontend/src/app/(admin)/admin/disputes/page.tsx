'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert,
    Loader2,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ExternalLink,
    Scale,
    Gavel,
    DollarSign,
    Clock,
    FileText,
    Percent,
    ArrowRightLeft,
    User,
    ChevronRight,
    Search
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface Evidence {
    id: string;
    fileUrl: string;
    fileType: string;
    description: string;
    uploaderId: string;
    createdAt: string;
}

interface Contract {
    id: string;
    job_id: string;
    freelancer_id: string;
    client_id: string;
    totalAmount: number;
    status: string;
    disputes: {
        id: string;
        reason: string;
        status: string;
        evidence: Evidence[];
        arbitrationCase?: {
            id: string;
            status: string;
            investigatorId?: string;
        };
        createdAt: string;
    }[];
    milestones: {
        id: string;
        title: string;
        amount: number;
        status: string;
    }[];
    job: {
        title: string;
    };
}

export default function AdminDisputesPage() {
    const [disputes, setDisputes] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [splitPercent, setSplitPercent] = useState(50);
    const [resolutionText, setResolutionText] = useState('');

    const fetchDisputes = async () => {
        setLoading(true);
        try {
            const res = await api.get('/contracts/disputed');
            setDisputes(res.data);
        } catch (error) {
            console.error('Failed to fetch disputes', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDisputes();
    }, []);

    const handleSelectContract = async (id: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/contracts/${id}`);
            setSelectedContract(res.data);
            setResolutionText('');
        } catch (error) {
            console.error('Failed to fetch contract details', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignMe = async (caseId: string) => {
        setActionLoading('assign');
        try {
            // In a real app, we'd use the current user's ID. 
            // Mocking for now as the backend uses the token's sub.
            await api.patch(`/contracts/arbitration/${caseId}/assign`, { investigatorId: 'me' });
            if (selectedContract) handleSelectContract(selectedContract.id);
        } catch (error) {
            console.error('Failed to assign investigator', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleResolveBinary = async (resolution: 'COMPLETED' | 'TERMINATED') => {
        if (!selectedContract) return;
        if (!confirm(`Are you sure you want to resolve this dispute as ${resolution}?`)) return;
        setActionLoading(resolution);
        try {
            await api.post(`/contracts/${selectedContract.id}/resolve-dispute`, { resolution });
            await fetchDisputes();
            setSelectedContract(null);
        } catch (error) {
            console.error('Failed to resolve dispute', error);
            alert('Failed to resolve dispute');
        } finally {
            setActionLoading(null);
        }
    };

    const handleResolveSplit = async () => {
        if (!selectedContract || !selectedContract.disputes[0]?.arbitrationCase) return;
        const milestone = selectedContract.milestones.find(m => m.status === 'ESCROWED' || m.status === 'UNDER_REVIEW');
        if (!milestone) return alert('No active escrowed milestone found to split.');

        setActionLoading('split');
        try {
            await api.post(`/contracts/arbitration/${selectedContract.disputes[0].arbitrationCase.id}/resolve-split`, {
                milestoneId: milestone.id,
                freelancerPercentage: splitPercent,
                decision: resolutionText || 'Settled via professional split settlement.'
            });
            await fetchDisputes();
            setSelectedContract(null);
        } catch (error) {
            console.error('Failed to resolve split', error);
            alert('Failed to process split settlement.');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading && disputes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-slate-400 animate-pulse font-medium">Scanning for active disputes...</p>
            </div>
        );
    }

    const activeDispute = selectedContract?.disputes[0];
    const clientEvidence = activeDispute?.evidence.filter(e => e.uploaderId === selectedContract?.client_id) || [];
    const freelancerEvidence = activeDispute?.evidence.filter(e => e.uploaderId === selectedContract?.freelancer_id) || [];

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto px-4 lg:px-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/50 p-6 lg:p-10 rounded-[2.5rem] border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            High Priority
                        </Badge>
                        <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {disputes.length} Cases Pending
                        </Badge>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight flex items-center gap-4">
                        <Gavel className="w-12 h-12 text-red-500" />
                        Investigator Workspace
                    </h1>
                    <p className="text-slate-400 text-lg lg:text-xl font-medium max-w-2xl">Professional dispute resolution tools for complex contract settlements.</p>
                </div>
                <div className="flex items-center gap-6 relative z-10">
                    <div className="h-16 w-px bg-slate-800 hidden md:block" />
                    <div className="text-right">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Platform Integrity</p>
                        <p className="text-3xl font-black text-white flex items-center gap-2 justify-end">
                            99.8%
                            <Scale className="w-6 h-6 text-emerald-500" />
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* List of Disputes */}
                <aside className="xl:col-span-1 space-y-4">
                    <div className="flex items-center justify-between px-2 mb-2">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Queue</h2>
                        <Search className="w-4 h-4 text-slate-600 cursor-pointer hover:text-white transition-colors" />
                    </div>
                    <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                        {disputes.map(dispute => (
                            <button
                                key={dispute.id}
                                onClick={() => handleSelectContract(dispute.id)}
                                className={`w-full p-6 rounded-3xl border transition-all text-left flex flex-col gap-3 group relative overflow-hidden ${selectedContract?.id === dispute.id
                                    ? 'bg-red-500/10 border-red-500 shadow-lg shadow-red-500/10'
                                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                                    }`}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <span className="font-extrabold text-white text-lg leading-tight group-hover:text-red-400 transition-colors truncate">
                                        {dispute.job?.title || 'Contract Dispute'}
                                    </span>
                                    <ChevronRight className={`w-5 h-5 transition-transform ${selectedContract?.id === dispute.id ? 'text-red-500 rotate-90' : 'text-slate-700'}`} />
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold font-mono">
                                    <span className="text-slate-500">#{dispute.id.slice(0, 8)}</span>
                                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                                    <span className="text-emerald-400">${Number(dispute.totalAmount).toLocaleString()}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="bg-slate-800/50 text-[10px] text-slate-400 border-slate-800">
                                        {dispute.status}
                                    </Badge>
                                </div>
                            </button>
                        ))}
                        {disputes.length === 0 && (
                            <div className="p-10 text-center bg-slate-950/50 border border-dashed border-slate-800 rounded-[2rem] space-y-4">
                                <CheckCircle className="w-12 h-12 text-emerald-500/20 mx-auto" />
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Queue Empty</p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Workspace */}
                <main className="xl:col-span-3 space-y-8">
                    <AnimatePresence mode="wait">
                        {selectedContract && activeDispute ? (
                            <motion.div
                                key={selectedContract.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                {/* Case Metadata & Parties */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Parties Comparison */}
                                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-5">
                                            <ArrowRightLeft className="w-32 h-32 text-white" />
                                        </div>
                                        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-3">
                                            <User className="w-5 h-5 text-blue-500" />
                                            Parties Involved
                                        </h3>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client (Raising Dispute)</p>
                                                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                                                    <p className="text-white font-bold truncate">{selectedContract.client_id}</p>
                                                    <p className="text-xs text-blue-400/60 font-mono mt-1">Verified Entity</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4 text-right">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Freelancer (Payee)</p>
                                                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                                    <p className="text-white font-bold truncate">{selectedContract.freelancer_id}</p>
                                                    <p className="text-xs text-emerald-400/60 font-mono mt-1">Top Rated Plus</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Evidence Lockdown Status */}
                                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                                        <div className="flex justify-between items-start mb-6">
                                            <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                                                <Clock className="w-5 h-5 text-amber-500" />
                                                Case Timeline
                                            </h3>
                                            <Badge className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${activeDispute.arbitrationCase?.status === 'IN_REVIEW' ? 'bg-amber-500/20 text-amber-400 border-amber-500/20' : 'bg-red-500/20 text-red-400 border-red-500/20'}`}>
                                                {activeDispute.arbitrationCase?.status || 'NOT ESCALATED'}
                                            </Badge>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center gap-4">
                                                <ShieldAlert className="w-8 h-8 text-red-500/40" />
                                                <div>
                                                    <p className="text-xs font-black text-red-400 uppercase tracking-widest">Lock Status</p>
                                                    <p className="text-sm text-slate-200">
                                                        {activeDispute.arbitrationCase?.status === 'OPEN'
                                                            ? 'Evidence locker is open for submissions.'
                                                            : 'Evidence locker is locked. Review in progress.'}
                                                    </p>
                                                </div>
                                            </div>
                                            {!activeDispute.arbitrationCase?.investigatorId && activeDispute.arbitrationCase && (
                                                <Button
                                                    onClick={() => handleAssignMe(activeDispute.arbitrationCase!.id)}
                                                    disabled={actionLoading === 'assign'}
                                                    className="w-full h-14 rounded-2xl bg-white text-black hover:bg-slate-200 font-black text-sm tracking-tight transition-all"
                                                >
                                                    {actionLoading === 'assign' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Claim Case for Review'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Evidence Comparison (Expert View) */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-slate-500 px-6 uppercase tracking-widest flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Evidence Discovery Bundle
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[500px]">
                                        {/* Client Side */}
                                        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col">
                                            <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                                                <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Client Submission</p>
                                                <p className="text-xs text-slate-500">{clientEvidence.length} Files</p>
                                            </div>
                                            <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
                                                {clientEvidence.map(ev => (
                                                    <div key={ev.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/30 transition-all group/ev cursor-pointer">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <p className="text-xs text-slate-400 font-medium leading-relaxed italic">&quot;{ev.description}&quot;</p>
                                                            <Link href={ev.fileUrl} target="_blank" className="p-2 rounded-lg bg-slate-800 text-slate-500 hover:text-white group-hover/ev:bg-blue-500/20 group-hover/ev:text-blue-400 transition-all">
                                                                <ExternalLink className="w-3 h-3" />
                                                            </Link>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase overflow-hidden">
                                                            <Badge variant="outline" className="text-[8px] bg-slate-900 border-slate-800">{ev.fileType}</Badge>
                                                            <span className="truncate">{ev.fileUrl.split('/').pop()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {clientEvidence.length === 0 && (
                                                    <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-20">
                                                        <FileText className="w-12 h-12 mb-4" />
                                                        <p className="text-xs font-bold uppercase tracking-widest">No Client Evidence</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Freelancer Side */}
                                        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col">
                                            <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                                                <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Freelancer Submission</p>
                                                <p className="text-xs text-slate-500">{freelancerEvidence.length} Files</p>
                                            </div>
                                            <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
                                                {freelancerEvidence.map(ev => (
                                                    <div key={ev.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/30 transition-all group/ev cursor-pointer">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <p className="text-xs text-slate-400 font-medium leading-relaxed italic">&quot;{ev.description}&quot;</p>
                                                            <Link href={ev.fileUrl} target="_blank" className="p-2 rounded-lg bg-slate-800 text-slate-500 hover:text-white group-hover/ev:bg-emerald-500/20 group-hover/ev:text-emerald-400 transition-all">
                                                                <ExternalLink className="w-3 h-3" />
                                                            </Link>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase overflow-hidden">
                                                            <Badge variant="outline" className="text-[8px] bg-slate-900 border-slate-800">{ev.fileType}</Badge>
                                                            <span className="truncate">{ev.fileUrl.split('/').pop()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {freelancerEvidence.length === 0 && (
                                                    <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-20">
                                                        <FileText className="w-12 h-12 mb-4" />
                                                        <p className="text-xs font-bold uppercase tracking-widest">No Freelancer Evidence</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Resolution Workspace */}
                                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 lg:p-12 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        <div className="space-y-8">
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                                    <Scale className="w-6 h-6 text-purple-500" />
                                                    Final Judgment
                                                </h3>
                                                <p className="text-slate-400 text-sm font-medium">Distribution logic for escrowed funds based on findings.</p>
                                            </div>

                                            {/* Split Settlement Tool */}
                                            <div className="space-y-6 bg-slate-950/50 p-8 rounded-[2rem] border border-slate-800 shadow-inner">
                                                <div className="flex justify-between items-end mb-4">
                                                    <div>
                                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Refund to Client</p>
                                                        <p className="text-3xl font-black text-white">{100 - splitPercent}%</p>
                                                    </div>
                                                    <div className="text-center w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center bg-slate-900">
                                                        <Percent className="w-4 h-4 text-slate-500" />
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Payout Freelancer</p>
                                                        <p className="text-3xl font-black text-white">{splitPercent}%</p>
                                                    </div>
                                                </div>
                                                <Slider
                                                    value={[splitPercent]}
                                                    min={0}
                                                    max={100}
                                                    step={1}
                                                    onValueChange={(val) => setSplitPercent(val[0])}
                                                    className="py-4"
                                                />
                                                <div className="flex justify-between text-[10px] text-slate-600 font-bold tracking-widest uppercase">
                                                    <span>Full Refund</span>
                                                    <span>Neutral split</span>
                                                    <span>Full Payout</span>
                                                </div>
                                            </div>

                                            <textarea
                                                placeholder="Legal Rationale: Describe the basis of this decision..."
                                                value={resolutionText}
                                                onChange={e => setResolutionText(e.target.value)}
                                                className="w-full h-40 bg-slate-950 border border-slate-800 rounded-[1.5rem] p-6 text-slate-200 text-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition-all placeholder:text-slate-700 font-medium"
                                            />
                                        </div>

                                        <div className="flex flex-col justify-end gap-4">
                                            <div className="p-6 rounded-[2rem] bg-slate-950 border border-slate-800 space-y-4 mb-auto">
                                                <h4 className="text-xs font-black text-white uppercase tracking-widest">Financial Summary</h4>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-500 font-medium">Total Escrowed</span>
                                                        <span className="text-white font-black">${Number(selectedContract.totalAmount).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-blue-400 font-medium">Client Refund</span>
                                                        <span className="text-blue-400 font-black">${((selectedContract.totalAmount * (100 - splitPercent)) / 100).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm border-b border-slate-800 pb-3">
                                                        <span className="text-emerald-400 font-medium">Freelancer Credit</span>
                                                        <span className="text-emerald-400 font-black">${((selectedContract.totalAmount * splitPercent) / 100).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={handleResolveSplit}
                                                disabled={actionLoading === 'split' || !activeDispute.arbitrationCase?.investigatorId}
                                                className="h-20 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg tracking-tight transition-all shadow-2xl shadow-indigo-600/20 active:scale-[0.98]"
                                            >
                                                {actionLoading === 'split' ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                                    <div className="flex items-center gap-3">
                                                        <ArrowRightLeft className="w-6 h-6" />
                                                        Execute Split Settlement
                                                    </div>
                                                )}
                                            </Button>

                                            <div className="grid grid-cols-2 gap-4">
                                                <Button
                                                    onClick={() => handleResolveBinary('COMPLETED')}
                                                    variant="outline"
                                                    disabled={!!actionLoading}
                                                    className="h-14 rounded-2xl border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 font-black text-xs uppercase tracking-widest transition-all"
                                                >
                                                    Full Release
                                                </Button>
                                                <Button
                                                    onClick={() => handleResolveBinary('TERMINATED')}
                                                    variant="outline"
                                                    disabled={!!actionLoading}
                                                    className="h-14 rounded-2xl border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 font-black text-xs uppercase tracking-widest transition-all"
                                                >
                                                    Full Refund
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-[800px] flex flex-col items-center justify-center bg-slate-900 border border-dashed border-slate-800 rounded-[3rem] p-12 text-center relative overflow-hidden">
                                <Scale className="w-24 h-24 text-slate-800 mb-8 animate-pulse" />
                                <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Select an Active Case</h3>
                                <p className="text-slate-500 max-w-md text-lg leading-relaxed font-medium">Review submitted evidence from both parties and issue a final binding judgment to settle the escrow funds.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
