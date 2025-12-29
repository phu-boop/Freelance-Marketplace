'use client';

import React from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Wallet, ArrowDownLeft, ArrowUpRight, Clock, DollarSign, History } from 'lucide-react';

export default function PaymentsPage() {
    const [wallet, setWallet] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchWallet = async () => {
            try {
                const res = await api.get('/payments/wallet');
                setWallet(res.data);
            } catch (error) {
                console.error('Failed to fetch wallet', error);
            } finally {
                setLoading(false);
            }
        };
        fetchWallet();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-6">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Financial Overview</h1>
                        <p className="text-slate-400">Manage your earnings, withdrawals, and transactions</p>
                    </div>
                </div>

                {/* Wallet Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Available Balance */}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Wallet className="w-24 h-24 text-green-500" />
                        </div>
                        <div>
                            <div className="text-slate-400 text-sm font-medium mb-1">Available Balance</div>
                            <div className="text-3xl font-bold text-white">${Number(wallet?.balance || 0).toFixed(2)}</div>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-xl font-medium transition-colors text-sm">
                                Withdraw
                            </button>
                        </div>
                    </div>

                    {/* Pending Balance */}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Clock className="w-24 h-24 text-yellow-500" />
                        </div>
                        <div>
                            <div className="text-slate-400 text-sm font-medium mb-1">Pending Clearance</div>
                            <div className="text-3xl font-bold text-white">${Number(wallet?.pendingBalance || 0).toFixed(2)}</div>
                        </div>
                        <div className="mt-8">
                            <div className="text-xs text-slate-500 bg-slate-800/50 p-2 rounded-lg">
                                Funds clear automatically after 5 days
                            </div>
                        </div>
                    </div>

                    {/* Total Earnings (Mockup for now) */}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <History className="w-24 h-24 text-blue-500" />
                        </div>
                        <div>
                            <div className="text-slate-400 text-sm font-medium mb-1">Total Earnings</div>
                            <div className="text-3xl font-bold text-white">$0.00</div>
                        </div>
                        <div className="mt-8">
                            <div className="text-xs text-slate-500">
                                Lifetime earnings on the platform
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                    </div>
                    <div>
                        {wallet?.transactions && wallet.transactions.length > 0 ? (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4 font-medium">Date</th>
                                        <th className="p-4 font-medium">Description</th>
                                        <th className="p-4 font-medium">Type</th>
                                        <th className="p-4 font-medium">Review Date</th>
                                        <th className="p-4 font-medium text-right">Amount</th>
                                        <th className="p-4 font-medium text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                                    {wallet.transactions.map((tx: any) => (
                                        <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4 whitespace-nowrap">
                                                {new Date(tx.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 max-w-xs truncate" title={tx.description}>
                                                {tx.description || '-'}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${tx.type === 'DEPOSIT' ? 'bg-green-500/10 text-green-500' :
                                                        tx.type === 'WITHDRAWAL' ? 'bg-red-500/10 text-red-500' :
                                                            'bg-blue-500/10 text-blue-500'
                                                    }`}>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-500 text-xs">
                                                {tx.clearedAt && tx.status === 'PENDING' ? (
                                                    <span className="flex items-center gap-1 text-yellow-500">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(tx.clearedAt).toLocaleDateString()}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className={`p-4 text-right font-medium ${['DEPOSIT', 'PAYMENT'].includes(tx.type) ? 'text-green-400' : 'text-white'
                                                }`}>
                                                {['DEPOSIT', 'PAYMENT'].includes(tx.type) ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${tx.status === 'COMPLETED' ? 'text-green-500' :
                                                        tx.status === 'PENDING' ? 'text-yellow-500' :
                                                            'text-red-500'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-12 text-center text-slate-500">
                                No transactions found
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
