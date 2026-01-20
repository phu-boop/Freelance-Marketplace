'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface MatchScoreBadgeProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const MatchScoreBadge = ({ score, size = 'md', className = '' }: MatchScoreBadgeProps) => {
    // Determine color based on score
    const getColor = (s: number) => {
        if (s >= 80) return 'from-emerald-400 to-teal-500';
        if (s >= 60) return 'from-blue-400 to-indigo-500';
        if (s >= 40) return 'from-amber-400 to-orange-500';
        return 'from-slate-400 to-slate-500';
    };

    const getBgColor = (s: number) => {
        if (s >= 80) return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
        if (s >= 60) return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
        if (s >= 40) return 'bg-amber-500/10 border-amber-500/20 text-amber-500';
        return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
    };

    const sizeClasses = {
        sm: 'px-1.5 py-0.5 text-[9px]',
        md: 'px-2.5 py-1 text-[10px]',
        lg: 'px-3.5 py-1.5 text-xs',
    };

    const iconSize = {
        sm: 10,
        md: 12,
        lg: 14,
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`inline-flex items-center gap-1.5 rounded-lg border font-bold uppercase tracking-wider ${getBgColor(score)} ${sizeClasses[size]} ${className}`}
        >
            <div className={`relative flex items-center justify-center`}>
                <Sparkles size={iconSize[size]} className="relative z-10" />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`absolute inset-0 bg-current rounded-full blur-[2px] opacity-20`}
                />
            </div>
            <span>{score}% Match</span>
        </motion.div>
    );
};
