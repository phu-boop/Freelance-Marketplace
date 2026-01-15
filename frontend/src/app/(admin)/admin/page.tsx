'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Users,
    Briefcase,
    DollarSign,
    Activity,
    ArrowUp,
    ArrowDown,
    Loader2,
    ShieldAlert,
    Clock,
    Settings,
    Terminal
} from 'lucide-react';
import api from '@/lib/api';

interface Metrics {
    totalUsers: number;
    totalJobs: number;
    pendingJobs: number;
    activeJobs: number;
    suspendedUsers: number;
    totalVolume: number;
    totalPayments: number;
}

export default function AdminDashboardPage() {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await api.get('/admins/metrics');
                setMetrics(res.data);
            } catch (error) {
                console.error('Failed to fetch metrics', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    const stats = [
        {
            label: 'Total Users',
            value: metrics?.totalUsers || 0,
            change: '+12%',
            trend: 'up',
            icon: Users,
            color: 'blue'
        },
        {
            label: 'Active Jobs',
            value: metrics?.activeJobs || 0,
            change: '+5%',
            trend: 'up',
            icon: Briefcase,
            color: 'green'
        },
        {
            label: 'Pending Approval',
            value: metrics?.pendingJobs || 0,
            change: 'Action Required',
            trend: 'neutral',
            icon: ShieldAlert,
            color: 'yellow'
        },
        {
            label: 'Suspended Users',
            value: metrics?.suspendedUsers || 0,
            change: 'Moderated',
            trend: 'neutral',
            icon: Activity,
            color: 'red'
        },
        {
            label: 'Total Volume',
            value: `$${(metrics?.totalVolume || 0).toLocaleString()}`,
            change: 'Platform Wide',
            trend: 'neutral',
            icon: DollarSign,
            color: 'emerald'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                <p className="text-slate-400">Welcome back, Administrator. Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-6 rounded-2xl bg-slate-900 border border-slate-800"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-green-400' : stat.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                                }`}>
                                {stat.trend === 'up' && <ArrowUp className="w-3 h-3" />}
                                {stat.trend === 'down' && <ArrowDown className="w-3 h-3" />}
                                {stat.change}
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                        <p className="text-sm text-slate-400">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                    <h3 className="text-xl font-bold text-white">System Health</h3>
                    <div className="space-y-4">
                        {['API Gateway', 'User Service', 'Job Service', 'Admin Service', 'Payment Service'].map((service) => (
                            <div key={service} className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-sm font-medium text-slate-300">{service}</span>
                                </div>
                                <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full font-bold">Operational</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                    <h3 className="text-xl font-bold text-white">Pending Actions</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-yellow-500/20">
                            <div className="flex items-center gap-3">
                                <ShieldAlert className="w-5 h-5 text-yellow-500" />
                                <div>
                                    <p className="text-sm font-medium text-white">Job Approvals</p>
                                    <p className="text-xs text-slate-500">{metrics?.pendingJobs} jobs waiting for review</p>
                                </div>
                            </div>
                            <button className="text-xs text-blue-400 hover:underline">Review All</button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-blue-500/20">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium text-white">User KYC</p>
                                    <p className="text-xs text-slate-500">12 users pending verification</p>
                                </div>
                            </div>
                            <button className="text-xs text-blue-400 hover:underline">Verify Now</button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-red-500/20">
                            <div className="flex items-center gap-3">
                                <ShieldAlert className="w-5 h-5 text-red-500" />
                                <div>
                                    <p className="text-sm font-medium text-white">Dispute Management</p>
                                    <p className="text-xs text-slate-500">Review and resolve contract disputes</p>
                                </div>
                            </div>
                            <Link href="/admin/disputes" className="text-xs text-blue-400 hover:underline">View Disputes</Link>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-slate-700">
                            <div className="flex items-center gap-3">
                                <Settings className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-sm font-medium text-white">System Settings</p>
                                    <p className="text-xs text-slate-500">Configure platform fees and rules</p>
                                </div>
                            </div>
                            <Link href="/admin/settings" className="text-xs text-blue-400 hover:underline">Configure</Link>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-slate-700">
                            <div className="flex items-center gap-3">
                                <Terminal className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-sm font-medium text-white">System Logs</p>
                                    <p className="text-xs text-slate-500">Monitor system events and errors</p>
                                </div>
                            </div>
                            <Link href="/admin/logs" className="text-xs text-blue-400 hover:underline">View Logs</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
