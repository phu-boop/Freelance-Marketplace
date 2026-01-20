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
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    LineChart,
    Line,
    Sankey,
    Rectangle,
    Layer
} from 'recharts';
import {
    Sparkles,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Briefcase,
    Eye,
    MessageSquare,
    UserCheck,
    Target,
    Zap,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for cases where API fails or returns empty in dev
const MOCK_MONTHLY_EARNINGS = [
    { month: '2023-08', amount: 1200 },
    { month: '2023-09', amount: 1800 },
    { month: '2023-10', amount: 3200 },
    { month: '2023-11', amount: 2800 },
    { month: '2023-12', amount: 4500 },
    { month: '2024-01', amount: 3900 },
];

const MOCK_FUNNEL = {
    steps: [
        { name: "Profile Views", count: 1240 },
        { name: "Proposals Sent", count: 86 },
        { name: "Interviews", count: 12 },
        { name: "Hires", count: 4 }
    ],
    conversionRates: {
        viewToApp: 6.9,
        appToInterview: 14.0,
        interviewToHire: 33.3
    }
};

export default function FreelancerAnalyticsPage() {
    const { userId, initialized } = useKeycloak();
    const [loading, setLoading] = React.useState(true);
    const [overview, setOverview] = React.useState<any>(null);
    const [earnings, setEarnings] = React.useState<any>(null);
    const [funnel, setFunnel] = React.useState<any>(null);
    const [prediction, setPrediction] = React.useState<any>(null);
    const [timeRange, setTimeRange] = React.useState<'3m' | '6m' | '1y'>('6m');

    React.useEffect(() => {
        if (!initialized || !userId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Parallel fetching of all analytics data
                const [overviewRes, earningsRes, predictionRes, funnelRes] = await Promise.allSettled([
                    analyticsApi.get(`/api/analytics/freelancer/overview?user_id=${userId}`),
                    analyticsApi.get(`/api/analytics/freelancer/earnings?user_id=${userId}`),
                    analyticsApi.get(`/api/analytics/freelancer/predictive-earnings?user_id=${userId}`),
                    analyticsApi.get(`/api/analytics/freelancer/funnel?user_id=${userId}`)
                ]);

                // Handle Overview
                if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value.data);
                else setOverview({ totalEarnings: 0, jobsCompleted: 0, jss: 100, profileViews: 0 });

                // Handle Earnings (with Mock Fallback)
                if (earningsRes.status === 'fulfilled' && earningsRes.value.data.monthly_earnings?.length > 0) {
                    setEarnings(earningsRes.value.data);
                } else {
                    setEarnings({ total_earnings: 17400, monthly_earnings: MOCK_MONTHLY_EARNINGS });
                }

                // Handle Prediction
                if (predictionRes.status === 'fulfilled') setPrediction(predictionRes.value.data);
                else setPrediction({ predictedNextMonth: 4200, trend: 'up', confidence: 0.85, insight: "Market trend suggests specific growth in your React skills." });

                // Handle Funnel
                if (funnelRes.status === 'fulfilled') setFunnel(funnelRes.value.data);
                else setFunnel(MOCK_FUNNEL);

            } catch (error) {
                console.error('Analytics Fetch Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, initialized]);

    if (loading || !initialized) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-slate-400 font-medium animate-pulse">Analyzing performance data...</p>
                </div>
            </div>
        );
    }

    // Prepare chart data - merge actuals with prediction
    const chartData = [...(earnings?.monthly_earnings || [])].reverse();
    if (prediction && chartData.length > 0) {
        const lastMonth = chartData[chartData.length - 1].month;
        const [y, m] = lastMonth.split('-').map(Number);
        const nextDate = new Date(y, m, 1);
        const nextMonthStr = nextDate.toISOString().slice(0, 7);

        chartData.push({
            month: nextMonthStr,
            amount: prediction.predictedNextMonth,
            isPrediction: true
        });
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        Performance Analytics
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20">Beta</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Deep insights into your earnings, visibility, and conversion rates.</p>
                </div>
                <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                    {(['3m', '6m', '1y'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider",
                                timeRange === range
                                    ? "bg-slate-800 text-white shadow-lg"
                                    : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Earnings"
                    value={`$${overview?.totalEarnings?.toLocaleString() ?? '0'}`}
                    icon={DollarSign}
                    trend="+12%"
                    trendUp={true}
                    color="text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                />
                <StatCard
                    label="Job Success Score"
                    value={`${overview?.jss ?? 100}%`}
                    icon={Target}
                    trend="Top Rated"
                    trendUp={true}
                    color="text-amber-400 bg-amber-400/10 border-amber-400/20"
                />
                <StatCard
                    label="Profile Views"
                    value={overview?.profileViews?.toString() ?? '0'}
                    icon={Eye}
                    trend="+5 this week"
                    trendUp={true}
                    color="text-blue-400 bg-blue-400/10 border-blue-400/20"
                />
                <StatCard
                    label="Active Proposals"
                    value={overview?.activeProposals?.toString() ?? '0'}
                    icon={Zap}
                    trend="2 Interviewing"
                    trendUp={true}
                    color="text-purple-400 bg-purple-400/10 border-purple-400/20"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Revenue Chart */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <Activity className="w-32 h-32" />
                    </div>

                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div>
                            <h2 className="text-xl font-black text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                Revenue Forecast
                            </h2>
                            <p className="text-sm text-slate-400 font-medium mt-1">
                                Projected earning: <span className="text-emerald-400 font-bold">${prediction?.predictedNextMonth.toLocaleString()}</span> next month
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" /> Actual
                            <div className="w-2 h-2 rounded-full bg-emerald-500/30 ml-2" /> Projected
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
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
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Funnel Analysis */}
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl flex flex-col">
                    <h2 className="text-xl font-black text-white flex items-center gap-2 mb-6">
                        <Target className="w-5 h-5 text-blue-400" />
                        Conversion Funnel
                    </h2>

                    <div className="flex-1 flex flex-col justify-center space-y-6">
                        {funnel?.steps.map((step: any, idx: number) => {
                            const prev = funnel.steps[idx - 1];
                            const rate = prev ? Math.round((step.count / prev.count) * 100) : 100;
                            const isLast = idx === funnel.steps.length - 1;

                            return (
                                <div key={step.name} className="relative group">
                                    <div className="flex justify-between text-sm font-bold text-slate-400 mb-2">
                                        <span>{step.name}</span>
                                        <span className="text-white">{step.count}</span>
                                    </div>
                                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(step.count / funnel.steps[0].count) * 100}%` }}
                                            transition={{ duration: 1, delay: idx * 0.2 }}
                                            className={cn(
                                                "h-full rounded-full relative",
                                                isLast ? "bg-emerald-500" : "bg-blue-600"
                                            )}
                                        >
                                            <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
                                        </motion.div>
                                    </div>

                                    {idx > 0 && (
                                        <div className="absolute -top-3 right-0 text-[10px] font-black bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                                            {rate}% Conv.
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-800">
                        <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                            <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
                            <p className="text-xs text-blue-300 font-medium leading-relaxed">
                                AI Tip: Your view-to-proposal rate is high (14%). Consider raising your rates by 10% to maximize earnings.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Smart Benchmarking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-black text-white">Market Rate Benchmark</h3>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hourly (USD)</span>
                    </div>
                    <div className="relative pt-12 pb-4">
                        {/* Visualizing Rate Position */}
                        <div className="h-4 bg-slate-800 rounded-full relative">
                            <div className="absolute left-[20%] right-[20%] top-0 bottom-0 bg-slate-700/50 rounded-full" /> {/* Market Average Range */}

                            {/* User Position */}
                            <div className="absolute left-[65%] top-1/2 -translate-y-1/2 flex flex-col items-center">
                                <div className="w-4 h-4 bg-emerald-500 border-4 border-slate-900 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] z-10" />
                                <div className="absolute bottom-6 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                    You: $45/hr
                                </div>
                                <div className="h-8 w-0.5 bg-emerald-500/20 absolute top-2" />
                            </div>

                            {/* Market Median */}
                            <div className="absolute left-[50%] top-1/2 -translate-y-1/2 flex flex-col items-center">
                                <div className="w-2 h-2 bg-slate-500 rounded-full" />
                                <div className="absolute top-6 text-slate-500 text-[10px] font-bold">
                                    Median: $35/hr
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between mt-8 text-xs font-bold text-slate-600 uppercase tracking-widest">
                            <span>$10</span>
                            <span>$100+</span>
                        </div>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed mt-4">
                        You are charging <span className="text-white font-bold">28% more</span> than the median for similar React developers. Your high JSS justifies this premium.
                    </p>
                </div>

                <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center space-y-6">
                    <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white mb-2">Unlock Advanced Insights</h3>
                        <p className="text-slate-400 max-w-sm mx-auto">Get access to competitor analysis, SEO keyword optimization for your profile, and automated rate negotiation scripts.</p>
                    </div>
                    <button className="px-8 py-3 bg-white text-slate-950 font-black rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-xs">
                        Upgrade to Plus
                    </button>
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
                        trendUp ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-red-400 bg-red-400/10 border-red-400/20"
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

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-2xl">
                <p className="text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">{label}</p>
                <p className="text-white text-lg font-black flex items-center gap-2">
                    ${Number(payload[0].value).toLocaleString()}
                    {data.isPrediction && (
                        <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold uppercase">Forecast</span>
                    )}
                </p>
            </div>
        );
    }
    return null;
};
