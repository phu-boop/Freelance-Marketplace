'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUpRight, ArrowDownLeft, Wallet, FileText, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import api from '@/lib/api';
import { useCurrency } from '@/components/CurrencyProvider';
import { Skeleton } from '@/components/ui/skeleton';
import TransactionDetailsModal from './TransactionDetailsModal';

interface Transaction {
    id: string;
    amount: number;
    type: string;
    status: string;
    createdAt: string;
    description: string;
    invoice?: {
        id: string;
        invoiceNumber: string;
    };
}

interface FilterState {
    type: string;
    status: string;
}

export default function TransactionHistoryTable() {
    const { formatAmount } = useCurrency();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState<FilterState>({ type: '', status: '' });
    const limit = 10;

    // Details Modal
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                limit,
                offset: page * limit,
                ...(filters.type && { type: filters.type }),
                ...(filters.status && { status: filters.status }),
            };
            const res = await api.get('/payments/transactions', { params });
            // Handle both structure: { total, data } from backend
            setTransactions(res.data.data);
            setTotal(res.data.total);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    }, [page, filters]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(0); // Reset to first page
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'DEPOSIT': return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
            case 'WITHDRAWAL': return <ArrowUpRight className="w-5 h-5 text-red-500" />;
            default: return <Wallet className="w-5 h-5 text-blue-500" />;
        }
    };

    const getTypeBg = (type: string) => {
        switch (type) {
            case 'DEPOSIT': return 'bg-green-500/10';
            case 'WITHDRAWAL': return 'bg-red-500/10';
            default: return 'bg-blue-500/10';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-400" />
                    Transaction History
                </h3>

                {/* Filters */}
                <div className="flex gap-2">
                    <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 cursor-pointer focus:ring-2 focus:ring-blue-500/50 outline-none"
                    >
                        <option value="">All Types</option>
                        <option value="PAYMENT">Payments</option>
                        <option value="DEPOSIT">Deposits</option>
                        <option value="WITHDRAWAL">Withdrawals</option>
                        <option value="FEE">Fees</option>
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 cursor-pointer focus:ring-2 focus:ring-blue-500/50 outline-none"
                    >
                        <option value="">All Statuses</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="PENDING">Pending</option>
                        <option value="FAILED">Failed</option>
                    </select>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="divide-y divide-slate-800">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="p-4 flex justify-between">
                                <div className="flex gap-4">
                                    <Skeleton className="w-10 h-10 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="w-32 h-4" />
                                        <Skeleton className="w-24 h-3" />
                                    </div>
                                </div>
                                <Skeleton className="w-24 h-6" />
                            </div>
                        ))}
                    </div>
                ) : transactions.length > 0 ? (
                    <>
                        <div className="divide-y divide-slate-800">
                            {transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    onClick={() => setSelectedTx(tx)}
                                    className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getTypeBg(tx.type)}`}>
                                            {getTypeIcon(tx.type)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-medium truncate max-w-[200px] sm:max-w-md">
                                                {tx.description || tx.type.replace('_', ' ')}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {new Date(tx.createdAt).toLocaleDateString()} • <span className={
                                                    tx.status === 'COMPLETED' ? 'text-emerald-500' :
                                                        tx.status === 'PENDING' ? 'text-yellow-500' : 'text-slate-500'
                                                }>{tx.status}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={`text-right font-bold ${tx.type === 'DEPOSIT' || tx.type === 'PAYMENT' && tx.amount > 0 ? 'text-green-500' :
                                            tx.type === 'WITHDRAWAL' || tx.amount < 0 ? 'text-slate-200' : 'text-white'
                                            }`}>
                                            <p>{tx.amount > 0 && tx.type !== 'WITHDRAWAL' ? '+' : ''}{formatAmount(Number(tx.amount))}</p>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-sm text-slate-400">
                            <p>Showing {Math.min(limit, transactions.length)} of {total} transactions</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="p-2 hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page * limit + transactions.length >= total}
                                    className="p-2 hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="p-12 text-center space-y-3">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                            <Filter className="w-8 h-8 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-white font-bold">No transactions found</p>
                            <p className="text-slate-500 text-sm">Try adjusting your filters.</p>
                        </div>
                    </div>
                )}
            </div>

            <TransactionDetailsModal
                isOpen={!!selectedTx}
                onClose={() => setSelectedTx(null)}
                transaction={selectedTx}
            />
        </div>
    );
}
