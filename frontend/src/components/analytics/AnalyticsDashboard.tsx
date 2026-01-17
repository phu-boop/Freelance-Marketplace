'use client';

import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@/components/KeycloakProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell } from 'recharts';
import { DollarSign, Briefcase, TrendingUp, Award, Activity } from 'lucide-react';
import axios from 'axios';

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;
            setLoading(true);
            try {
                // Determine base URL relative to Next.js (which proxies to 3014)
                const baseUrl = '/api/analytics';

                if (isFreelancer) {
                    const [overviewRes, earningsRes] = await Promise.all([
                        axios.get(`${baseUrl}/freelancer/overview?user_id=${userId}`),
                        axios.get(`${baseUrl}/freelancer/earnings?user_id=${userId}`)
                    ]);

                    setOverview(overviewRes.data);
                    // Reverse to show oldest to newest
                    setEarningsData([...earningsRes.data.monthly_earnings].reverse());

                    const predictiveRes = await axios.get(`/api/payments/revenue/predictive/${userId}`);
                    setPredictive(predictiveRes.data);
                } else if (isClient) {
                    const res = await axios.get(`${baseUrl}/client/spend?user_id=${userId}`);
                    setClientSpend(res.data);
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
                        <CardHeader>
                            <CardTitle className="text-slate-200">Revenue Forecast</CardTitle>
                            <CardDescription className="text-slate-400">Past earnings vs Future projections</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[
                                        ...earningsData.map(e => ({ name: e.month, amount: e.amount, type: 'Past' })),
                                        ...(predictive ? Object.entries(predictive.projections).map(([month, amount]) => ({ name: month, amount: amount, type: 'Projected' })) : [])
                                    ]}>
                                        <XAxis
                                            dataKey="name"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `$${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                            cursor={{ fill: '#334155' }}
                                        />
                                        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                            {
                                                [
                                                    ...earningsData.map(e => ({ type: 'Past' })),
                                                    ...(predictive ? Object.entries(predictive.projections).map(() => ({ type: 'Projected' })) : [])
                                                ].map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.type === 'Past' ? '#3b82f6' : '#6366f1'} fillOpacity={entry.type === 'Past' ? 1 : 0.6} />
                                                ))
                                            }
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="col-span-3 bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-slate-200">Recent Activity</CardTitle>
                            <CardDescription className="text-slate-400">
                                You made 2 proposals this week.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Placeholder for recent activity list */}
                                <div className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none text-white">Proposal Sent</p>
                                        <p className="text-sm text-slate-500">To Job: E-commerce Website</p>
                                    </div>
                                    <div className="ml-auto font-medium text-slate-400">Just now</div>
                                </div>
                                <div className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none text-white">Payment Received</p>
                                        <p className="text-sm text-slate-500">+$50.00 from Client B</p>
                                    </div>
                                    <div className="ml-auto font-medium text-green-500">2h ago</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
