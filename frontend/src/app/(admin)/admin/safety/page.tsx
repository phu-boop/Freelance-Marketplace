'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    AlertTriangle,
    MessageSquare,
    UserX,
    CheckCircle,
    Clock,
    Search,
    Filter,
    ArrowUpRight,
    Eye,
    ThumbsUp,
    ThumbsDown,
    Lock
} from 'lucide-react';
import api from '@/lib/api';

export default function SafetyDashboard() {
    const [reports, setReports] = useState<any[]>([]);
    const [appeals, setAppeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('OPEN');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Mock data for initial UI build
            setReports([
                { id: '1', userId: 'u1', type: 'CHAT_RISK', severity: 'HIGH', description: 'Attempted off-platform payment (PayPal)', status: 'OPEN', createdAt: new Date().toISOString() },
                { id: '2', userId: 'u2', type: 'LOGIN_ANOMALY', severity: 'MEDIUM', description: 'Concurrent login from different countries', status: 'OPEN', createdAt: new Date().toISOString() },
                { id: '3', userId: 'u3', type: 'SUBMISSION_RISK', severity: 'CRITICAL', description: 'Malicious code patterns detected in PR', status: 'OPEN', createdAt: new Date().toISOString() },
            ]);
            setAppeals([
                { id: 'a1', userId: 'u4', type: 'SUSPENSION', reason: 'I was just testing the payment keywords.', status: 'PENDING', createdAt: new Date().toISOString() }
            ]);
        } catch (err) {
            console.error('Failed to fetch safety data', err);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const colors: any = {
            'OPEN': 'bg-red-500/10 text-red-400 border-red-500/20',
            'PENDING': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            'CLOSED': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'APPROVED': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        };
        return <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${colors[status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>{status}</span>;
    };

    const SeverityIcon = ({ severity }: { severity: string }) => {
        switch (severity) {
            case 'CRITICAL': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'HIGH': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
            case 'MEDIUM': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            default: return <Shield className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8 space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-500/10 rounded-xl">
                            <Shield className="w-6 h-6 text-red-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Safety & Risk Center</h1>
                    </div>
                    <p className="text-slate-500">Guardian AI is monitoring {1240} currently active sessions</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-800 transition-all flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-600/20 hover:bg-red-500 transition-all flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Incident Mode
                    </button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Active Reports', value: reports.length, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10' },
                    { label: 'Pending Appeals', value: appeals.length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                    { label: 'Users Muted', value: 12, icon: UserX, color: 'text-slate-400', bg: 'bg-slate-400/10' },
                    { label: 'Verified Today', value: 45, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-slate-900 border border-slate-800 p-6 rounded-2xl"
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-2 ${stat.bg} rounded-lg`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Real-time</span>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                            <p className="text-sm text-slate-500">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Flagged Incidents */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Security Alerts</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search incidents..."
                                className="pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                            />
                        </div>
                    </div>
                    <div className="divide-y divide-slate-800 overflow-y-auto max-h-[600px]">
                        {reports.map((report) => (
                            <div key={report.id} className="p-6 hover:bg-slate-800/30 transition-all group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <SeverityIcon severity={report.severity} />
                                        <h4 className="font-bold text-white">{report.type}</h4>
                                        <StatusBadge status={report.status} />
                                    </div>
                                    <span className="text-xs text-slate-500">{new Date(report.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-sm text-slate-400 mb-4">{report.description}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-slate-800 rounded-full" />
                                        <span className="text-xs text-slate-500 font-medium">User ID: {report.userId}</span>
                                    </div>
                                    <button className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-all opacity-0 group-hover:opacity-100">
                                        View Evidence <ArrowUpRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Appeals Queue */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-bold text-white">Appeals Queue</h2>
                        <p className="text-slate-500 text-xs mt-1">Users requesting restriction review</p>
                    </div>
                    <div className="p-6 space-y-4">
                        {appeals.map((appeal) => (
                            <div key={appeal.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{appeal.type}</span>
                                    <span className="text-[10px] text-slate-500">{new Date(appeal.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-slate-300 italic">"{appeal.reason}"</p>
                                <div className="pt-2 flex gap-2">
                                    <button className="flex-1 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-600/20 transition-all flex items-center justify-center gap-1">
                                        <ThumbsUp className="w-3 h-3" /> Approve
                                    </button>
                                    <button className="flex-1 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-xs font-bold rounded-lg border border-red-600/20 transition-all flex items-center justify-center gap-1">
                                        <ThumbsDown className="w-3 h-3" /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
