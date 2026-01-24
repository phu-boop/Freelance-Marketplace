'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { DollarSign, Briefcase, Clock, Star } from 'lucide-react';
import { useCurrency } from '@/components/CurrencyProvider';

interface StatsCardsProps {
    stats: any;
    isFreelancer: boolean;
}

export default function StatsCards({ stats, isFreelancer }: StatsCardsProps) {
    const { formatAmount } = useCurrency(); // Using correctly named formatAmount

    // Fallback to manual format if hook is loading or unavailable, but formatAmount handles currency context
    const formatCurrency = (amount: number) => {
        return formatAmount ? formatAmount(amount) : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const items = isFreelancer ? [
        { label: 'Total Earnings', value: formatCurrency(stats.earnings), icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
        { label: 'Jobs Completed', value: stats.jobsCompleted, icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Hours Worked', value: stats.hoursWorked, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { label: 'Rating', value: stats.rating.toFixed(1), icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    ] : [
        { label: 'Total Spent', value: formatCurrency(stats.totalSpent), icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
        { label: 'Total Hires', value: stats.totalHires, icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Active Jobs', value: '3', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10' }, // Mock active jobs
        { label: 'Avg Rating', value: stats.rating.toFixed(1), icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {items.map((item, idx) => (
                <Card key={idx} className="p-5 bg-slate-900 border-slate-800 hover:border-slate-700 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${item.bg} group-hover:scale-110 transition-transform`}>
                            <item.icon className={`w-6 h-6 ${item.color}`} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 font-medium">{item.label}</p>
                            <h3 className="text-2xl font-bold text-white">{item.value}</h3>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
