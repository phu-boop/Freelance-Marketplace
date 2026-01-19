'use client';

import React from 'react';

interface MarketComparisonProps {
    skill: string;
    userRate: number;
    marketData: {
        medianRate: number;
        top25Percentile: number;
        bottom25Percentile: number;
        currency: string;
    };
}

export default function MarketComparison({ skill, userRate, marketData }: MarketComparisonProps) {
    const min = marketData.bottom25Percentile * 0.5;
    const max = marketData.top25Percentile * 1.5;
    const range = max - min;

    const getPosition = (val: number) => {
        return ((val - min) / range) * 100;
    };

    const userPos = Math.min(100, Math.max(0, getPosition(userRate)));
    const medianPos = getPosition(marketData.medianRate);

    return (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                <span>{skill} Market Rates</span>
                <span className="text-white font-bold">{userRate} {marketData.currency}/hr</span>
            </div>

            <div className="relative h-2 w-full bg-slate-800 rounded-full mt-6">
                {/* Median Marker */}
                <div
                    className="absolute top-0 w-0.5 h-4 bg-slate-500 -translate-y-1"
                    style={{ left: `${medianPos}%` }}
                />

                {/* User Marker */}
                <div
                    className="absolute top-0 w-3 h-3 bg-blue-500 rounded-full -translate-y-[2px] -translate-x-1.5 shadow-lg shadow-blue-500/50 z-10"
                    style={{ left: `${userPos}%` }}
                />

                {/* Range Labels */}
                <div className="absolute -bottom-6 w-full flex justify-between text-[10px] text-slate-500">
                    <span>Low</span>
                    <span style={{ marginLeft: `${medianPos - 5}%` }}>Median</span>
                    <span>High</span>
                </div>
            </div>

            <div className="pt-6 text-[11px] text-slate-500 italic">
                {userRate > marketData.medianRate
                    ? `You are charging above the market median for ${skill}.`
                    : `Your rate is competitive compared to other ${skill} professionals.`
                }
            </div>
        </div>
    );
}
