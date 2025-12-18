'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { Download, Calendar } from 'lucide-react';

const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
];

const jobData = [
    { name: 'Jan', jobs: 24 },
    { name: 'Feb', jobs: 13 },
    { name: 'Mar', jobs: 98 },
    { name: 'Apr', jobs: 39 },
    { name: 'May', jobs: 48 },
    { name: 'Jun', jobs: 38 },
    { name: 'Jul', jobs: 43 },
];

const categoryData = [
    { name: 'Development', value: 400 },
    { name: 'Design', value: 300 },
    { name: 'Marketing', value: 300 },
    { name: 'Writing', value: 200 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Analytics</h1>
                    <p className="text-slate-400">System performance and business metrics.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-900 border border-slate-800 text-white rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-all">
                        <Calendar className="w-4 h-4" />
                        Last 6 Months
                    </button>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center gap-2 transition-all">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                    <h3 className="text-xl font-bold text-white">Revenue Growth</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="name" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Job Postings Chart */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                    <h3 className="text-xl font-bold text-white">New Job Postings</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={jobData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="name" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                    cursor={{ fill: '#1e293b' }}
                                />
                                <Bar dataKey="jobs" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Categories Pie Chart */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                    <h3 className="text-xl font-bold text-white">Jobs by Category</h3>
                    <div className="h-80 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 flex-wrap">
                        {categoryData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="text-sm text-slate-400">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Performers */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                    <h3 className="text-xl font-bold text-white">Top Freelancers</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white">
                                        {i}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Freelancer {i}</p>
                                        <p className="text-xs text-slate-500">98% Job Success</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-green-400">$12,450</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
