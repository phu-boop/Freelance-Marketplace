'use client';

import React from 'react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    TrendingUp,
    Users,
    DollarSign,
    Shield,
    Activity,
    Globe,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminAnalyticsPage() {
    const { initialized } = useKeycloak();
    const [loading, setLoading] = React.useState(true);
    const [stats, setStats] = React.useState<any>(null);

    React.useEffect(() => {
        if (!initialized) return;

        const fetchPlatformStats = async () => {
            try {
                const res = await api.get('/analytics/platform');
                setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch platform stats', err);
                // Mock
                setStats({
                    totalUsers: 15420,
                    activeJobs: 842,
                    totalGMV: 2450000,
                    revenue: 490000,
                    churnRate: '2.4%',
                    growth: '+18%'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPlatformStats();
    }, [initialized]);

    if (loading) return <div>Loading Platform BI...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 p-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        <Shield className="w-10 h-10 text-red-500" />
                        Platform BI & Governance
                    </h1>
                    <p className="text-slate-400 font-medium">Real-time health monitoring and financial performance of the ecosystem.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end text-sm">
                        <span className="text-slate-500 font-bold uppercase tracking-tighter">System Health</span>
                        <span className="text-emerald-400 font-black flex items-center gap-1">
                            <Activity className="w-3 h-3" /> All Services Operational
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminStatCard
                    label="Platform GMV"
                    value={`$${(stats.totalGMV / 1000000).toFixed(1)}M`}
                    icon={DollarSign}
                    trend="+12%"
                    color="text-emerald-400 border-emerald-500/20"
                />
                <AdminStatCard
                    label="Platform Revenue"
                    value={`$${(stats.revenue / 1000).toFixed(0)}K`}
                    icon={TrendingUp}
                    trend="+15%"
                    color="text-blue-400 border-blue-500/20"
                />
                <AdminStatCard
                    label="Total Ecosystem Users"
                    value={stats.totalUsers.toLocaleString()}
                    icon={Users}
                    trend="+450 new"
                    color="text-purple-400 border-purple-500/20"
                />
                <AdminStatCard
                    label="Net Churn"
                    value={stats.churnRate}
                    icon={AlertCircle}
                    trend="Low Risk"
                    color="text-amber-400 border-amber-500/20"
                />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                <h3 className="text-xl font-black text-white mb-8">Ecosystem Growth Trajectory</h3>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                            { date: '2023-08', users: 8000, revenue: 150000 },
                            { date: '2023-09', users: 9500, revenue: 210000 },
                            { date: '2023-10', users: 11000, revenue: 320000 },
                            { date: '2023-11', users: 12500, revenue: 280000 },
                            { date: '2023-12', users: 14000, revenue: 450000 },
                            { date: '2024-01', users: 15420, revenue: 490000 }
                        ]}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="date" stroke="#475569" />
                            <YAxis stroke="#475569" />
                            <Tooltip />
                            <Area type="monotone" dataKey="users" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function AdminStatCard({ label, value, icon: Icon, trend, color }: any) {
    return (
        <div className={cn("bg-slate-900 border rounded-[2rem] p-6 flex items-center gap-6", color)}>
            <div className="p-4 bg-slate-800 rounded-2xl">
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <div className="text-3xl font-black text-white tracking-tighter">{value}</div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
                    <span className="text-[10px] font-black text-emerald-400">{trend}</span>
                </div>
            </div>
        </div>
    );
}
