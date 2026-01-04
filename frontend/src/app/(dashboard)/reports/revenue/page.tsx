'use client';

import React, { useState, useEffect } from 'react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import {
    Clock,
    DollarSign,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    Loader2,
    Briefcase,
    AlertCircle,
    Info
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { motion } from 'framer-motion';

interface RevenueData {
    userId: string;
    currentStats: {
        totalEarned: number;
        pendingRevenue: number;
        availableBalance: number;
    };
    historicalTrend: { month: string; amount: number }[];
    projections: { month: string; amount: number }[];
}

export default function RevenueDashboard() {
    const { userId, authenticated } = useKeycloak();
    const [data, setData] = useState<RevenueData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRevenue = async () => {
            if (!userId) return;
            try {
                const res = await api.get(`/payments/revenue/predictive/${userId}`);
                setData(res.data);
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                console.error('Failed to fetch revenue data', errorMessage);
                setError('Failed to load revenue insights. Please ensure your wallet is active.');
            } finally {
                setLoading(false);
            }
        };

        if (authenticated && userId) {
            fetchRevenue();
        }
    }, [authenticated, userId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                <p className="text-slate-400 animate-pulse">Calculating your financial forecast...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                <div className="bg-red-500/10 p-4 rounded-full mb-4">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
                <p className="text-slate-400 max-w-md">{error || 'Unable to load dashboard.'}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-2xl">
                    <p className="text-slate-400 text-xs font-medium mb-1">{label}</p>
                    <p className="text-white font-bold text-lg">${(payload[0].value).toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <TrendingUp className="text-blue-500 w-8 h-8" />
                    Predictive Revenue Dashboard
                </h1>
                <p className="text-slate-400 mt-2">
                    AI-powered insights into your earnings, pending work, and 3-month forecast.
                </p>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-3xl bg-slate-900 border border-slate-800"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-green-500/10 p-3 rounded-2xl">
                            <DollarSign className="text-green-500 w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">+12% vs LY</span>
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Total Earned (L12M)</p>
                    <h2 className="text-3xl font-bold text-white mt-1">
                        ${data.currentStats.totalEarned.toLocaleString()}
                    </h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-3xl bg-slate-900 border border-slate-800"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-yellow-500/10 p-3 rounded-2xl">
                            <Clock className="text-yellow-500 w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Pending Review</p>
                    <h2 className="text-3xl font-bold text-white mt-1">
                        ${data.currentStats.pendingRevenue.toLocaleString()}
                    </h2>
                    <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                        <Info className="w-3 h-3" /> Awaiting client approval
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-3xl bg-blue-600 shadow-xl shadow-blue-600/20"
                >
                    <div className="flex justify-between items-start mb-4 text-white">
                        <div className="bg-white/20 p-3 rounded-2xl">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">3 Month Outlook</div>
                    </div>
                    <p className="text-blue-100 text-sm font-medium">Projected Revenue</p>
                    <h2 className="text-3xl font-bold text-white mt-1">
                        ${data.projections.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                    </h2>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Historical Chart */}
                <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
                    <h3 className="text-xl font-bold text-white mb-6">Historical Earnings</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.historicalTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(str) => str.split('-')[1] + '/' + str.split('-')[0].slice(2)}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `$${val}`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                                <Bar
                                    dataKey="amount"
                                    fill="#3b82f6"
                                    radius={[6, 6, 0, 0]}
                                    barSize={30}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Projection Chart */}
                <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Revenue Projection</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-xs text-blue-400 font-medium italic">Predictive AI Active</span>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.projections}>
                                <defs>
                                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(str) => str.split('-')[1] + '/' + str.split('-')[0].slice(2)}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `$${val}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorAmt)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Forecast breakdown list */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
                <div className="p-8 border-b border-slate-800">
                    <h3 className="text-xl font-bold text-white">Upcoming Payout Forecast</h3>
                </div>
                <div className="divide-y divide-slate-800">
                    {data.projections.filter(p => p.amount > 0).length > 0 ? (
                        data.projections.filter(p => p.amount > 0).map((proj, idx) => (
                            <div key={idx} className="p-6 flex justify-between items-center hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-2xl">
                                        <Calendar className="text-blue-500 w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold">{new Date(proj.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                                        <p className="text-slate-400 text-sm">Scheduled Milestone Payouts</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-white">${proj.amount.toLocaleString()}</p>
                                    <p className="text-xs text-green-500 flex items-center justify-end gap-1">
                                        Confirmed <ArrowUpRight className="w-3 h-3" />
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-slate-500">
                            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No confirmed milestones for the projection period yet.</p>
                            <p className="text-sm mt-1">Predictions improve as you secure more contracts.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
