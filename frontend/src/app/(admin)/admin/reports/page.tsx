'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flag, CheckCircle, XCircle, Clock, Search, Filter, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface Report {
    id: string;
    reporterId: string;
    targetId: string;
    type: 'USER' | 'JOB';
    reason: string;
    status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
    createdAt: string;
}

export default function AdminReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admins/reports');
            setReports(res.data);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await api.patch(`/admins/reports/${id}/status`, { status });
            fetchReports();
        } catch (error) {
            console.error('Failed to update report status', error);
        }
    };

    const filteredReports = reports.filter(r => filter === 'ALL' || r.status === filter);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-white">Reports & Moderation</h1>
                    <p className="text-slate-400">Review and resolve user reports.</p>
                </div>
                <div className="flex gap-2">
                    {['ALL', 'OPEN', 'RESOLVED', 'DISMISSED'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === f
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : filteredReports.length > 0 ? (
                    <div className="divide-y divide-slate-800">
                        {filteredReports.map((report) => (
                            <div key={report.id} className="p-6 hover:bg-slate-800/50 transition-colors">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${report.type === 'USER' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            <Flag className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${report.type === 'USER' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                    {report.type}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${report.status === 'OPEN' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        report.status === 'RESOLVED' ? 'bg-green-500/20 text-green-400' :
                                                            'bg-slate-700 text-slate-400'
                                                    }`}>
                                                    {report.status}
                                                </span>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(report.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-white font-medium mb-1">Reported ID: {report.targetId}</h3>
                                            <p className="text-slate-400 text-sm">{report.reason}</p>
                                        </div>
                                    </div>

                                    {report.status === 'OPEN' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleStatusUpdate(report.id, 'DISMISSED')}
                                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Dismiss
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(report.id, 'RESOLVED')}
                                                className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Resolve
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-slate-500">
                        No reports found matching your filter.
                    </div>
                )}
            </div>
        </div>
    );
}
