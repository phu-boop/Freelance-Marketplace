'use client';

import React from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Clock, DollarSign, Calendar, TrendingUp } from 'lucide-react';

export default function TimeReportsPage() {
    const [summary, setSummary] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await api.get('/jobs/api/reports/time-summary'); // Adjusted URL prefix if needed, assumes proxy setup or direct path
                // Based on job-service controller route @Controller('api') and global prefix, likely /jobs/api/reports/time-summary via kong
                setSummary(res.data);
            } catch (error) {
                console.error('Failed to fetch time summary', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-6">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Time & Earnings Report</h1>
                        <p className="text-slate-400">Track your hourly work and estimated income.</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <Clock className="w-8 h-8 text-blue-500" />
                        </div>
                        <div>
                            <div className="text-slate-400 text-sm font-medium">Total Hours Logged</div>
                            <div className="text-2xl font-bold text-white">{Number(summary?.totalHours || 0).toFixed(1)} hrs</div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-xl">
                            <DollarSign className="w-8 h-8 text-green-500" />
                        </div>
                        <div>
                            <div className="text-slate-400 text-sm font-medium">Estimated Earnings</div>
                            <div className="text-2xl font-bold text-white">${Number(summary?.totalEarnings || 0).toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                {/* Weekly Breakdown (Simple Bar Visual) */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        Weekly Breakdown
                    </h2>

                    {summary?.weeklyBreakdown && summary.weeklyBreakdown.length > 0 ? (
                        <div className="space-y-4">
                            {summary.weeklyBreakdown.map((week: any) => (
                                <div key={week.week} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-300 font-medium">Week of {new Date(week.week).toLocaleDateString()}</span>
                                        <span className="text-white font-bold">{Number(week.hours).toFixed(1)} hrs</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        {/* Determine max for scale or just relative width? For now simple relative to 40h standard */}
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((week.hours / 40) * 100, 100)}%` }}
                                            className="h-full bg-blue-600 rounded-full"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            No time logs found yet.
                        </div>
                    )}
                </div>

                {/* Recent Entries Table */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-slate-400" />
                            Recent Activity
                        </h2>
                    </div>
                    {summary?.recentEntries && summary.recentEntries.length > 0 ? (
                        <table className="w-full text-left">
                            <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium">Description</th>
                                    <th className="p-4 font-medium text-right">Hours</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                                {summary.recentEntries.map((entry: any) => (
                                    <tr key={entry.id} className="hover:bg-slate-800/50">
                                        <td className="p-4">{new Date(entry.date).toLocaleDateString()}</td>
                                        <td className="p-4">{entry.description}</td>
                                        <td className="p-4 text-right font-medium text-white">{Number(entry.hours).toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-slate-500">
                            No recent activity.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
