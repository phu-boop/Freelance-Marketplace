'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Briefcase, Plus, Trash2 } from 'lucide-react';
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
    const [formData, setFormData] = useState({
        headline: '',
        bio: '',
        hourlyRate: 0,
        skills: [] as string[],
        primaryCategoryId: '',
        isDefault: false
    });
    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                headline: initialData.headline || '',
                bio: initialData.bio || '',
                hourlyRate: Number(initialData.hourlyRate) || 0,
                skills: initialData.skills || [],
                primaryCategoryId: initialData.primaryCategoryId || '',
                isDefault: initialData.isDefault || false
            });
        } else {
            setFormData({
                headline: '',
                bio: '',
                hourlyRate: 0,
                skills: [],
                primaryCategoryId: '',
                isDefault: false
            });
        }
    }, [initialData, isOpen]);

    const addSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await api.patch(`/specialized-profiles/${initialData.id}`, formData);
            } else {
                await api.post(`/specialized-profiles?userId=${userId}`, formData);
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save specialized profile', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-blue-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white">{initialData ? 'Edit Specialized Profile' : 'Create Specialized Profile'}</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-medium text-slate-400">Professional Headline</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.headline}
                                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                                    placeholder="e.g. Senior Mobile Architect - Flutter & Native iOS"
                                />
                            </div>

                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-medium text-slate-400">Profile Bio</label>
                                <textarea
                                    required
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                                    placeholder="Highlight specific achievements and expertise relevant to this profile..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Hourly Rate ($)</label>
                                <input
                                    required
                                    type="number"
                                    value={formData.hourlyRate}
                                    onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                                    placeholder="45"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Category</label>
                                <select
                                    required
                                    value={formData.primaryCategoryId}
                                    onChange={(e) => setFormData({ ...formData, primaryCategoryId: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Mobile Development">Mobile Development</option>
                                    <option value="Web Development">Web Development</option>
                                    <option value="DevOps">DevOps</option>
                                    <option value="AI / Machine Learning">AI / Machine Learning</option>
                                    <option value="Blockchain">Blockchain</option>
                                </select>
                            </div>

                            <div className="space-y-4 col-span-2 p-4 rounded-2xl bg-slate-800/30 border border-slate-800">
                                <label className="text-sm font-medium text-slate-400">Profile Skills</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                        className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                        placeholder="Add a specific skill..."
                                    />
                                    <button
                                        type="button"
                                        onClick={addSkill}
                                        className="px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2">
                                            {skill}
                                            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-400 p-0.5">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                    {formData.skills.length === 0 && (
                                        <p className="text-xs text-slate-500 italic">No specific skills added to this profile yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
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
