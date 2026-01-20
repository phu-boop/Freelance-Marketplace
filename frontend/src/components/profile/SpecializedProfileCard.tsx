'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Settings, Trash2, CheckCircle2 } from 'lucide-react';
import { useCurrency } from '@/components/CurrencyProvider';

interface SpecializedProfileCardProps {
    profile: any;
    onEdit: (profile: any) => void;
    onDelete: (id: string) => void;
    onSetDefault: (id: string) => void;
}

export default function SpecializedProfileCard({ profile, onEdit, onDelete, onSetDefault }: SpecializedProfileCardProps) {
    const { formatAmount } = useCurrency();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-2xl border transition-all ${profile.isDefault
                    ? 'bg-blue-600/5 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                    : 'bg-slate-900 border-slate-800'
                }`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${profile.isDefault ? 'bg-blue-600/20' : 'bg-slate-800'
                        }`}>
                        <Briefcase className={`w-6 h-6 ${profile.isDefault ? 'text-blue-400' : 'text-slate-400'}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-lg">{profile.headline || 'Untitled Profile'}</h3>
                            {profile.isDefault && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Default
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-400">{profile.primaryCategoryId || 'Global Profile'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(profile)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                        title="Edit Profile"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                    {!profile.isDefault && (
                        <button
                            onClick={() => onDelete(profile.id)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                            title="Delete Profile"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <p className="text-sm text-slate-300 line-clamp-2 mb-6 h-10">
                {profile.bio || 'This specialized profile highlights specific skills and experience for targeted clients.'}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                <div className="flex items-center gap-1.5">
                    <span className="text-xl font-black text-white">{formatAmount(Number(profile.hourlyRate) || 0)}</span>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">/ hr</span>
                </div>

                {!profile.isDefault && (
                    <button
                        onClick={() => onSetDefault(profile.id)}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        Set as default
                    </button>
                )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {profile.skills?.slice(0, 3).map((skill: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-400 font-bold border border-slate-700/50 uppercase tracking-tighter">
                        {skill}
                    </span>
                ))}
                {profile.skills?.length > 3 && (
                    <span className="text-[10px] text-slate-500 font-bold">+{profile.skills.length - 3} more</span>
                )}
            </div>
        </motion.div>
    );
}
