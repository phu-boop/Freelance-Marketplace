'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

interface FunnelStep {
    name: string;
    count: number;
}

interface FunnelChartProps {
    data: FunnelStep[];
}

export default function FunnelChart({ data }: FunnelChartProps) {
    const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'];

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                        cursor={{ fill: '#1e293b' }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={40}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        <LabelList dataKey="count" position="right" style={{ fill: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
