'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign,
    TrendingUp,
    Users,
    CreditCard,
    Activity,
    Download,
    Filter
} from 'lucide-react';
import api from '@/lib/api';

export default function MonetizationDashboard() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [stats, setStats] = useState({
        revenue: 0,
        connectsSold: 0,
        activeSubscriptions: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payments/admin/transactions?limit=20');
            setTransactions(res.data.data);

            // Mock stats calculation from fetched data or separate endpoint
            // In a real app, this would come from an analytics endpoint
            const rev = res.data.data.reduce((acc: number, tx: any) => acc + Number(tx.amount), 0);
            setStats({
                revenue: Math.abs(rev), // Just a rough estimate for demo
                connectsSold: 1250,
                activeSubscriptions: 342
            });
        } catch (err) {
            console.error('Failed to fetch monetization data', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8 space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Monetization Overview</h1>
                    <p className="text-slate-500 mt-1">Platform revenue, subscriptions, and economy health.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">+12.5%</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">${stats.revenue.toLocaleString()}</div>
                    <div className="text-sm text-slate-500">Total Revenue (Last 30d)</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">+5.2%</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stats.connectsSold.toLocaleString()}</div>
                    <div className="text-sm text-slate-500">Connects Sold</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">+8.1%</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stats.activeSubscriptions}</div>
                    <div className="text-sm text-slate-500">Active Subscriptions</div>
                </motion.div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-slate-400" /> Recent Transactions
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950 text-slate-400 text-sm uppercas tracking-wider">
                            <tr>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">Type</th>
                                <th className="p-4 font-medium">Description</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">Loading transactions...</td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">No transactions found.</td>
                                </tr>
                            ) : (
                                transactions.map((tx: any) => (
                                    <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 text-slate-300">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs font-bold">
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-300 max-w-xs truncate">{tx.description}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${tx.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' :
                                                    tx.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                                                        'bg-red-500/10 text-red-400'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-mono font-bold text-white">
                                            ${Math.abs(Number(tx.amount)).toFixed(2)}
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
