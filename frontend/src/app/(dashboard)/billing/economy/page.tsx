'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Coins,
    CreditCard,
    History,
    TrendingUp,
    Zap,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import api from '@/lib/api';

export default function EconomyDashboard() {
    const [balance, setBalance] = useState<number>(0);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [balanceRes, historyRes] = await Promise.all([
                api.get('/payments/connects/balance'),
                api.get('/payments/connects/history')
            ]);
            setBalance(balanceRes.data.balance); // Assuming response format { balance: 10 }
            setHistory(historyRes.data);
        } catch (err) {
            console.error('Failed to fetch economy data', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (bundleId: string) => {
        setPurchasing(bundleId);
        try {
            await api.post('/payments/connects/purchase', { bundleId });
            // Refresh data
            await fetchData();
            alert('Purchase successful!');
        } catch (err: any) {
            console.error('Purchase failed', err);
            alert(err.response?.data?.message || 'Purchase failed');
        } finally {
            setPurchasing(null);
        }
    };

    const bundles = [
        { id: 'bundle_10', amount: 10, price: 1.50, popular: false },
        { id: 'bundle_50', amount: 50, price: 7.00, popular: true },
        { id: 'bundle_100', amount: 100, price: 12.00, popular: false },
    ];

    return (
        <div className="min-h-screen bg-slate-950 p-8 space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/10 rounded-xl">
                            <Coins className="w-8 h-8 text-yellow-500" />
                        </div>
                        Connects & Economy
                    </h1>
                    <p className="text-slate-500 mt-2">Manage your bidding power and transaction history.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Current Balance</p>
                    <div className="text-4xl font-bold text-white flex items-center justify-end gap-2">
                        {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : balance}
                        <span className="text-lg text-yellow-500 font-normal">Connects</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Purchase Bundles */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-400" /> Buy Connects
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {bundles.map((bundle) => (
                            <motion.div
                                key={bundle.id}
                                whileHover={{ y: -5 }}
                                className={`relative bg-slate-900 border ${bundle.popular ? 'border-blue-500 shadow-blue-500/20 shadow-lg' : 'border-slate-800'} rounded-2xl p-6 flex flex-col items-center text-center`}
                            >
                                {bundle.popular && (
                                    <div className="absolute -top-3 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase rounded-full tracking-wider">
                                        Best Value
                                    </div>
                                )}
                                <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                                    <Coins className="w-8 h-8 text-yellow-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">{bundle.amount} Connects</h3>
                                <p className="text-slate-400 text-sm mt-1 mb-6">Perfect for {Math.floor(bundle.amount / 2)} proposals</p>
                                <div className="mt-auto w-full">
                                    <button
                                        onClick={() => handlePurchase(bundle.id)}
                                        disabled={purchasing === bundle.id}
                                        className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${bundle.popular
                                                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                                            }`}
                                    >
                                        {purchasing === bundle.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>Buy for ${bundle.price.toFixed(2)}</>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Features relying on Connects */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Why use Connects?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-slate-200">Submit Proposals</h4>
                                    <p className="text-sm text-slate-500">Apply to jobs. Most require 2-6 connects.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-slate-200">Boost Your Profile</h4>
                                    <p className="text-sm text-slate-500">Feature your profile in search results.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-slate-200">Availability Badge</h4>
                                    <p className="text-sm text-slate-500">Show clients you are ready to work now.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-full">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <History className="w-5 h-5 text-slate-400" /> History
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-4 max-h-[600px] pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="text-center py-10 text-slate-500">Loading history...</div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 italic">No transactions yet.</div>
                        ) : (
                            history.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center p-3 hover:bg-slate-800/50 rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${item.type === 'PURCHASE' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                                            {item.type === 'PURCHASE' ? <CreditCard className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{item.type === 'PURCHASE' ? 'Purchase' : 'Reward'}</p>
                                            <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className={`text-sm font-bold ${item.amount > 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                                        {item.amount > 0 ? '+' : ''}{item.amount}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
