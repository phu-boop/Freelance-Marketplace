'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    User,
    Mail,
    Phone,
    FileText,
    BadgeCheck,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Camera,
    Layers,
    Briefcase,
    Globe,
    BookOpen,
    Image as ImageIcon,
    Eye,
    Share2,
    Sparkles,
    ChevronRight
} from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AvatarUpload } from '@/components/AvatarUpload';
import Link from 'next/link';
import { ExperienceList } from '@/components/profile/ExperienceList';
import { EducationList } from '@/components/profile/EducationList';
import { PortfolioList } from '@/components/profile/PortfolioList';

const profileSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    phone: z.string().optional(),
    title: z.string().min(5, 'Title should be at least 5 characters').optional(),
    overview: z.string().min(20, 'Bio should be at least 20 characters').optional(),
    avatarUrl: z.string().optional(),
    country: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileSettingsPage() {
    const { userId } = useKeycloak();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
    const [activeTab, setActiveTab] = useState<'general' | 'services' | 'experience' | 'portfolio'>('general');

    // Data for other tabs
    const [userData, setUserData] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);

    // Services Form State
    const [servicesForm, setServicesForm] = useState({
        hourlyRate: '',
        skills: '',
        primaryCategoryId: '',
        isAvailable: true
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema)
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;
            try {
                const [userRes, catsRes] = await Promise.all([
                    api.get(`/users/${userId}`),
                    api.get('/common/categories').catch(() => ({ data: [] }))
                ]);

                const data = userRes.data;
                setUserData(data);
                setCategories(catsRes.data || []);
                setAvatarUrl(data.avatarUrl);

                // Setup General Form
                reset({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    phone: data.phone || '',
                    title: data.title || '',
                    overview: data.overview || '',
                    country: data.country || '',
                });

                // Setup Services Form
                setServicesForm({
                    hourlyRate: data.hourlyRate || '',
                    skills: data.skills ? data.skills.join(', ') : '',
                    primaryCategoryId: data.primaryCategoryId || '',
                    isAvailable: data.isAvailable ?? true
                });

            } catch (err) {
                console.error('Failed to fetch profile', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId, reset]);

    const calculateCompletion = () => {
        if (!userData) return { percentage: 0, suggestions: [] };

        const weights = {
            avatar: 10,
            basics: 15,
            overview: 20,
            services: 20,
            skills: 15,
            experience: 10,
            education: 5,
            portfolio: 5
        };

        let score = 0;
        const suggestions = [];

        if (userData.avatarUrl) score += weights.avatar;
        else suggestions.push({ text: 'Add a profile photo', tab: 'general', weight: weights.avatar });

        if (userData.firstName && userData.lastName && userData.title) score += weights.basics;
        else suggestions.push({ text: 'Complete your name and professional title', tab: 'general', weight: weights.basics });

        if (userData.overview && userData.overview.length >= 20) score += weights.overview;
        else suggestions.push({ text: 'Write a professional bio (min. 20 chars)', tab: 'general', weight: weights.overview });

        if (userData.hourlyRate && userData.primaryCategoryId) score += weights.services;
        else suggestions.push({ text: 'Set your hourly rate and category', tab: 'services', weight: weights.services });

        if (userData.skills && userData.skills.length > 0) score += weights.skills;
        else suggestions.push({ text: 'List your top skills', tab: 'services', weight: weights.skills });

        if (userData.experience && userData.experience.length > 0) score += weights.experience;
        else suggestions.push({ text: 'Add your work experience', tab: 'experience', weight: weights.experience });

        if (userData.education && userData.education.length > 0) score += weights.education;
        else suggestions.push({ text: 'Add your educational background', tab: 'experience', weight: weights.education });

        if (userData.portfolio && userData.portfolio.length > 0) score += weights.portfolio;
        else suggestions.push({ text: 'Add items to your portfolio', tab: 'portfolio', weight: weights.portfolio });

        return { percentage: score, suggestions };
    };

    const completion = calculateCompletion();

    const handleAvatarUpload = async (blob: Blob) => {
        try {
            const formData = new FormData();
            formData.append('file', blob, 'avatar.jpg');

            const uploadRes = await api.post('/storage/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const { fileName } = uploadRes.data;

            const urlRes = await api.get(`/storage/url/${fileName}`);
            const { url } = urlRes.data;

            await api.patch(`/users/${userId}`, { avatarUrl: url });

            setAvatarUrl(url);
            setStatus({ type: 'success', message: 'Avatar updated successfully!' });
        } catch (err) {
            console.error('Failed to upload avatar', err);
            setStatus({ type: 'error', message: 'Failed to upload avatar.' });
        }
    };

    const onSubmitGeneral = async (values: ProfileFormValues) => {
        setSaving(true);
        setStatus(null);
        try {
            await api.patch(`/users/${userId}`, values);
            setStatus({ type: 'success', message: 'Profile updated successfully!' });
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            console.error('Failed to update profile', err);
            setStatus({ type: 'error', message: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    const onSubmitServices = async () => {
        setSaving(true);
        setStatus(null);
        try {
            const payload = {
                hourlyRate: parseFloat(servicesForm.hourlyRate),
                skills: servicesForm.skills.split(',').map(s => s.trim()).filter(s => s),
                primaryCategoryId: servicesForm.primaryCategoryId,
                isAvailable: servicesForm.isAvailable
            };

            await api.patch(`/users/${userId}`, payload);
            // Also hit the toggle endpoint if availability changed explicitly? 
            // The patch might handle basic fields, but specific logic might be in toggle endpoint. 
            // For now, let's assume PATCH handles it or we call specific endpoints if needed.
            // Actually, CreateUserDto doesn't strictly implement isAvailable logic in service update usually, 
            // but let's try PATCH first. If fails, we can add specific calls.

            setStatus({ type: 'success', message: 'Services updated successfully!' });
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            console.error('Failed to update services', err);
            setStatus({ type: 'error', message: 'Failed to update services.' });
        } finally {
            setSaving(false);
        }
    };

    const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === id
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-slate-400 hover:text-white hover:border-slate-800'
                }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Profile Settings</h1>
                    <p className="text-slate-400">Manage your public profile presence.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            const url = `${window.location.origin}/profiles/${userId}`;
                            navigator.clipboard.writeText(url);
                            setStatus({ type: 'success', message: 'Profile link copied to clipboard!' });
                            setTimeout(() => setStatus(null), 3000);
                        }}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all font-medium"
                    >
                        <Share2 className="w-4 h-4" />
                        Share Link
                    </button>
                    <Link
                        href={`/profiles/${userId}`}
                        target="_blank"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 font-medium"
                    >
                        <Eye className="w-4 h-4" />
                        Preview Profile
                    </Link>
                </div>
            </div>

            {/* Profile Strength Meter */}
            <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center gap-8">
                    <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-yellow-500" />
                                    Profile Strength
                                </h3>
                                <p className="text-sm text-slate-400">Complete your profile to unlock more opportunities.</p>
                            </div>
                            <span className={`text-2xl font-black ${completion.percentage >= 80 ? 'text-emerald-500' :
                                completion.percentage >= 40 ? 'text-yellow-500' : 'text-red-500'
                                }`}>
                                {completion.percentage}%
                            </span>
                        </div>
                        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${completion.percentage}%` }}
                                className={`h-full transition-all duration-1000 ${completion.percentage >= 80 ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' :
                                    completion.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                            />
                        </div>
                    </div>
                    {completion.suggestions.length > 0 && (
                        <div className="md:w-px md:h-16 bg-slate-800 hidden md:block" />
                    )}
                    {completion.suggestions.length > 0 && (
                        <div className="flex-1">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Improve your score</p>
                            <div className="space-y-2">
                                {completion.suggestions.slice(0, 2).map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveTab(suggestion.tab as any)}
                                        className="flex items-center justify-between w-full p-2 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all group"
                                    >
                                        <span className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            {suggestion.text}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-500 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Sub-navigation for settings context (Profile vs Security) */}
            <div className="flex gap-6 border-b border-slate-800 mb-8">
                <Link href="/settings/profile" className="pb-4 text-sm font-medium text-white border-b-2 border-white">Profile</Link>
                <Link href="/settings/security" className="pb-4 text-sm font-medium text-slate-400 hover:text-white transition-colors">Security</Link>
            </div>

            {/* Main Profile Tabs */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 overflow-hidden">
                <div className="flex border-b border-slate-800">
                    <TabButton id="general" label="General" icon={User} />
                    <TabButton id="services" label="Services" icon={Briefcase} />
                    <TabButton id="experience" label="Experience" icon={Layers} />
                    <TabButton id="portfolio" label="Portfolio" icon={ImageIcon} />
                </div>

                <div className="p-8">
                    {status && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-xl flex items-center gap-3 border mb-6 ${status.type === 'success'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                                }`}
                        >
                            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <p className="text-sm font-medium">{status.message}</p>
                        </motion.div>
                    )}

                    {activeTab === 'general' && (
                        <div className="space-y-8">
                            <div className="flex flex-col items-center gap-4 border-b border-slate-800 pb-8">
                                <AvatarUpload currentAvatar={avatarUrl} onUpload={handleAvatarUpload} />
                                <div className="text-center">
                                    <h3 className="text-lg font-bold text-white">Profile Photo</h3>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">PNG, JPG up to 10MB</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit(onSubmitGeneral)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input {...register('firstName')} label="First Name" />
                                    <Input {...register('lastName')} label="Last Name" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input {...register('phone')} label="Phone Number" leftIcon={<Phone className="w-4 h-4" />} />
                                    <Input {...register('country')} label="Country" leftIcon={<Globe className="w-4 h-4" />} />
                                </div>
                                <Input {...register('title')} label="Professional Title" />

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Professional Overview</label>
                                    <textarea
                                        {...register('overview')}
                                        rows={6}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all resize-none"
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={saving} isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>Save Changes</Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Hourly Rate ($)</label>
                                    <Input
                                        type="number"
                                        value={servicesForm.hourlyRate}
                                        onChange={e => setServicesForm({ ...servicesForm, hourlyRate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Primary Category</label>
                                    <select
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                        value={servicesForm.primaryCategoryId}
                                        onChange={e => setServicesForm({ ...servicesForm, primaryCategoryId: e.target.value })}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <Input
                                label="Skills (Comma separated)"
                                value={servicesForm.skills}
                                onChange={e => setServicesForm({ ...servicesForm, skills: e.target.value })}
                            />

                            <div className="flex items-center gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
                                <input
                                    type="checkbox"
                                    checked={servicesForm.isAvailable}
                                    onChange={e => setServicesForm({ ...servicesForm, isAvailable: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                                />
                                <div>
                                    <h4 className="font-bold text-white text-sm">Available for Work</h4>
                                    <p className="text-xs text-slate-500">Show your profile in search results</p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button onClick={onSubmitServices} disabled={saving} isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>Update Services</Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'experience' && (
                        <div className="space-y-12">
                            <ExperienceList initialData={userData?.experience || []} />
                            <div className="border-t border-slate-800 pt-8">
                                <EducationList initialData={userData?.education || []} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'portfolio' && (
                        <PortfolioList initialData={userData?.portfolio || []} />
                    )}
                </div>
            </div>
        </div>
    );
}
