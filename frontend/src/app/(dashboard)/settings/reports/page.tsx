'use client';

import React from 'react';
import { useKeycloak } from '@/components/KeycloakProvider';
import analyticsApi from '@/lib/analyticsApi';
import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Briefcase,
    Users,
    Activity,
    Calendar,
    PieChart as PieIcon,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock Data
const MOCK_COST_CENTER_SPEND = [
    { name: 'Marketing', value: 45000, color: '#3b82f6' },
    { name: 'Engineering', value: 125000, color: '#10b981' },
    { name: 'Design', value: 32000, color: '#8b5cf6' },
    { name: 'Content', value: 18000, color: '#f59e0b' },
];

const MOCK_FORECAST = [
    { month: '2023-08', spend: 32000 },
    { month: '2023-09', spend: 35000 },
    { month: '2023-10', spend: 42000 },
    { month: '2023-11', spend: 38000 },
    { month: '2023-12', spend: 45000 },
    { month: '2024-01', spend: 52000 },
    { month: '2024-02', spend: 58000, isForecast: true },
];

const MOCK_TALENT_ROI = [
    { name: 'Sarah Connor', role: 'DevOps Engineer', rate: 85, efficiency: 98, totalPaid: 12400 },
    { name: 'John Smith', role: 'React Developer', rate: 65, efficiency: 94, totalPaid: 8200 },
    { name: 'Emily Chen', role: 'UX Designer', rate: 70, efficiency: 91, totalPaid: 6500 },
    { name: 'David Kim', role: 'Backend Dev', rate: 60, efficiency: 88, totalPaid: 4200 },
];

export default function ClientReportsPage() {
    const { userId, initialized } = useKeycloak();
    const [loading, setLoading] = React.useState(true);
    const [spendData, setSpendData] = React.useState<any>(null);
    const [forecastData, setForecastData] = React.useState<any>(null);

    React.useEffect(() => {
        if (!initialized || !userId) return;

        // Simulating API loading for visual fidelity
        const timer = setTimeout(() => {
            setLoading(false);
            setSpendData({ totalSpend: 220000, activeProjects: 12 });
            setForecastData(MOCK_FORECAST);
        }, 1200);

        return () => clearTimeout(timer);
    }, [initialized, userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-slate-400 font-medium animate-pulse">Calculating ROI metrcis...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        Financial Reports
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20">Enterprise</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Track spend, analyze cost centers, and optimize talent ROI.</p>
                </div>
                <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl transition-colors font-bold text-xs uppercase tracking-wider border border-slate-700">
                    <Calendar className="w-4 h-4" />
                    Last 6 Months
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Spend (YTD)"
                    value={`$${(spendData?.totalSpend || 220000).toLocaleString()}`}
                    icon={DollarSign}
                    trend="+18% vs last year"
                    trendUp={false} // Spending up is generally bad/neutral, depends on context, let's say neutral/bad for cost control
                    color="text-indigo-400 bg-indigo-400/10 border-indigo-400/20"
                />
                <StatCard
                    label="Active Projects"
                    value={spendData?.activeProjects || 12}
                    icon={Briefcase}
                    trend="3 ending soon"
                    trendUp={true}
                    color="text-blue-400 bg-blue-400/10 border-blue-400/20"
                />
                <StatCard
                    label="Avg. Hourly Rate"
                    value="$68.50"
                    icon={Activity}
                    trend="-2% vs market avg"
                    trendUp={true} // Lower rate is good
                    color="text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                />
                <StatCard
                    label="Talent Efficiency"
                    value="94%"
                    icon={Users}
                    trend="Top Tier"
                    trendUp={true}
                    color="text-amber-400 bg-amber-400/10 border-amber-400/20"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cost Center Breakdown */}
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl flex flex-col">
                    <h2 className="text-xl font-black text-white flex items-center gap-2 mb-6">
                        <PieIcon className="w-5 h-5 text-indigo-400" />
                        Cost Center Distribution
                    </h2>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={MOCK_COST_CENTER_SPEND}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {MOCK_COST_CENTER_SPEND.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }}
                                    itemStyle={{ color: '#94a3b8', fontWeight: 600 }}
                                    formatter={(value: number) => `$${value.toLocaleString()}`}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value, entry: any) => <span className="text-slate-400 font-bold ml-1">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Spend Forecast */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-xl font-black text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                Spend Forecast
                            </h2>
                            <p className="text-sm text-slate-400 font-medium mt-1">
                                Projected budget utilization: <span className="text-white font-bold">82%</span>
                            </p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    stroke="#475569"
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#475569"
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value / 1000}k`}
                                    dx={-10}
                                />
                                <RechartsTooltip
                                    cursor={{ fill: '#1e293b', opacity: 0.4 }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-2xl">
                                                    <p className="text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">{label}</p>
                                                    <p className="text-white text-lg font-black">
                                                        ${Number(payload[0].value).toLocaleString()}
                                                        {data.isForecast && <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/30">ESTIMATE</span>}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="spend" radius={[6, 6, 0, 0]}>
                                    {forecastData?.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.isForecast ? '#f59e0b' : '#6366f1'} fillOpacity={entry.isForecast ? 0.6 : 1} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Talent ROI Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-pink-400" />
                        Talent Performance
                    </h2>
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Filter talent..."
                            className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64 font-medium placeholder:text-slate-600"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-800 text-xs font-black text-slate-500 uppercase tracking-widest">
                                <th className="pb-4 pl-4">Freelancer</th>
                                <th className="pb-4">Role</th>
                                <th className="pb-4">Hourly Rate</th>
                                <th className="pb-4">Total Paid</th>
                                <th className="pb-4">Efficiency Score</th>
                                <th className="pb-4 pr-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {MOCK_TALENT_ROI.map((talent) => (
                                <tr key={talent.name} className="group hover:bg-slate-800/50 transition-colors">
                                    <td className="py-4 pl-4">
                                        <div className="font-bold text-white">{talent.name}</div>
                                    </td>
                                    <td className="py-4 text-slate-400 font-medium text-sm">{talent.role}</td>
                                    <td className="py-4 text-slate-300 font-bold tracking-tight">${talent.rate}/hr</td>
                                    <td className="py-4 text-slate-300 font-bold tracking-tight">${talent.totalPaid.toLocaleString()}</td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                                    style={{ width: `${talent.efficiency}%` }}
                                                />
                                            </div>
                                            <span className="text-emerald-400 text-xs font-black">{talent.efficiency}%</span>
                                        </div>
                                    </td>
                                    <td className="py-4 pr-4 text-right">
                                        <button className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, trend, trendUp, color }: any) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 hover:border-slate-700 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border",
                        trendUp ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-amber-400 bg-amber-400/10 border-amber-400/20"
                    )}>
                        {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
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
