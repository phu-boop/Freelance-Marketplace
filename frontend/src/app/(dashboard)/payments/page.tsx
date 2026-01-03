'use client';

import React from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Wallet, ArrowDownLeft, ArrowUpRight, Clock, DollarSign, History, TrendingUp, Calendar } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

export default function PaymentsPage() {
    const [wallet, setWallet] = React.useState<any>(null);
    const [stats, setStats] = React.useState<any[]>([]);
    const [methods, setMethods] = React.useState<any[]>([]);
    const [period, setPeriod] = React.useState<'daily' | 'weekly' | 'monthly'>('monthly');
    const [loading, setLoading] = React.useState(true);
    const [showAutoWithdrawModal, setShowAutoWithdrawModal] = React.useState(false);
    const [autoWithdrawSettings, setAutoWithdrawSettings] = React.useState({
        enabled: false,
        threshold: '0',
        schedule: 'MONTHLY',
        methodId: ''
    });

    React.useEffect(() => {
        const fetchWallet = async () => {
            try {
                const res = await api.get('/payments/wallet');
                setWallet(res.data);
                setAutoWithdrawSettings({
                    enabled: res.data.autoWithdrawalEnabled || false,
                    threshold: res.data.autoWithdrawalThreshold?.toString() || '0',
                    schedule: res.data.autoWithdrawalSchedule || 'MONTHLY',
                    methodId: res.data.autoWithdrawalMethodId || ''
                });
            } catch (error) {
                console.error('Failed to fetch wallet', error);
            }
        };

        const fetchMethods = async () => {
            try {
                const res = await api.get('/payments/withdrawal-methods');
                setMethods(res.data);
            } catch (error) {
                console.error('Failed to fetch methods', error);
            }
        };

        const fetchStats = async () => {
            try {
                const res = await api.get(`/payments/earnings/stats?period=${period}`);
                setStats(res.data);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            }
        };

        const loadAll = async () => {
            setLoading(true);
            await Promise.all([fetchWallet(), fetchStats(), fetchMethods()]);
            setLoading(false);
        };

        loadAll();
    }, [period]);

    const handleUpdateAutoWithdraw = async () => {
        try {
            await api.patch('/payments/wallet/auto-withdrawal', autoWithdrawSettings);
            setShowAutoWithdrawModal(false);
            // Refresh wallet
            const res = await api.get('/payments/wallet');
            setWallet(res.data);
        } catch (error) {
            console.error('Failed to update auto-withdraw settings', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    const totalEarnings = stats.reduce((acc, curr) => acc + curr.totalEarnings, 0);

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

                    {/* Total Earnings */}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp className="w-24 h-24 text-blue-500" />
                        </div>
                        <div>
                            <div className="text-slate-400 text-sm font-medium mb-1">Total Earnings</div>
                            <div className="text-3xl font-bold text-white">${totalEarnings.toFixed(2)}</div>
                        </div>
                        <div className="mt-8">
                            <div className="text-xs text-slate-400 bg-blue-500/10 inline-block px-2 py-1 rounded">
                                Lifetime Income
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-white">Earnings History</h2>
                            <p className="text-sm text-slate-400">Visualization of your income growth</p>
                        </div>
                        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${period === p
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-80 w-full">
                        {stats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis
                                        dataKey="period"
                                        stroke="#64748b"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => {
                                            if (period === 'monthly') {
                                                const [y, m] = val.split('-');
                                                return new Date(parseInt(y), parseInt(m) - 1).toLocaleString('default', { month: 'short' });
                                            }
                                            return val;
                                        }}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => `$${val}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{
                                            backgroundColor: '#0f172a',
                                            border: '1px solid #1e293b',
                                            borderRadius: '12px',
                                            color: '#fff'
                                        }}
                                        formatter={(val: number) => [`$${val.toFixed(2)}`, 'Earnings']}
                                    />
                                    <Bar
                                        dataKey="totalEarnings"
                                        fill="#3b82f6"
                                        radius={[6, 6, 0, 0]}
                                        barSize={period === 'daily' ? 12 : 32}
                                    >
                                        {stats.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={index === stats.length - 1 ? '#3b82f6' : '#3b82f680'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                                <Calendar className="w-12 h-12 opacity-20" />
                                <p>No earnings data for this period</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Withdrawal & Settings Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Withdrawal Methods */}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Withdrawal Methods</h2>
                            <button className="text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors">
                                + Add Method
                            </button>
                        </div>
                        <div className="space-y-4">
                            {methods.length > 0 ? (
                                methods.map((m) => (
                                    <div key={m.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                                                {m.type === 'BANK_ACCOUNT' ? <Wallet className="w-5 h-5 text-slate-400" /> : <DollarSign className="w-5 h-5 text-slate-400" />}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">{m.provider || m.type}</div>
                                                <div className="text-slate-500 text-xs">•••• {m.accountNumber.slice(-4)}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {m.isDefault && (
                                                <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 bg-slate-950/50 rounded-xl border border-dashed border-slate-800 text-slate-500 text-sm">
                                    No withdrawal methods added yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Auto-Withdrawal Settings */}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Auto-Withdrawal</h2>
                            <div
                                className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${autoWithdrawSettings.enabled ? 'bg-blue-600' : 'bg-slate-800'}`}
                                onClick={() => setAutoWithdrawSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                            >
                                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${autoWithdrawSettings.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </div>

                        <div className="space-y-6 flex-1 text-sm">
                            <p className="text-slate-400 leading-relaxed">
                                Automatically transfer your available balance to your default withdrawal method based on your preferred schedule.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-slate-500 mb-1.5 text-xs font-medium uppercase tracking-wider">Minimum Threshold</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                        <input
                                            type="number"
                                            value={autoWithdrawSettings.threshold}
                                            onChange={(e) => setAutoWithdrawSettings(prev => ({ ...prev, threshold: e.target.value }))}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-7 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-500 mb-1.5 text-xs font-medium uppercase tracking-wider">Schedule</label>
                                    <select
                                        value={autoWithdrawSettings.schedule}
                                        onChange={(e) => setAutoWithdrawSettings(prev => ({ ...prev, schedule: e.target.value as any }))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                                    >
                                        <option value="DAILY">Daily</option>
                                        <option value="WEEKLY">Weekly (Monday)</option>
                                        <option value="MONTHLY">Monthly (1st)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleUpdateAutoWithdraw}
                            className="mt-8 w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20"
                        >
                            Save Settings
                        </button>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                    </div>
                    <div>
                        {wallet?.transactions && wallet.transactions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="p-4 font-medium">Date</th>
                                            <th className="p-4 font-medium">Description</th>
                                            <th className="p-4 font-medium">Type</th>
                                            <th className="p-4 font-medium">Status</th>
                                            <th className="p-4 font-medium text-right">Amount</th>
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
                                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wide ${tx.type === 'DEPOSIT' ? 'bg-green-500/10 text-green-500' :
                                                        tx.type === 'WITHDRAWAL' ? 'bg-red-500/10 text-red-500' :
                                                            'bg-blue-500/10 text-blue-500'
                                                        }`}>
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'COMPLETED' ? 'bg-green-500' :
                                                            tx.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`} />
                                                        <span className="capitalize">{tx.status.toLowerCase()}</span>
                                                    </div>
                                                </td>
                                                <td className={`p-4 text-right font-medium ${tx.type === 'DEPOSIT' || (tx.type === 'PAYMENT' && tx.status === 'COMPLETED') ? 'text-green-400' : 'text-slate-300'}`}>
                                                    <div className="flex flex-col items-end">
                                                        <div>
                                                            {tx.type === 'DEPOSIT' || tx.type === 'PAYMENT' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                                                        </div>
                                                        {tx.type === 'PAYMENT' && tx.feeAmount && Number(tx.feeAmount) > 0 && (
                                                            <div className="text-[10px] text-slate-500 font-normal mt-1 flex items-center gap-1 group/fee relative">
                                                                <span>Incl. ${(Number(tx.feeAmount) + Number(tx.taxAmount || 0)).toFixed(2)} fees</span>
                                                                <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl opacity-0 group-hover/fee:opacity-100 transition-all duration-200 pointer-events-none z-50 transform translate-y-2 group-hover/fee:translate-y-0 text-left">
                                                                    <div className="space-y-2 text-xs">
                                                                        <div className="flex justify-between border-b border-slate-800 pb-2 mb-2">
                                                                            <span className="text-slate-400">Total Charged</span>
                                                                            <span className="text-white font-bold">${(Number(tx.amount) + Number(tx.feeAmount) + Number(tx.taxAmount || 0)).toFixed(2)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-slate-400">Platform Fee</span>
                                                                            <span className="text-slate-300">-${Number(tx.feeAmount).toFixed(2)}</span>
                                                                        </div>
                                                                        {tx.taxAmount && Number(tx.taxAmount) > 0 && (
                                                                            <div className="flex justify-between">
                                                                                <span className="text-slate-400">Tax</span>
                                                                                <span className="text-slate-300">-${Number(tx.taxAmount).toFixed(2)}</span>
                                                                            </div>
                                                                        )}
                                                                        <div className="flex justify-between border-t border-slate-800 pt-2 mt-2 font-bold bg-slate-800/50 -mx-3 px-3 py-1 rounded-b-xl">
                                                                            <span className="text-slate-200">You Receive</span>
                                                                            <span className="text-green-400">${Number(tx.amount).toFixed(2)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center text-slate-500">
                                No transactions found
                            </div>
                        )}
                    </div>
                </div >
            </div >
        </div >
    );
}
