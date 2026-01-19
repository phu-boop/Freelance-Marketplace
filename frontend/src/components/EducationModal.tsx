'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface EducationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: string;
    initialData?: any;
    specializedProfiles?: any[];
}

export const EducationModal = ({ isOpen, onClose, onSuccess, userId, initialData, specializedProfiles = [] }: EducationModalProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        description: '',
        specializedProfileId: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                institution: initialData.institution || '',
                degree: initialData.degree || '',
                fieldOfStudy: initialData.fieldOfStudy || '',
                startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
                endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
                description: initialData.description || '',
                specializedProfileId: initialData.specializedProfileId || ''
            });
        } else {
            setFormData({
                institution: '',
                degree: '',
                fieldOfStudy: '',
                startDate: '',
                endDate: '',
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
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
            };

            if (initialData?.id) {
                await api.patch(`/users/education/${initialData.id}`, payload);
            } else {
                await api.post(`/users/${userId}/education`, payload);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save education', error);
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
                        <h2 className="text-xl font-bold text-white">{initialData ? 'Edit Education' : 'Add Education'}</h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Institution</label>
                            <input
                                required
                                type="text"
                                value={formData.institution}
                                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                placeholder="University of Technology"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Degree</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.degree}
                                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                    placeholder="Bachelor's"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Field of Study</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.fieldOfStudy}
                                    onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                    placeholder="Computer Science"
                                />
                            </div>
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
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">End Date (Optional)</label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 min-h-[100px]"
                                placeholder="Describe your studies..."
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
