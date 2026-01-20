'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, DollarSign, Users, CheckCircle, Percent } from 'lucide-react';
import api from '@/lib/api';
import { useCurrency } from '@/components/CurrencyProvider';

interface ClientReputationProps {
    clientId: string;
}

interface ClientMeta {
    id: string;
    firstName: string;
    lastName: string;
    country: string;
    createdAt: string;
    totalSpend: number;
    jobsPostedCount: number;
    jobsHiredCount: number;
    isPaymentVerified: boolean;
}

export default function ClientReputation({ clientId }: ClientReputationProps) {
    const [client, setClient] = useState<ClientMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const { formatAmount } = useCurrency();

    useEffect(() => {
        if (clientId) {
            api.get(`/users/${clientId}`)
                .then(res => setClient(res.data))
                .catch(err => console.error('Failed to fetch client metrics', err))
                .finally(() => setLoading(false));
        }
    }, [clientId]);

    if (loading) return <div className="animate-pulse h-32 bg-slate-800/50 rounded-2xl border border-slate-800" />;
    if (!client) return null;

    const hiringRate = client.jobsPostedCount > 0
        ? Math.round((client.jobsHiredCount / client.jobsPostedCount) * 100)
        : 0;

    return (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">About the Client</h3>

            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                    {client.firstName?.[0]}{client.lastName?.[0]}
                </div>
                <div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">{client.firstName} {client.lastName}</span>
                        {client.isPaymentVerified && (
                            <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <MapPin className="w-3 h-3" /> {client.country || 'International'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                        <Percent className="w-3 h-3" /> Hiring Rate
                    </div>
                    <div className="text-xs font-bold text-white">{hiringRate}%</div>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                        <DollarSign className="w-3 h-3" /> Total Spend
                    </div>
                    <div className="text-xs font-bold text-white">{formatAmount(Number(client.totalSpend) || 0)}</div>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                        <Users className="w-3 h-3" /> Jobs Posted
                    </div>
                    <div className="text-xs font-bold text-white">{client.jobsPostedCount}</div>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                        <Calendar className="w-3 h-3" /> Member Since
                    </div>
                    <div className="text-xs font-bold text-white">{new Date(client.createdAt).getFullYear()}</div>
                </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
                <div className="text-[10px] text-slate-500 italic">
                    Hiring rate reflects the percentage of this client's open jobs that resulted in a contract.
                </div>
            </div>
        </div>
    );
}
