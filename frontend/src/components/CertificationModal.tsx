'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Award } from 'lucide-react';
import api from '@/lib/api';

interface CertificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: string;
    initialData?: any;
    specializedProfiles?: any[];
}

export const CertificationModal = ({ isOpen, onClose, onSuccess, userId, initialData, specializedProfiles = [] }: CertificationModalProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        issuer: '',
        issuerId: '',
        verificationUrl: '',
        specializedProfileId: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                issuer: initialData.issuer || '',
                issuerId: initialData.issuerId || '',
                verificationUrl: initialData.verificationUrl || '',
                specializedProfileId: initialData.specializedProfileId || ''
            });
        } else {
            setFormData({
                title: '',
                issuer: '',
                issuerId: '',
                verificationUrl: '',
                specializedProfileId: ''
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await api.patch(`/users/certifications/${initialData.id}`, formData);
            } else {
                await api.post(`/users/${userId}/certifications`, formData);
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save certification', error);
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
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                <Award className="w-5 h-5 text-orange-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white">{initialData ? 'Edit Certification' : 'Add Certification'}</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Certification Name</label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                placeholder="e.g. AWS Certified Solutions Architect"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Issuing Organization</label>
                            <input
                                required
                                type="text"
                                value={formData.issuer}
                                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                placeholder="e.g. Amazon Web Services"
                            />
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Credential ID</label>
                                <input
                                    type="text"
                                    value={formData.issuerId}
                                    onChange={(e) => setFormData({ ...formData, issuerId: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                    placeholder="Credential ID"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Verification URL</label>
                                <input
                                    type="url"
                                    value={formData.verificationUrl}
                                    onChange={(e) => setFormData({ ...formData, verificationUrl: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                    placeholder="https://..."
                                />
                            </div>
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
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Certification'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
