'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

interface SkillResultStatsProps {
    score: number;
    feedback: string;
}

export const SkillResultStats: React.FC<SkillResultStatsProps> = ({ score, feedback }) => {
    const isPassed = score >= 80;

    return (
        <div className="space-y-6">
            <div className="relative h-32 flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-900"
                    />
                    <motion.circle
                        initial={{ strokeDashoffset: 364 }}
                        animate={{ strokeDashoffset: 364 - (364 * score) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="364"
                        className={isPassed ? "text-emerald-500" : "text-amber-500"}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black italic">{score}%</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Accuracy</span>
                </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Quote className="w-12 h-12 text-white" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500">AI Match Analysis</h5>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic relative z-10">
                    &quot;{feedback}&quot;
                </p>
                <div className="mt-4 flex gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Status</span>
                        <span className={`text-xs font-bold ${isPassed ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {isPassed ? 'VERIFIED' : 'BELOW THRESHOLD'}
                        </span>
                    </div>
                    <div className="flex flex-col border-l border-slate-800 pl-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Confidence</span>
                        <span className="text-xs font-bold text-white">HIGH</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
