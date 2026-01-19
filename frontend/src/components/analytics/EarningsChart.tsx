'use client';

import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface EarningsChartProps {
    data: { name: string; amount: number; type: 'Past' | 'Predicted' }[];
}

export default function EarningsChart({ data }: EarningsChartProps) {
    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Bar
                        dataKey="amount"
                        name="Earnings"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        barSize={30}
                    />
                    <Line
                        type="monotone"
                        dataKey="amount"
                        name="Trend"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#6366f1', strokeWidth: 2 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
