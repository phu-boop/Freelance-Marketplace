'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface ExperienceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: string;
    initialData?: any;
    specializedProfiles?: any[];
}

export const ExperienceModal = ({ isOpen, onClose, onSuccess, userId, initialData, specializedProfiles = [] }: ExperienceModalProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        company: '',
        title: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        specializedProfileId: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                company: initialData.company || '',
                title: initialData.title || '',
                location: initialData.location || '',
                startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
                endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
                current: initialData.current || false,
                description: initialData.description || '',
                specializedProfileId: initialData.specializedProfileId || ''
            });
        } else {
            setFormData({
                company: '',
                title: '',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                description: '',
                specializedProfileId: ''
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: !formData.current && formData.endDate ? new Date(formData.endDate).toISOString() : null
            };

            if (initialData?.id) {
                await api.patch(`/users/experience/${initialData.id}`, payload);
            } else {
                await api.post(`/users/${userId}/experience`, payload);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save experience', error);
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
                    className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">{initialData ? 'Edit Experience' : 'Add Experience'}</h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Company</label>
                            <input
                                required
                                type="text"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                placeholder="TechFlow Inc."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Title</label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                placeholder="Senior Developer"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Location</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                placeholder="Remote / San Francisco"
                            />
                        </div>

                        <div className="flex items-center gap-3 py-2">
                            <input
                                type="checkbox"
                                id="current"
                                checked={formData.current}
                                onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
                                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500/20"
                            />
                            <label htmlFor="current" className="text-sm text-slate-300 cursor-pointer">I am currently working here</label>
                        </div>

                        {specializedProfiles.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Link to Specialized Profile (Optional)</label>
                                <select
                                    value={formData.specializedProfileId}
                                    onChange={(e) => setFormData({ ...formData, specializedProfileId: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">General Profile</option>
                                    {specializedProfiles.map((profile) => (
                                        <option key={profile.id} value={profile.id}>
                                            {profile.headline}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Start Date</label>
                                <input
                                    required
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            {!formData.current && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">End Date</label>
                                    <input
                                        required={!formData.current}
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 min-h-[100px]"
                                placeholder="Describe your responsibilities and achievements..."
                            />
                        </div>

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
                                disabled={loading}
                                className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
