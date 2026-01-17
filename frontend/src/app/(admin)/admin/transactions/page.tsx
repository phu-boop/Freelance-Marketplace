'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2,
    RefreshCcw,
    Search,
    Filter,
    History,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    ArrowRight,
    Edit3
} from 'lucide-react';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    const ITEMS_PER_PAGE = 20;

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payments/admin/transactions', {
                params: {
                    limit: ITEMS_PER_PAGE,
                    offset: page * ITEMS_PER_PAGE,
                    type: typeFilter || undefined,
                    status: statusFilter || undefined
                }
            });
            setTransactions(res.data.data);
            setTotal(res.data.total);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page, typeFilter, statusFilter]);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
        setUpdatingStatus(id);
        try {
            await api.patch(`/payments/transactions/${id}`, { status: newStatus });
            await fetchTransactions();
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Update failed');
        } finally {
            setUpdatingStatus(null);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-sm">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <History className="w-10 h-10 text-blue-500" />
                        Transaction Audit
                    </h1>
                    <p className="text-slate-400 text-lg">System-wide monitoring and override for all financial movements.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-6 py-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                        <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Total Records</p>
                        <p className="text-2xl font-black text-white">{total.toLocaleString()}</p>
                    </div>
                    <Button
                        onClick={fetchTransactions}
                        variant="outline"
                        size="icon"
                        className="rounded-xl border-slate-700 hover:bg-slate-800"
                    >
                        <RefreshCcw className={cn("w-5 h-5", loading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex gap-2 flex-1">
                    <select
                        value={typeFilter}
                        onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
                        className="bg-slate-900 border border-slate-800 rounded-2xl px-4 h-14 text-white focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
                    >
                        <option value="">All Types</option>
                        <option value="PAYMENT">Payment</option>
                        <option value="WITHDRAWAL">Withdrawal</option>
                        <option value="DEPOSIT">Deposit</option>
                        <option value="ESCROW_FUND">Escrow Fund</option>
                        <option value="ESCROW_RELEASE">Escrow Release</option>
                        <option value="SUBSCRIPTION">Subscription</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                        className="bg-slate-900 border border-slate-800 rounded-2xl px-4 h-14 text-white focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
                    >
                        <option value="">All Statuses</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="PENDING">Pending</option>
                        <option value="PENDING_APPROVAL">Awaiting Approval</option>
                        <option value="REFUNDED">Refunded</option>
                        <option value="DISPUTED">Disputed</option>
                        <option value="FAILED">Failed</option>
                    </select>
                </div>

                <div className="flex gap-2">
                    <Button
                        disabled={page === 0}
                        onClick={() => setPage(p => p - 1)}
                        variant="outline"
                        className="bg-slate-900 border-slate-800 h-14 rounded-2xl px-6 text-slate-400 hover:text-white"
                    >
                        Previous
                    </Button>
                    <div className="h-14 flex items-center justify-center px-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 font-mono text-sm">
                        Page {page + 1}
                    </div>
                    <Button
                        disabled={(page + 1) * ITEMS_PER_PAGE >= total}
                        onClick={() => setPage(p => p + 1)}
                        variant="outline"
                        className="bg-slate-900 border-slate-800 h-14 rounded-2xl px-6 text-slate-400 hover:text-white"
                    >
                        Next
                    </Button>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950 border-b border-slate-800">
                                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Transaction Details</th>
                                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">User / Wallet</th>
                                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Amount</th>
                                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
                                        <p className="mt-4 text-slate-400 font-medium">Fetching global audit logs...</p>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="w-8 h-8 text-slate-600" />
                                        </div>
                                        <p className="text-slate-400 text-lg font-medium">No records matching your search criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="p-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter",
                                                        ['DEPOSIT', 'PAYMENT', 'ESCROW_RELEASE'].includes(tx.type) ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                    )}>
                                                        {tx.type}
                                                    </span>
                                                    <span className="text-xs text-slate-500 font-mono">{tx.id.slice(0, 8)}...</span>
                                                </div>
                                                <p className="text-white font-bold">{tx.description || 'No description'}</p>
                                                <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</p>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                                                    <User className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-bold text-slate-300">User ID</p>
                                                    <p className="text-sm font-mono text-slate-500">{tx.wallet?.userId || 'Unknown'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <Badge className={cn(
                                                "font-bold px-3 py-1 rounded-lg",
                                                tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                    tx.status === 'PENDING' || tx.status === 'PENDING_APPROVAL' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                        'bg-red-500/10 text-red-500 border border-red-500/20'
                                            )}>
                                                {tx.status.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="p-6 text-right">
                                            <p className={cn(
                                                "text-xl font-black",
                                                ['DEPOSIT', 'PAYMENT', 'ESCROW_RELEASE'].includes(tx.type) ? 'text-emerald-400' : 'text-slate-300'
                                            )}>
                                                {['DEPOSIT', 'PAYMENT', 'ESCROW_RELEASE'].includes(tx.type) ? '+' : '-'}${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                            {tx.feeAmount > 0 && (
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                                    Fee: ${Number(tx.feeAmount).toFixed(2)}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-10 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500"
                                                    onClick={() => handleUpdateStatus(tx.id, 'COMPLETED')}
                                                    disabled={updatingStatus === tx.id || tx.status === 'COMPLETED'}
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Complete
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-10 rounded-xl hover:bg-red-500/10 hover:text-red-500"
                                                    onClick={() => handleUpdateStatus(tx.id, 'REFUNDED')}
                                                    disabled={updatingStatus === tx.id || tx.status === 'REFUNDED'}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Refund
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
