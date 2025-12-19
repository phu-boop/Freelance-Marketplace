'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ShieldAlert,
    Loader2,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ExternalLink,
    User,
    DollarSign,
    Clock
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

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
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Dispute Management</h1>
                <p className="text-slate-400">Review and resolve disputed contracts.</p>
            </div>

            {disputes.length === 0 ? (
                <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                    <ShieldAlert className="w-12 h-12 text-slate-700 mx-auto" />
                    <p className="text-slate-400">No active disputes found.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {disputes.map((dispute) => (
                        <motion.div
                            key={dispute.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6"
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                            <ShieldAlert className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">Contract Dispute</h3>
                                        <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-xs font-bold">
                                            {dispute.disputeStatus}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-500 uppercase font-bold">Contract ID</p>
                                            <p className="text-sm text-slate-300 font-mono">{dispute.id.slice(0, 8)}...</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-500 uppercase font-bold">Amount</p>
                                            <p className="text-sm text-emerald-400 font-bold">${dispute.totalAmount}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-500 uppercase font-bold">Opened On</p>
                                            <p className="text-sm text-slate-300">{new Date(dispute.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                        <p className="text-xs text-slate-500 uppercase font-bold">Dispute Reason</p>
                                        <p className="text-sm text-slate-300 leading-relaxed">{dispute.disputeReason}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 min-w-[200px]">
                                    <Link
                                        href={`/contracts/${dispute.id}`}
                                        target="_blank"
                                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-slate-700"
                                    >
                                        View Contract
                                        <ExternalLink className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => handleResolve(dispute.id, 'COMPLETED')}
                                        disabled={!!actionLoading}
                                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                                    >
                                        {actionLoading === dispute.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        Resolve & Pay
                                    </button>
                                    <button
                                        onClick={() => handleResolve(dispute.id, 'TERMINATED')}
                                        disabled={!!actionLoading}
                                        className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                                    >
                                        {actionLoading === dispute.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                        Terminate Contract
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
