'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { ShieldAlert, Info, Scale } from 'lucide-react';

interface LegalRequirement {
    jurisdiction: string;
    requiredClauses: string[];
    isGdprSubject: boolean;
    taxIdType?: string;
}

interface JurisdictionNoticeProps {
    countryCode?: string;
}

export default function JurisdictionNotice({ countryCode }: JurisdictionNoticeProps) {
    const [reqs, setReqs] = useState<LegalRequirement | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (countryCode) {
            fetchJurisdiction(countryCode);
        }
    }, [countryCode]);

    const fetchJurisdiction = async (code: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/users/jurisdiction/${code}`);
            setReqs(res.data);
        } catch (err) {
            console.error('Failed to fetch jurisdiction info', err);
        } finally {
            setLoading(false);
        }
    };

    if (!countryCode || !reqs) return null;

    return (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-blue-400">
                <Scale className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wider">Legal Framework: {reqs.jurisdiction}</span>
            </div>

            <div className="space-y-2">
                {reqs.requiredClauses.map((clause, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                        <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <p>{clause}</p>
                    </div>
                ))}
            </div>

            {reqs.isGdprSubject && (
                <div className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    <ShieldAlert className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-medium text-indigo-300">Subject to GDPR Data Protection Regulations</span>
                </div>
            )}

            {reqs.taxIdType && (
                <div className="flex items-center gap-2 text-[10px] text-slate-500 italic">
                    <Info className="w-3 h-3" />
                    <span>Hiring in this region requires a valid {reqs.taxIdType}.</span>
                </div>
            )}
        </div>
    );
}
