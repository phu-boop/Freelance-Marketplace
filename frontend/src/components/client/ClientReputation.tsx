'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Star,
    Briefcase,
    DollarSign,
    Clock,
    MapPin,
    ShieldCheck,
    Award
} from 'lucide-react';

interface ClientReputationProps {
    client: {
        id: string;
        name: string;
        location?: string;
        totalSpend: number;
        hireRate: number; // 0-100
        avgHourlyRate: number;
        jobsPosted: number;
        reviews: number;
        rating: number; // 0-5
        memberSince: string;
        isPaymentVerified: boolean;
        badges?: string[]; // e.g. ['ENTERPRISE', 'BIG_SPENDER']
    };
}

export default function ClientReputation({ client }: ClientReputationProps) {
    const stars = Array(5).fill(0).map((_, i) => (
        <Star
            key={i}
            className={`w-4 h-4 ${i < Math.floor(client.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-slate-700'}`}
        />
    ));

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">About the Client</h3>

            {/* Payment Verification */}
            <div className="flex items-center gap-2 mb-6">
                {client.isPaymentVerified ? (
                    <div className="flex items-center gap-2 text-emerald-400 font-medium">
                        <div className="p-1 bg-emerald-500/10 rounded-full">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        Payment Verified
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-slate-500">
                        <div className="p-1 bg-slate-800 rounded-full">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        Payment Unverified
                    </div>
                )}

                <div className="flex text-yellow-500">
                    {stars}
                    <span className="ml-2 text-slate-400 text-sm">({client.rating})</span>
                </div>
            </div>

            {/* Location & Time */}
            <div className="flex flex-col gap-2 mb-6 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    {client.location || 'Unknown Location'}
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    Member since {new Date(client.memberSince).toLocaleDateString()}
                </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Total Spend</p>
                    <div className="text-white font-mono font-bold">
                        ${client.totalSpend > 1000 ? `${(client.totalSpend / 1000).toFixed(1)}k+` : client.totalSpend}
                    </div>
                </div>
                <div>
                    <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Avg Rate</p>
                    <div className="text-white font-mono font-bold">
                        ${client.avgHourlyRate.toFixed(2)}/hr
                    </div>
                </div>
                <div>
                    <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Jobs Posted</p>
                    <div className="text-white font-mono font-bold">{client.jobsPosted}</div>
                </div>
                <div>
                    <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Hire Rate</p>
                    <div className={`font-mono font-bold ${client.hireRate > 70 ? 'text-green-400' : client.hireRate > 40 ? 'text-yellow-500' : 'text-slate-400'}`}>
                        {client.hireRate}%
                    </div>
                </div>
            </div>

            {/* Badges */}
            {client.badges && client.badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {client.badges.includes('ENTERPRISE') && (
                        <div className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-bold rounded-full flex items-center gap-1 border border-blue-500/30">
                            <Briefcase className="w-3 h-3" /> Enterprise
                        </div>
                    )}
                    {client.totalSpend > 10000 && (
                        <div className="px-3 py-1 bg-purple-600/20 text-purple-400 text-xs font-bold rounded-full flex items-center gap-1 border border-purple-500/30">
                            <Award className="w-3 h-3" /> Big Spender
                        </div>
                    )}
                </div>
            )}

            <p className="text-xs text-slate-500 mt-4 italic">
                Stats based on activity from last 12 months.
            </p>
        </div>
    );
}
