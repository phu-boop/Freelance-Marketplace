'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowUpRight, DollarSign, Wallet, Download, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import RevenueChart from '@/components/agency/financials/RevenueChart';
import TransactionList from '@/components/agency/financials/TransactionList';

export default function AgencyFinancialsPage() {
    const params = useParams();
    const router = useRouter();
    const agencyId = params?.agencyId as string;

    const [loading, setLoading] = useState(true);
    const [wallet, setWallet] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!agencyId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Wallet
                const walletRes = await api.get(`/payments/wallet/agency/${agencyId}`);
                setWallet(walletRes.data);

                // 2. Fetch Recent Transactions
                const txRes = await api.get(`/payments/transactions/agency/${agencyId}?limit=5`);
                setTransactions(txRes.data.data);

                // 3. Mock Revenue Data (since we don't have a specific endpoint for aggregated chart data yet)
                // In production, we'd use txRes data to build this or a refined endpoint
                const mockData = [
                    { date: 'Jan', amount: 4000 },
                    { date: 'Feb', amount: 3000 },
                    { date: 'Mar', amount: 2000 },
                    { date: 'Apr', amount: 2780 },
                    { date: 'May', amount: 1890 },
                    { date: 'Jun', amount: 2390 },
                    { date: 'Jul', amount: 3490 },
                ];
                setRevenueData(mockData);

            } catch (err: any) {
                console.error('Failed to fetch financial data', err);
                setError('Failed to load financial data. You may not have permission to view this agency.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [agencyId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[600px] bg-slate-950">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-slate-950 min-h-screen">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-full mb-4">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-bold">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8 space-y-8">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Financial Overview
                    </h1>
                    <p className="text-slate-400 mt-2">Track your agency's earnings, payouts, and transactions.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => router.push(`/agency/${agencyId}/financials/transactions`)}
                        className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 transition-all font-medium text-sm flex items-center gap-2"
                    >
                        View All Activity
                    </button>
                    <button
                        onClick={() => router.push(`/agency/${agencyId}/financials/payouts`)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                    >
                        <Wallet className="w-4 h-4" />
                        Withdraw Funds
                    </button>
                </div>
            </header>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/30 rounded-3xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-24 h-24 rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-blue-200 mb-1">Available Balance</p>
                        <h2 className="text-4xl font-bold text-white mb-2">
                            ${Number(wallet?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-blue-300 bg-blue-500/20 w-fit px-2 py-1 rounded-lg">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            Ready for payout
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 bg-slate-900 border border-slate-800 rounded-3xl"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                            <ClockIcon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-1">
                        ${Number(wallet?.pendingBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h2>
                    <p className="text-xs text-slate-500">In escrow or clearance</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 bg-slate-900 border border-slate-800 rounded-3xl"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Earned</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-1">
                        {/* Mock Total for now, real app would sum completed transactions */}
                        $12,450.00
                    </h2>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        +12% this month
                    </p>
                </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 space-y-6">
                    <RevenueChart data={revenueData} />
                </div>

                {/* Recent Activity */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
                    </div>
                    <TransactionList transactions={transactions} />
                </div>
            </div>
        </div>
    );
}

function ClockIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
    )
}
