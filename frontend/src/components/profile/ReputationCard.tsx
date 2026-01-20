'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Award, TrendingUp, CheckCircle, Info, ShieldCheck } from 'lucide-react';
import { useCurrency } from '@/components/CurrencyProvider';

interface Badge {
    name: string;
    slug: string;
    iconUrl?: string;
    awardedAt: string;
}

interface ReputationCardProps {
    jss: number;
    badges: Badge[];
    reviewCount: number;
    rating: number;
    totalEarnings?: number;
}

export default function ReputationCard({ jss, badges, reviewCount, rating, totalEarnings }: ReputationCardProps) {
    const { formatAmount } = useCurrency();

    const getJssColor = (score: number) => {
        if (score >= 90) return 'text-emerald-500';
        if (score >= 80) return 'text-blue-500';
        if (score >= 70) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getBadgeConfig = (name: string) => {
        switch (name) {
            case 'TOP_RATED_PLUS':
                return { label: 'Top Rated Plus', icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' };
            case 'TOP_RATED':
                return { label: 'Top Rated', icon: Star, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
            case 'RISING_TALENT':
                return { label: 'Rising Talent', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
            case 'IDENTITY_VERIFIED':
                return { label: 'Identity Verified', icon: ShieldCheck, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' };
            default:
                return { label: name.replace('_', ' '), icon: CheckCircle, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
        }
    };

    return (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex justify-between items-start">
                <h3 className="font-semibold text-white">Trust & Reputation</h3>
                <div className="group relative">
                    <Info className="w-4 h-4 text-slate-500 cursor-help" />
                    <div className="absolute right-0 top-6 w-48 p-3 rounded-xl bg-slate-800 border border-slate-700 text-[10px] text-slate-400 invisible group-hover:visible z-50 shadow-2xl">
                        JSS (Job Success Score) reflects overall client satisfaction, factoring in private feedback, contract size, and repeat hires.
                    </div>
                </div>
            </div>

            {/* JSS Meter */}
            <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <span className="text-sm text-slate-400">Job Success Score</span>
                    <span className={`text-2xl font-black ${getJssColor(jss)}`}>{jss}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${jss}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full ${jss >= 90 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Total Earnings</div>
                    <div className="text-sm font-bold text-white">{formatAmount(totalEarnings || 0)}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Jobs Completed</div>
                    <div className="text-sm font-bold text-white">{reviewCount}</div>
                </div>
            </div>

            {/* Badges Section */}
            <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Platform Status</span>
                <div className="flex flex-wrap gap-2">
                    {badges.map((badge, idx) => {
                        const config = getBadgeConfig(badge.name);
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${config.bg} ${config.border} ${config.color}`}
                            >
                                <config.icon className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-bold">{config.label}</span>
                            </motion.div>
                        );
                    })}
                    {badges.length === 0 && (
                        <p className="text-xs text-slate-500 italic">No formal badges awarded yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
