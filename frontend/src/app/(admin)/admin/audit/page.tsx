'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Loader2,
    History,
    ShieldCheck,
    ShieldAlert,
    User,
    RefreshCw,
    Search,
    Filter,
    Calendar,
    Download,
    Eye
} from 'lucide-react';
import api from '@/lib/api';
import { format } from 'date-fns';

interface AuditLog {
    id: string;
    service: string;
    eventType: string;
    actorId: string | null;
    timestamp: string;
    status: string | null;
    metadata: any;
    traceId: string | null;
}

export default function AuditTrailPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedService, setSelectedService] = useState('all');

    const fetchAuditLogs = async () => {
        setRefreshing(true);
        try {
            const res = await api.get('/admins/audit-logs');
            setLogs(res.data);
        } catch (error) {
            console.error('Failed to fetch audit logs', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const services = ['all', ...Array.from(new Set(logs.map(l => l.service)))];

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.eventType.toLowerCase().includes(search.toLowerCase()) ||
            (log.actorId?.toLowerCase().includes(search.toLowerCase()) || false) ||
            log.service.toLowerCase().includes(search.toLowerCase());

        const matchesService = selectedService === 'all' || log.service === selectedService;

        return matchesSearch && matchesService;
    });

    const getEventBadgeColor = (type: string) => {
        if (type.includes('ERROR') || type.includes('FAILED') || type.includes('BAN')) return 'bg-red-500/10 text-red-400 border-red-500/20';
        if (type.includes('WARN') || type.includes('SUSPEND')) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        if (type.includes('CREATE') || type.includes('ENABLED') || type.includes('ACTIVATE')) return 'bg-green-500/10 text-green-400 border-green-500/20';
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Loading secure audit records...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-600/10 rounded-lg">
                            <History className="w-6 h-6 text-red-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Audit Trail</h1>
                    </div>
                    <p className="text-slate-400 font-medium leading-relaxed">
                        Immutable record of security events, administrative actions, and critical system mutations.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {/* CSV Export Logic */ }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all font-semibold text-sm"
                    >
                        <Download className="w-4 h-4" />
                        Export Audit
                    </button>
                    <button
                        onClick={fetchAuditLogs}
                        disabled={refreshing}
                        className="p-2.5 bg-red-600 text-white rounded-xl hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by event, actor, or metadata..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                    />
                </div>

                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all capitalize"
                    >
                        {services.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input
                        type="date"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                    />
                </div>
            </div>

            {/* Audit Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-left">
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800">Event Type</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800">Actor</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800">Service</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800">Status</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800">Timestamp</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredLogs.map((log, idx) => (
                                <motion.tr
                                    key={log.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="hover:bg-slate-800/30 transition-colors group"
                                >
                                    <td className="p-4">
                                        <div className={`px-2.5 py-1 rounded-md border text-[10px] font-black uppercase tracking-tighter inline-block ${getEventBadgeColor(log.eventType)}`}>
                                            {log.eventType.replace(/_/g, ' ')}
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <User className="w-3 h-3 text-slate-500" />
                                            {log.actorId || 'SYSTEM'}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm font-semibold text-white capitalize">{log.service.replace('-service', '')}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {log.status === 'SUCCESS' ? (
                                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <ShieldAlert className="w-4 h-4 text-yellow-500" />
                                            )}
                                            <span className={`text-[10px] font-bold ${log.status === 'SUCCESS' ? 'text-green-500' : 'text-yellow-500'}`}>
                                                {log.status || 'PROCESSED'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-slate-300">{format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}</div>
                                        <div className="text-[10px] text-slate-500 font-mono tracking-tighter">
                                            {new Date(log.timestamp).getFullYear()}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-24 text-center">
                                        <div className="flex flex-col items-center gap-4 text-slate-600">
                                            <ShieldAlert className="w-16 h-16 opacity-10" />
                                            <p className="text-lg font-medium">No secure audit records found.</p>
                                            <p className="text-sm">Try adjusting your filters or search query.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
