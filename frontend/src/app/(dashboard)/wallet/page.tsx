'use client';

import React, { useState, useEffect } from 'react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, Loader2, Plus } from 'lucide-react';
import DepositModal from '@/components/DepositModal';

interface Transaction {
    id: string;
    amount: number;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'FEE';
    status: string;
    createdAt: string;
    description: string;
}

interface WalletData {
    id: string;
    balance: number;
    currency: string;
    transactions: Transaction[];
}

export default function WalletPage() {
    const { userId, authenticated } = useKeycloak();
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDepositOpen, setIsDepositOpen] = useState(false);

    const fetchWallet = async () => {
        if (!userId) return;
        try {
            const res = await api.get(`/payments/wallet/${userId}`);
            setWallet(res.data);
        } catch (error) {
            console.error('Failed to fetch wallet', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authenticated && userId) {
            fetchWallet();
        }
    }, [authenticated, userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">My Wallet</h1>
                <p className="text-slate-400">Manage your earnings and funds.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance Card */}
                <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Wallet className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 space-y-6">
                        <div>
                            <p className="text-blue-200 font-medium">Total Balance</p>
                            <h2 className="text-5xl font-bold mt-2">
                                ${Number(wallet?.balance || 0).toFixed(2)}
                            </h2>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsDepositOpen(true)}
                                className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Deposit
                            </button>
                            <button className="px-6 py-3 bg-blue-700/50 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors border border-blue-400/30">
                                Withdraw
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-center space-y-4">
                    <div className="space-y-1">
                        <p className="text-slate-400 text-sm">Total Earnings</p>
                        <p className="text-2xl font-bold text-white">$0.00</p>
                    </div>
                    <div className="h-px bg-slate-800" />
                    <div className="space-y-1">
                        <p className="text-slate-400 text-sm">Pending Clearance</p>
                        <p className="text-2xl font-bold text-slate-300">$0.00</p>
                    </div>
                </div>
            </div>

            {/* Transactions */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-slate-400" />
                    Recent Transactions
                </h3>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    {wallet?.transactions && wallet.transactions.length > 0 ? (
                        <div className="divide-y divide-slate-800">
                            {wallet.transactions.map((tx) => (
                                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'DEPOSIT' ? 'bg-green-500/10 text-green-500' :
                                            tx.type === 'WITHDRAWAL' ? 'bg-red-500/10 text-red-500' :
                                                'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            {tx.type === 'DEPOSIT' ? <ArrowDownLeft className="w-5 h-5" /> :
                                                tx.type === 'WITHDRAWAL' ? <ArrowUpRight className="w-5 h-5" /> :
                                                    <Wallet className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{tx.description || tx.type}</p>
                                            <p className="text-sm text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className={`text-lg font-bold ${tx.type === 'DEPOSIT' ? 'text-green-500' :
                                        tx.type === 'WITHDRAWAL' ? 'text-white' : 'text-white'
                                        }`}>
                                        {tx.type === 'DEPOSIT' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            No transactions yet.
                        </div>
                    )}
                </div>
            </div>

            <DepositModal
                isOpen={isDepositOpen}
                onClose={() => setIsDepositOpen(false)}
                onSuccess={fetchWallet}
            />
        </div>
    );
}
