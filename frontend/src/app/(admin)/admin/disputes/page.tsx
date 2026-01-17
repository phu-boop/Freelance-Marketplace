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
    User,
    DollarSign,
    Clock,
    RefreshCcw,
    Scale,
    Gavel
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Contract {
    id: string;
    job_id: string;
    freelancer_id: string;
    client_id: string;
    totalAmount: number;
    status: string;
    disputeStatus: string;
    disputeReason: string;
    createdAt: string;
}

export default function AdminDisputesPage() {
    const [disputes, setDisputes] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

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

    const handleResolve = async (id: string, resolution: 'COMPLETED' | 'TERMINATED') => {
        if (!confirm(`Are you sure you want to resolve this dispute as ${resolution}?`)) return;
        setActionLoading(id);
        try {
            await api.post(`/contracts/${id}/resolve-dispute`, { resolution });
            await fetchDisputes();
        } catch (error) {
            console.error('Failed to resolve dispute', error);
            alert('Failed to resolve dispute');
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

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-sm shadow-xl">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <Gavel className="w-10 h-10 text-red-500" />
                        Dispute Resolution Center
                    </h1>
                    <p className="text-slate-400 text-lg">Investigate and resolve conflicts between clients and freelancers.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
                        <p className="text-xs text-red-400 font-bold uppercase tracking-wider">Active Disputes</p>
                        <p className="text-2xl font-black text-white">{disputes.length}</p>
                    </div>
                </div>
            </div>

            {disputes.length === 0 ? (
                <div className="p-20 text-center bg-slate-900/50 border border-slate-800 rounded-3xl space-y-6">
                    <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto border-4 border-slate-900">
                        <CheckCircle className="w-12 h-12 text-emerald-500/50" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white">All clear!</h3>
                        <p className="text-slate-400 max-w-md mx-auto">There are currently no active disputes requiring moderator attention.</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-8">
                    <AnimatePresence mode="popLayout">
                        {disputes.map((dispute) => (
                            <motion.div
                                key={dispute.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-8 shadow-2xl hover:border-slate-700 transition-all group"
                            >
                                <div className="flex flex-col md:flex-row justify-between gap-8">
                                    <div className="space-y-6 flex-1">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 group-hover:bg-red-500/20 transition-colors">
                                                <ShieldAlert className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white tracking-tight">Contract Dispute</h3>
                                                <p className="text-slate-500 text-sm font-medium">Resolution Required</p>
                                            </div>
                                            <Badge className="ml-2 px-4 py-1.5 bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-xs font-black uppercase tracking-tighter">
                                                {dispute.disputeStatus}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-950/50 p-6 rounded-2xl border border-slate-800/50">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Amount</p>
                                                <p className="text-xl font-black text-emerald-400 flex items-center gap-1">
                                                    <DollarSign className="w-4 h-4" />
                                                    {Number(dispute.totalAmount).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Opened On</p>
                                                <div className="flex items-center gap-2 text-slate-300 font-bold">
                                                    <Clock className="w-4 h-4 text-slate-500" />
                                                    {new Date(dispute.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Client</p>
                                                <p className="text-sm text-slate-300 font-mono truncate">{dispute.client_id.slice(0, 12)}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Freelancer</p>
                                                <p className="text-sm text-slate-300 font-mono truncate">{dispute.freelancer_id.slice(0, 12)}</p>
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-3 relative overflow-hidden group/reason">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/reason:opacity-20 transition-opacity">
                                                <AlertTriangle className="w-12 h-12 text-red-500" />
                                            </div>
                                            <p className="text-[10px] text-red-400 font-black uppercase tracking-widest">Stated Reason</p>
                                            <p className="text-sm text-slate-200 leading-relaxed font-medium italic">"{dispute.disputeReason}"</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 min-w-[240px]">
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="h-12 rounded-xl border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-white font-bold transition-all"
                                        >
                                            <Link href={`/contracts/${dispute.id}`} target="_blank">
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                Review Evidence
                                            </Link>
                                        </Button>

                                        <div className="h-px bg-slate-800 my-2" />

                                        <Button
                                            onClick={() => handleResolve(dispute.id, 'COMPLETED')}
                                            disabled={!!actionLoading}
                                            className="h-14 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm tracking-tight transition-all shadow-lg shadow-emerald-600/20"
                                        >
                                            {actionLoading === dispute.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                                            Resolve & Release Funds
                                        </Button>

                                        <Button
                                            onClick={() => handleResolve(dispute.id, 'TERMINATED')}
                                            disabled={!!actionLoading}
                                            className="h-14 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm tracking-tight transition-all shadow-lg shadow-red-600/20"
                                        >
                                            {actionLoading === dispute.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5 mr-2" />}
                                            Terminate & Refund
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
