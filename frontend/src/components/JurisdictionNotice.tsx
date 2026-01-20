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
    const [clauses, setClauses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (countryCode) {
            fetchJurisdiction(countryCode);
        }
    }, [countryCode]);

    const fetchJurisdiction = async (code: string) => {
        setLoading(true);
        try {
            // Updated endpoint
            const res = await api.get(`/contracts/jurisdiction/${code}`);
            setClauses(res.data);
        } catch (err) {
            console.error('Failed to fetch jurisdiction info', err);
        } finally {
            setLoading(false);
        }
    };

    if (!countryCode || clauses.length === 0) return null;

    return (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-blue-400">
                <Scale className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wider">Legal Jurisdiction: {countryCode}</span>
            </div>

            <div className="space-y-3">
                {clauses.map((clause, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/50 space-y-1">
                        <div className="flex items-center gap-2">
                            {clause.mandatory && (
                                <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-[10px] font-bold text-red-400 uppercase">Mandatory</span>
                            )}
                            <h4 className="text-xs font-bold text-slate-300">{clause.title}</h4>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed italic">"{clause.content}"</p>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                <Info className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-medium text-indigo-300">
                    These clauses will be automatically appended to your contract PDF.
                </span>
            </div>
        </div>
    );
}
