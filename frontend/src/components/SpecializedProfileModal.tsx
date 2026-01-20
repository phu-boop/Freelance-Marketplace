'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Plus, Trash2, Briefcase, GraduationCap, Award, Box, Check } from 'lucide-react';
import api from '@/lib/api';

interface SpecializedProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: string;
    initialData?: any;
}

export const SpecializedProfileModal = ({ isOpen, onClose, onSuccess, userId, initialData }: SpecializedProfileModalProps) => {
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);
    const [activeSection, setActiveSection] = useState<'details' | 'experience' | 'education' | 'portfolio' | 'certifications'>('details');

    const [formData, setFormData] = useState({
        headline: '',
        bio: '',
        hourlyRate: 0,
        skills: [] as string[],
        isDefault: false
    });

    const [userHistory, setUserHistory] = useState({
        experience: [] as any[],
        education: [] as any[],
        portfolio: [] as any[],
        certifications: [] as any[]
    });

    const [linkedIds, setLinkedIds] = useState({
        experience: [] as string[],
        education: [] as string[],
        portfolio: [] as string[],
        certifications: [] as string[]
    });

    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        if (isOpen && userId) {
            fetchUserHistory();
        }

        if (initialData) {
            setFormData({
                headline: initialData.headline || '',
                bio: initialData.bio || '',
                hourlyRate: initialData.hourlyRate || 0,
                skills: initialData.skills || [],
                isDefault: initialData.isDefault || false
            });

            setLinkedIds({
                experience: initialData.experience?.map((i: any) => i.id) || [],
                education: initialData.education?.map((i: any) => i.id) || [],
                portfolio: initialData.portfolioItems?.map((i: any) => i.id) || [],
                certifications: initialData.certifications?.map((i: any) => i.id) || []
            });
        } else {
            setFormData({
                headline: '',
                bio: '',
                hourlyRate: 0,
                skills: [],
                isDefault: false
            });
            setLinkedIds({
                experience: [],
                education: [],
                portfolio: [],
                certifications: []
            });
        }
    }, [initialData, isOpen, userId]);

    const fetchUserHistory = async () => {
        setFetchingData(true);
        try {
            const res = await api.get(`/users/${userId}`);
            setUserHistory({
                experience: res.data.experience || [],
                education: res.data.education || [],
                portfolio: res.data.portfolio || [],
                certifications: res.data.certifications || []
            });
        } catch (error) {
            console.error('Failed to fetch user history', error);
        } finally {
            setFetchingData(false);
        }
    };

    const handleAddSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setFormData({ ...formData, skills: formData.skills.filter((s: string) => s !== skillToRemove) });
    };

    const toggleLink = (type: keyof typeof linkedIds, id: string) => {
        setLinkedIds((prev: typeof linkedIds) => ({
            ...prev,
            [type]: prev[type].includes(id)
                ? prev[type].filter((item: string) => item !== id)
                : [...prev[type], id]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let profileId = initialData?.id;

            if (profileId) {
                await api.patch(`/profiles/specialized/${profileId}`, formData);
            } else {
                const res = await api.post(`/profiles/specialized`, formData);
                profileId = res.data.id;
            }

            // Sync links - Simplified for now, in a real app we'd determine exactly what to link/unlink
            // or have a batch endpoint.
            const types = ['experience', 'education', 'portfolio', 'certifications'] as const;

            for (const type of types) {
                const items = userHistory[type];
                for (const item of items) {
                    const isLinkedNow = linkedIds[type].includes(item.id);
                    const wasLinkedBefore = initialData?.[type === 'portfolio' ? 'portfolioItems' : type]?.some((i: any) => i.id === item.id);

                    if (isLinkedNow && !wasLinkedBefore) {
                        const linkType = type === 'portfolio' ? 'portfolio' : type === 'certifications' ? 'certification' : type;
                        await api.post(`/profiles/specialized/${profileId}/link-${linkType}/${item.id}`);
                    } else if (!isLinkedNow && wasLinkedBefore) {
                        const unlinkType = type === 'portfolio' ? 'portfolio' : type === 'certifications' ? 'certification' : type;
                        await api.post(`/profiles/specialized/unlink/${unlinkType}/${item.id}`);
                    }
                }
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to save specialized profile', error);
            alert(error.response?.data?.message || 'Failed to save specialized profile');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">{initialData ? 'Edit Specialized Profile' : 'Create Specialized Profile'}</h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex border-b border-slate-800 bg-slate-950/30 overflow-x-auto">
                        {[
                            { id: 'details', icon: Box, label: 'Profile Details' },
                            { id: 'experience', icon: Briefcase, label: 'Experience' },
                            { id: 'education', icon: GraduationCap, label: 'Education' },
                            { id: 'portfolio', icon: Box, label: 'Portfolio' },
                            { id: 'certifications', icon: Award, label: 'Certifications' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSection(tab.id as any)}
                                className={`px-5 py-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${activeSection === tab.id
                                    ? 'text-blue-500 border-blue-500 bg-blue-500/5'
                                    : 'text-slate-500 border-transparent hover:text-slate-300'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {linkedIds[tab.id as keyof typeof linkedIds]?.length > 0 && (
                                    <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-[10px] text-white">
                                        {linkedIds[tab.id as keyof typeof linkedIds].length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {activeSection === 'details' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Headline</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.headline}
                                        onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                        placeholder="e.g. Expert React Developer"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Bio / Overview</label>
                                    <textarea
                                        required
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 min-h-[120px]"
                                        placeholder="Describe your expertise in this specialized area..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Hourly Rate ($)</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.hourlyRate}
                                        onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Specialized Skills</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                            placeholder="Add a skill..."
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddSkill}
                                            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all"
                                        >
                                            <Plus className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.skills.map((skill: string) => (
                                            <span key={skill} className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-xs text-slate-300 border border-slate-700 rounded-full">
                                                {skill}
                                                <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-red-400">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <input
                                        type="checkbox"
                                        id="isDefault"
                                        checked={formData.isDefault}
                                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500/50"
                                    />
                                    <label htmlFor="isDefault" className="text-sm text-slate-400">Set as default specialized profile</label>
                                </div>
                            </>
                        )}

                        {fetchingData ? (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                            </div>
                        ) : activeSection !== 'details' && (
                            <div className="space-y-3">
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Select items to display on this profile</p>
                                {userHistory[activeSection as keyof typeof userHistory].map((item: any) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => toggleLink(activeSection as any, item.id)}
                                        className={`w-full p-4 rounded-2xl border text-left transition-all relative group ${linkedIds[activeSection as keyof typeof linkedIds].includes(item.id)
                                            ? 'bg-blue-600/10 border-blue-500/50 ring-1 ring-blue-500/30'
                                            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-white text-sm truncate">{item.title || item.role || item.degree || 'Untitled'}</h4>
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.company || item.institution || item.issuer || item.description}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center shrink-0 ${linkedIds[activeSection as keyof typeof linkedIds].includes(item.id)
                                                ? 'bg-blue-500 border-blue-500 text-white'
                                                : 'border-slate-600'
                                                }`}>
                                                {linkedIds[activeSection as keyof typeof linkedIds].includes(item.id) && <Check className="w-3 h-3" />}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                                {userHistory[activeSection as keyof typeof userHistory].length === 0 && (
                                    <div className="py-12 text-center bg-slate-800/20 border border-dashed border-slate-800 rounded-3xl">
                                        <p className="text-sm text-slate-500 italic">No {activeSection} found in your history.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || fetchingData}
                                className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (initialData ? 'Update Profile' : 'Create Profile')}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
