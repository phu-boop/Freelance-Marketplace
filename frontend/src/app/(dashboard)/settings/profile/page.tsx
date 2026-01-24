'use client';

import React, { useState, useEffect } from 'react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import { getPublicUrl } from '@/lib/utils';
import {
    Loader2,
    Save,
    User,
    Type,
    DollarSign,
    Camera,
    MapPin,
    Phone,
    Globe,
    ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ImageUpload from '@/components/ImageUpload';
import { useToast } from '@/components/ui/use-toast';

export default function ProfileSettingsPage() {
    const { userId } = useKeycloak();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        title: '',
        overview: '',
        hourlyRate: 0,
        phone: '',
        address: '',
        country: '',
        website: '',
        avatarUrl: '',
        coverImageUrl: '',
        primaryCategoryId: '',
    });

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;
            try {
                const response = await api.get(`/users/${userId}`);
                const user = response.data;
                setFormData({
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    title: user.title || '',
                    overview: user.overview || '',
                    hourlyRate: Number(user.hourlyRate) || 0,
                    phone: user.phone || '',
                    address: user.address || '',
                    country: user.country || '',
                    website: user.website || '',
                    avatarUrl: user.avatarUrl || '',
                    coverImageUrl: user.coverImageUrl || '',
                    primaryCategoryId: user.primaryCategoryId || '',
                });
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                hourlyRate: isNaN(formData.hourlyRate) ? 0 : formData.hourlyRate
            };
            await api.patch(`/users/${userId}`, payload);
            toast({
                title: "Settings Updated",
                description: "Your professional profile has been successfully saved.",
            });
            // We stay on the same page for settings
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            toast({
                title: "Update Failed",
                description: "There was an error saving your changes.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccess = (field: 'avatarUrl' | 'coverImageUrl') => (url: string) => {
        setFormData(prev => ({ ...prev, [field]: url }));
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Visual Appearance Section */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 space-y-8">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <Camera className="w-5 h-5 text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Visual Presence</h2>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Cover Image</label>
                            <div className="relative group/cover h-48 w-full rounded-2xl overflow-hidden bg-slate-800 border-2 border-dashed border-slate-700 hover:border-blue-500 transition-all">
                                {formData.coverImageUrl ? (
                                    <img src={getPublicUrl(formData.coverImageUrl)} className="w-full h-full object-cover" alt="Cover" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
                                        <Camera className="w-8 h-8 opacity-20" />
                                        <span className="text-sm">Upload a professional cover image</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <span className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/20 text-sm font-bold flex items-center gap-2">
                                        <Camera className="w-4 h-4" /> Change Image
                                    </span>
                                </div>
                                <ImageUpload
                                    onUploadSuccess={handleUploadSuccess('coverImageUrl')}
                                    className="absolute inset-0 w-full h-full opacity-0"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative group h-32 w-32 shrink-0">
                                <ImageUpload
                                    currentImage={getPublicUrl(formData.avatarUrl)}
                                    onUploadSuccess={handleUploadSuccess('avatarUrl')}
                                />
                                <div className="absolute -top-2 -right-2 bg-blue-600 rounded-full p-1 border-4 border-slate-900 shadow-xl">
                                    <ShieldCheck className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <div className="text-center md:text-left space-y-1">
                                <h3 className="text-lg font-bold text-white">Profile Photo</h3>
                                <p className="text-sm text-slate-400">Click the photo to upload a new one. Recommended size is 400x400px.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Details Section */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                        <div className="p-2 rounded-lg bg-indigo-500/10">
                            <Type className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Identity & Professional Bio</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400 p-1">First Name</label>
                            <input
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400 p-1">Last Name</label>
                            <input
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400 p-1">Professional Headline</label>
                        <input
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            placeholder="e.g. Senior Full-Stack Engineer | AI Specialist"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400 p-1">Professional Overview</label>
                        <textarea
                            rows={8}
                            value={formData.overview}
                            onChange={e => setFormData({ ...formData, overview: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                            placeholder="Tell potential clients about your journey, expertise and value proposition..."
                        />
                    </div>
                </div>

                {/* Location & Contact */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                            <MapPin className="w-5 h-5 text-orange-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Contact & Localization</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400 p-1">Country / Territory</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    value={formData.country}
                                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400 p-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400 p-1">Personal Website / Portfolio Link</label>
                        <input
                            value={formData.website}
                            onChange={e => setFormData({ ...formData, website: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            placeholder="https://yourname.com"
                        />
                    </div>
                </div>

                {/* Action Bar */}
                <div className="sticky bottom-8 z-20">
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-2xl">
                        <div className="hidden md:block px-4">
                            <p className="text-sm text-slate-400 font-medium">Ready to save your progress?</p>
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 h-12 px-12 rounded-xl font-bold gap-2 shadow-lg shadow-blue-500/20"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Save All Changes
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
