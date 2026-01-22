'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useKeycloak } from './KeycloakProvider';
import { ChevronDown, UserCircle, CheckCircle2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface SpecializedProfile {
    id: string;
    headline: string;
    isDefault: boolean;
    primaryCategoryId: string;
}

export const ProfileSwitcher = () => {
    const { authenticated, roles } = useKeycloak();
    const [profiles, setProfiles] = useState<SpecializedProfile[]>([]);
    const [activeProfile, setActiveProfile] = useState<SpecializedProfile | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const isFreelancer = roles.includes('FREELANCER');

    useEffect(() => {
        if (authenticated && isFreelancer) {
            fetchProfiles();
        }
    }, [authenticated, isFreelancer]);

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const response = await api.get('/profiles/specialized');
            setProfiles(response.data);

            // Set active profile from localStorage or default
            const savedProfileId = localStorage.getItem('active_specialized_profile_id');
            const foundActive = response.data.find((p: SpecializedProfile) => p.id === savedProfileId)
                || response.data.find((p: SpecializedProfile) => p.isDefault)
                || response.data[0];

            if (foundActive) {
                setActiveProfile(foundActive);
                localStorage.setItem('active_specialized_profile_id', foundActive.id);
            }
        } catch (error) {
            console.error('Failed to fetch specialized profiles', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (profile: SpecializedProfile) => {
        setActiveProfile(profile);
        localStorage.setItem('active_specialized_profile_id', profile.id);
        setIsOpen(false);
        // Dispatch event for other components to react
        window.dispatchEvent(new Event('specialized_profile_changed'));
    };

    if (!isFreelancer || (profiles.length === 0 && !loading)) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
            >
                <UserCircle className="w-3.5 h-3.5 text-blue-400" />
                <span className="max-w-[120px] truncate">
                    {activeProfile?.headline || 'General Profile'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-50" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute left-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-[60] overflow-hidden"
                        >
                            <div className="p-2 border-b border-slate-800 bg-slate-800/30">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Active Profile</p>
                            </div>

                            <div className="p-1">
                                {profiles.map((profile) => (
                                    <button
                                        key={profile.id}
                                        onClick={() => handleSelect(profile)}
                                        className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-xs rounded-lg transition-colors ${activeProfile?.id === profile.id
                                                ? 'bg-blue-600/10 text-blue-400'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                            }`}
                                    >
                                        <span className="truncate flex-1 text-left font-medium">
                                            {profile.headline}
                                        </span>
                                        {activeProfile?.id === profile.id && (
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                ))}

                                {profiles.length < 3 && (
                                    <Link
                                        href="/profile/specialized/new"
                                        className="w-full flex items-center gap-3 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border-t border-slate-800 mt-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Create Specialized Profile
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
