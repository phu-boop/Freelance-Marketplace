'use client';

import React from 'react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    DollarSign,
    Briefcase,
    TrendingUp,
    Users,
    Activity,
    Target,
    ArrowUpRight,
    PieChart as PieChartIcon,
    ShieldCheck,
    Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export default function ClientAnalyticsPage() {
    const { userId, initialized } = useKeycloak();
    const [loading, setLoading] = React.useState(true);
    const [metrics, setMetrics] = React.useState<any>(null);

    React.useEffect(() => {
        if (!initialized || !userId) return;

        const fetchMetrics = async () => {
            try {
                const res = await api.get(`/analytics/client/${userId}`);
                setMetrics(res.data);
            } catch (err) {
                console.error('Failed to fetch client metrics', err);
                // Fallback mock for demo
                setMetrics({
                    totalSpend: 12500,
                    roi: 1.45,
                    projectsPosted: 12,
                    activeContracts: 4,
                    spendByCategory: [
                        { name: 'Development', value: 8500 },
                        { name: 'Design', value: 2500 },
                        { name: 'Marketing', value: 1500 }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [userId, initialized]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="space-y-1">
                <h1 className="text-3xl font-black text-white tracking-tight">Spend & ROI Analytics</h1>
                <p className="text-slate-400 font-medium">Track your infrastructure spend, project efficiency, and talent ROI.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Spend"
                    value={`$${metrics?.totalSpend.toLocaleString()}`}
                    icon={DollarSign}
                    trend="+15%"
                    trendUp={false}
                    color="text-blue-400 bg-blue-400/10"
                />
                <StatCard
                    label="Estimated ROI"
                    value={`${metrics?.roi}x`}
                    icon={Target}
                    trend="Optimal"
                    trendUp={true}
                    color="text-emerald-400 bg-emerald-400/10"
                />
                <StatCard
                    label="Projects Posted"
                    value={metrics?.projectsPosted}
                    icon={Briefcase}
                    trend="+2 this month"
                    trendUp={true}
                    color="text-amber-400 bg-amber-400/10"
                />
                <StatCard
                    label="Active Hires"
                    value={metrics?.activeContracts}
                    icon={Users}
                    trend="No churn"
                    trendUp={true}
                    color="text-purple-400 bg-purple-400/10"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2rem] p-8">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-400" />
                        Monthly Spend Distribution
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { month: 'Oct', amount: 3200 },
                                { month: 'Nov', amount: 4500 },
                                { month: 'Dec', amount: 2800 },
                                { month: 'Jan', amount: 2000 }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" />
                                <YAxis stroke="#475569" />
                                <Tooltip cursor={{ fill: '#1e293b' }} />
                                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-purple-400" />
                        Spend by Category
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={metrics?.spendByCategory}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {metrics?.spendByCategory.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, trend, trendUp, color }: any) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-2xl", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={cn(
                        "text-[10px] font-black px-2 py-1 rounded-lg border",
                        trendUp ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-red-400 bg-red-400/10 border-red-400/20"
                    )}>
                        {trend}
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <div className="text-3xl font-black text-white tracking-tighter">{value}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</div>
            </div>
        </div>
    );
}
