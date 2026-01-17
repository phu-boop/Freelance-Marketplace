'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DollarSign,
    Loader2,
    ShieldCheck,
    AlertCircle,
    ArrowRight,
    RefreshCcw,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    CreditCard
} from 'lucide-react';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Milestone {
    id: string;
    description: string;
    amount: number;
    status: string;
    escrowStatus: string;
}

interface Contract {
    id: string;
    freelancer_id: string;
    client_id: string;
    totalAmount: number;
    status: string;
    milestones: Milestone[];
    createdAt: string;
}

export default function AdminPaymentsPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

    const fetchContracts = async () => {
        setLoading(true);
        try {
            // Fetch all contracts (admin role should allow this)
            const res = await api.get('/contracts');
            // Filter only those with at least one FUNDED milestone for this page
            const escrowContracts = res.data.filter((c: Contract) =>
                c.milestones.some(m => m.escrowStatus === 'FUNDED')
            );
            setContracts(escrowContracts);
        } catch (error) {
            console.error('Failed to fetch contracts', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContracts();
    }, []);

    const handleRelease = async (contractId: string, milestoneId: string, freelancerId: string) => {
        if (!confirm('Release these funds to the freelancer?')) return;
        setActionLoading(milestoneId);
        try {
            await api.post('/payments/escrow/release', {
                contractId,
                milestoneId,
                freelancerId
            });
            await fetchContracts();
        } catch (error) {
            console.error('Release failed', error);
            alert('Failed to release funds');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRefund = async (contractId: string, milestoneId: string) => {
        if (!confirm('Refund these funds back to the client?')) return;
        setActionLoading(milestoneId);
        try {
            await api.post('/payments/escrow/refund', {
                contractId,
                milestoneId
            });
            await fetchContracts();
        } catch (error) {
            console.error('Refund failed', error);
            alert('Failed to refund funds');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredContracts = contracts.filter(c =>
        (c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.client_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.freelancer_id.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedStatus === 'ALL' || c.status === selectedStatus)
    );

    if (loading && contracts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
                <p className="text-slate-400 animate-pulse font-medium">Loading escrow data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-sm">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <CreditCard className="w-10 h-10 text-red-500" />
                        Escrow Management
                    </h1>
                    <p className="text-slate-400 text-lg">Manage and resolve secure funds held for active contracts.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
                        <p className="text-xs text-red-400 font-bold uppercase tracking-wider">Total in Escrow</p>
                        <p className="text-2xl font-black text-white">
                            ${contracts.reduce((acc, c) => acc + c.milestones.filter(m => m.escrowStatus === 'FUNDED').reduce((macc, m) => macc + Number(m.amount), 0), 0).toLocaleString()}
                        </p>
                    </div>
                    <Button
                        onClick={fetchContracts}
                        variant="outline"
                        size="icon"
                        className="rounded-xl border-slate-700 hover:bg-slate-800"
                    >
                        <RefreshCcw className={cn("w-5 h-5", loading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                        placeholder="Search by Contract, Client or Freelancer ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 bg-slate-900 border-slate-800 rounded-2xl h-14 text-white focus:ring-red-500/50 transition-all shadow-lg"
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'ACTIVE', 'DISPUTED'].map((status) => (
                        <Button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            variant={selectedStatus === status ? 'default' : 'outline'}
                            className={cn(
                                "rounded-2xl px-6 h-14 font-bold transition-all",
                                selectedStatus === status
                                    ? "bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/20 text-white"
                                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                            )}
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </div>

            {filteredContracts.length === 0 ? (
                <div className="p-20 text-center bg-slate-900/50 border border-slate-800 rounded-3xl space-y-6">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                        <ShieldCheck className="w-10 h-10 text-slate-600" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white">No active escrow holds</h3>
                        <p className="text-slate-400 max-w-md mx-auto">Either all funds have been released, or there are no funded milestones matching your search.</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredContracts.map((contract) => (
                            <motion.div
                                key={contract.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl hover:border-slate-700 transition-colors"
                            >
                                <div className="p-6 md:p-8 bg-slate-800/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-xl font-bold text-white tracking-tight">Contract: {contract.id.slice(0, 13)}...</h2>
                                            <Badge className={cn(
                                                "font-bold px-3 py-1 rounded-lg",
                                                contract.status === 'DISPUTED' ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20'
                                            )}>
                                                {contract.status}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-slate-400 bg-slate-950/50 px-3 py-1.5 rounded-xl border border-slate-800">
                                                <span className="font-bold text-slate-500">CLIENT</span>
                                                <span className="font-mono text-slate-300">{contract.client_id.slice(0, 8)}...</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 bg-slate-950/50 px-3 py-1.5 rounded-xl border border-slate-800">
                                                <span className="font-bold text-slate-500">FREELANCER</span>
                                                <span className="font-mono text-slate-300">{contract.freelancer_id.slice(0, 8)}...</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-3xl font-black text-white">${Number(contract.totalAmount).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="p-6 md:p-8 space-y-6">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Funded Milestones</h3>
                                    <div className="space-y-4">
                                        {contract.milestones.filter(m => m.escrowStatus === 'FUNDED').map((milestone) => (
                                            <div
                                                key={milestone.id}
                                                className="group p-6 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                                            >
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                                                            <DollarSign className="w-5 h-5 text-red-500" />
                                                        </div>
                                                        <p className="text-white font-bold text-lg">{milestone.description}</p>
                                                    </div>
                                                    <p className="text-2xl font-black text-white ml-1.5">${Number(milestone.amount).toLocaleString()}</p>
                                                </div>

                                                <div className="flex items-center gap-3 w-full md:w-auto">
                                                    <Button
                                                        onClick={() => handleRefund(contract.id, milestone.id)}
                                                        disabled={!!actionLoading}
                                                        variant="destructive"
                                                        className="flex-1 md:flex-initial h-12 px-6 rounded-xl font-bold bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-600/5 group/btn"
                                                    >
                                                        {actionLoading === milestone.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                                                        Refund Client
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleRelease(contract.id, milestone.id, contract.freelancer_id)}
                                                        disabled={!!actionLoading}
                                                        className="flex-1 md:flex-initial h-12 px-6 rounded-xl font-bold bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all shadow-lg shadow-emerald-600/5 group/btn"
                                                    >
                                                        {actionLoading === milestone.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                                        Release Funds
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
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

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
