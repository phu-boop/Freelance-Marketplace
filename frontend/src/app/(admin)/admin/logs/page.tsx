'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Terminal, AlertCircle, Info, AlertTriangle, RefreshCw, Search } from 'lucide-react';
import api from '@/lib/api';

interface Log {
    id: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    service: string;
    message: string;
    metadata: string | null;
    timestamp: string;
}

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    const fetchLogs = async () => {
        setRefreshing(true);
        try {
            const res = await api.get('/admins/logs');
            setLogs(res.data);
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.message.toLowerCase().includes(search.toLowerCase()) ||
        log.service.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-white">System Logs</h1>
                    <p className="text-slate-400">Monitor real-time system events and errors.</p>
                </div>
                <button
                    onClick={fetchLogs}
                    disabled={refreshing}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
                >
                    <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter by message or service..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-900/50 border-b border-slate-800">
                                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Level</th>
                                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Service</th>
                                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Message</th>
                                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-900/30 transition-colors group">
                                    <td className="p-4">
                                        <div className={`flex items-center gap-2 text-xs font-bold px-2 py-1 rounded-full w-fit ${log.level === 'ERROR' ? 'bg-red-500/10 text-red-500' :
                                                log.level === 'WARN' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            {log.level === 'ERROR' ? <AlertCircle className="w-3 h-3" /> :
                                                log.level === 'WARN' ? <AlertTriangle className="w-3 h-3" /> :
                                                    <Info className="w-3 h-3" />}
                                            {log.level}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm font-medium text-slate-300">{log.service}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="space-y-1">
                                            <p className="text-sm text-white group-hover:text-blue-400 transition-colors">{log.message}</p>
                                            {log.metadata && (
                                                <pre className="text-[10px] text-slate-500 bg-slate-900 p-2 rounded-lg overflow-x-auto max-w-md">
                                                    {log.metadata}
                                                </pre>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs text-slate-500 font-mono">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-slate-500">
                                            <Terminal className="w-12 h-12 opacity-20" />
                                            <p>No logs found matching your criteria.</p>
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
