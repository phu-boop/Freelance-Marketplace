'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Copy, Gift, Users, Coins, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ReferralWidget() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            // First treat as "generate" if no code exists, logic typically handles check
            const res = await api.post('/referrals/generate');
            if (res.data) {
                // If generated or retrieved, then fetch stats
                // Actually my controller split generate and stats.
                // Let's call generate first to ensure we have a code.
                const statsRes = await api.get('/referrals/stats');
                setStats(statsRes.data);
            }
        } catch (err) {
            console.error('Failed to load referral info', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const copyCode = () => {
        if (stats?.code) {
            navigator.clipboard.writeText(`https://freelance.app/signup?ref=${stats.code}`);
            toast.success('Referral link copied to clipboard!');
        }
    };

    if (loading) return <div className="h-48 bg-slate-900 rounded-2xl animate-pulse" />;

    return (
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform rotate-12">
                <Gift className="w-32 h-32" />
            </div>

            <div className="relative z-10 w-full">
                <div className="flex items-center gap-2 mb-2">
                    <Share2 className="w-5 h-5 text-indigo-300" />
                    <h2 className="font-bold text-lg">Invite & Earn</h2>
                </div>
                <p className="text-indigo-200 text-sm mb-6 max-w-md">
                    Give friends 50 free Connects. You earn 50 Connects when they spend $100.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase mb-1">
                            <Users className="w-3 h-3" /> Invites
                        </div>
                        <p className="text-2xl font-black">{stats?.totalInvites || 0}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex items-center gap-2 text-yellow-300 text-xs font-bold uppercase mb-1">
                            <Coins className="w-3 h-3" /> Earned
                        </div>
                        <p className="text-2xl font-black">{stats?.earnedConnects || 0}</p>
                    </div>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-1 pr-1 flex items-center justify-between border border-white/10">
                    <code className="px-4 py-2 font-mono font-bold text-indigo-300 tracking-widest">
                        {stats?.code || '------'}
                    </code>
                    <button
                        onClick={copyCode}
                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                    >
                        <Copy className="w-3 h-3" />
                        Link
                    </button>
                </div>
            </div>
        </div>
    );
}
