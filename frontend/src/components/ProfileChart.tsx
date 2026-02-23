'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProfileChartProps {
    data: any[];
}

export default function ProfileChart({ data }: ProfileChartProps) {
    // Mock data if empty
    const chartData = data && data.length > 0 ? data : [
        { name: 'Jan', earnings: 0 },
        { name: 'Feb', earnings: 1200 },
        { name: 'Mar', earnings: 900 },
        { name: 'Apr', earnings: 2400 },
        { name: 'May', earnings: 1800 },
        { name: 'Jun', earnings: 3500 },
    ];

    return (
        <Card className="p-6 bg-slate-900 border-slate-800">
            <h3 className="text-lg font-bold text-white mb-6">Earnings Overview</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#64748b"
                            tick={{ fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#64748b"
                            tick={{ fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: number) => [`$${value}`, 'Earnings']}
                        />
                        <Area
                            type="monotone"
                            dataKey="earnings"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fill="url(#colorEarnings)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
