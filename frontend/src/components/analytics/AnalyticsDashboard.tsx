'use client';

import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@/components/KeycloakProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell } from 'recharts';
import { DollarSign, Briefcase, TrendingUp, Award, Activity, BarChart3, Target, Zap } from 'lucide-react';
import axios from 'axios';
import EarningsChart from './EarningsChart';
import MarketComparison from './MarketComparison';
import FunnelChart from './FunnelChart';
import LiquidityChart from './LiquidityChart';

interface FreelancerOverview {
    userId: string;
    totalEarnings: number;
    jobsCompleted: number;
    jss: number;
    profileViews: number;
    activeProposals: number;
}

interface MonthlyEarning {
    month: string;
    amount: number;
}

interface ClientSpend {
    userId: string;
    total_spend: number;
    spend_by_job: { job_id: string; amount: number }[];
}

interface PredictiveRevenue {
    pendingRevenue: number;
    projections: Record<string, number>;
}

export function AnalyticsDashboard() {
    const { userId, roles, token } = useKeycloak();
    const isFreelancer = roles.includes('FREELANCER');
    const isClient = roles.includes('CLIENT');

    const [overview, setOverview] = useState<FreelancerOverview | null>(null);
    const [earningsData, setEarningsData] = useState<MonthlyEarning[]>([]);
    const [clientSpend, setClientSpend] = useState<ClientSpend | null>(null);
    const [predictive, setPredictive] = useState<PredictiveRevenue | null>(null);
    const [predictiveEarnings, setPredictiveEarnings] = useState<any>(null);
    const [marketRates, setMarketRates] = useState<any>(null);
    const [funnelData, setFunnelData] = useState<any>(null);
    const [liquidity, setLiquidity] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;
            setLoading(true);
            try {
                // Determine base URL relative to Next.js (which proxies to 3014)
                const baseUrl = '/api/analytics';

                if (isFreelancer) {
                    const [overviewRes, earningsRes, predRes, funnelRes, marketRes] = await Promise.all([
                        axios.get(`${baseUrl}/freelancer/overview?user_id=${userId}`),
                        axios.get(`${baseUrl}/freelancer/earnings?user_id=${userId}`),
                        axios.get(`${baseUrl}/freelancer/predictive-earnings?user_id=${userId}`),
                        axios.get(`${baseUrl}/freelancer/funnel?user_id=${userId}`),
                        axios.get(`${baseUrl}/market-rates?skill=React`) // Default skill for demo
                    ]);

                    setOverview(overviewRes.data);
                    setEarningsData([...earningsRes.data.monthly_earnings].reverse());
                    setPredictiveEarnings(predRes.data);
                    setFunnelData(funnelRes.data);
                    setMarketRates(marketRes.data);

                    const legacyPredictiveRes = await axios.get(`/api/payments/revenue/predictive/${userId}`);
                    setPredictive(legacyPredictiveRes.data);
                } else if (isClient) {
                    const [res, liquidityRes] = await Promise.all([
                        axios.get(`${baseUrl}/client/spend?user_id=${userId}`),
                        axios.get(`${baseUrl}/platform/liquidity`)
                    ]);
                    setClientSpend(res.data);
                    setLiquidity(liquidityRes.data);
                }
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, isFreelancer, isClient]);

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Loading analytics...</div>;
    }

    if (isClient && clientSpend) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-200">
                                Total Spend
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">${clientSpend.total_spend.toFixed(2)}</div>
                            <p className="text-xs text-slate-500">
                                Lifetime investment
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-200">
                                Active Jobs
                            </CardTitle>
                            <Briefcase className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{clientSpend.spend_by_job.length}</div>
                            <p className="text-xs text-slate-500">
                                With recorded transactions
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4 bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-slate-200">Spend by Job</CardTitle>
                            <CardDescription className="text-slate-400">Top spending projects</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={clientSpend.spend_by_job} layout="vertical">
                                        <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                        <YAxis dataKey="job_id" type="category" width={80} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                            cursor={{ fill: '#334155' }}
                                        />
                                        <Bar dataKey="amount" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {liquidity && (
                        <Card className="col-span-3 bg-slate-900 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-slate-200">Market Liquidity</CardTitle>
                                <CardDescription className="text-slate-400">Platform-wide fill rate & speed</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-sm text-slate-500">Job Fill Rate</p>
                                            <h4 className="text-2xl font-bold text-white">{liquidity.jobFillRate}%</h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-500">Avg Time-to-Hire</p>
                                            <h4 className="text-2xl font-bold text-blue-400">{liquidity.avgTimeToHireHours}h</h4>
                                        </div>
                                    </div>
                                    <LiquidityChart data={[
                                        { name: 'Jan', fillRate: 65, timeToHire: 48 },
                                        { name: 'Feb', fillRate: 68, timeToHire: 45 },
                                        { name: 'Mar', fillRate: liquidity.jobFillRate, timeToHire: liquidity.avgTimeToHireHours }
                                    ]} />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        );
    }

    if (isFreelancer && overview) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-200">
                                Total Earnings
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">${overview.totalEarnings.toFixed(2)}</div>
                            <p className="text-xs text-slate-500">
                                Verified earnings
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-200">
                                Jobs Completed
                            </CardTitle>
                            <Briefcase className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{overview.jobsCompleted}</div>
                            <p className="text-xs text-slate-500">
                                {overview.activeProposals} active proposals
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-200">
                                Job Success Score
                            </CardTitle>
                            <Award className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{overview.jss}%</div>
                            <p className="text-xs text-slate-500">
                                Calculated score
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-200">
                                Pending Revenue
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                ${predictive?.pendingRevenue.toFixed(2) || '0.00'}
                            </div>
                            <p className="text-xs text-slate-500">
                                In review milestones
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-200">
                                Profile Views
                            </CardTitle>
                            <Activity className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{overview.profileViews}</div>
                            <p className="text-xs text-slate-500">
                                Lifetime views
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4 bg-slate-900 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-slate-200">Revenue & Projections</CardTitle>
                                <CardDescription className="text-slate-400">Historical earnings with AI-driven forecast</CardDescription>
                            </div>
                            {predictiveEarnings && (
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Next Month Forecast</p>
                                    <p className="text-lg font-bold text-blue-400">${predictiveEarnings.predictedNextMonth}</p>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent>
                            <EarningsChart data={[
                                ...earningsData.map(e => ({ name: e.month, amount: e.amount, type: 'Past' as const })),
                                ...(predictiveEarnings?.predictedNextMonth ? [{ name: 'Forecast', amount: predictiveEarnings.predictedNextMonth, type: 'Predicted' as const }] : [])
                            ]} />
                        </CardContent>
                    </Card>

                    <div className="col-span-3 space-y-4">
                        {marketRates && (
                            <Card className="bg-slate-900 border-slate-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                                        <Target className="w-4 h-4 text-orange-500" />
                                        Market Rate Discovery
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <MarketComparison
                                        skill={marketRates.skill}
                                        userRate={45} // Hardcoded for demo, should come from user profile
                                        marketData={marketRates}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {funnelData && (
                            <Card className="bg-slate-900 border-slate-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-yellow-500" />
                                        Conversion Funnel
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FunnelChart data={funnelData.steps} />
                                    <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                                        <div className="p-2 rounded-lg bg-slate-800/50">
                                            <p className="text-[10px] text-slate-500">View → App</p>
                                            <p className="text-xs font-bold text-white">{funnelData.conversionRates.viewToApp}%</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-slate-800/50">
                                            <p className="text-[10px] text-slate-500">App → Int</p>
                                            <p className="text-xs font-bold text-white">{funnelData.conversionRates.appToInterview}%</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-slate-800/50">
                                            <p className="text-[10px] text-slate-500">Int → Hire</p>
                                            <p className="text-xs font-bold text-white">{funnelData.conversionRates.interviewToHire}%</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 text-slate-400">
            Analytics not available for your role.
        </div>
    );
}
