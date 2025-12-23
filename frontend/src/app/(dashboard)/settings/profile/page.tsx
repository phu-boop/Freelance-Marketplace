'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
    Camera
} from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AvatarUpload } from '@/components/AvatarUpload';
import Link from 'next/link';

const profileSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    phone: z.string().optional(),
    title: z.string().min(5, 'Title should be at least 5 characters').optional(),
    overview: z.string().min(20, 'Bio should be at least 20 characters').optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileSettingsPage() {
    const { userId } = useKeycloak();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema)
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) return;
            try {
                const res = await api.get(`/users/${userId}`);
                const data = res.data;
                setAvatarUrl(data.avatarUrl);
                reset({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    phone: data.phone || '',
                    title: data.title || '',
                    overview: data.overview || '',
                });
            } catch (err) {
                console.error('Failed to fetch profile', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId, reset]);

    const handleAvatarUpload = async (blob: Blob) => {
        try {
            const formData = new FormData();
            formData.append('file', blob, 'avatar.jpg');

            // 1. Upload to storage
            const uploadRes = await api.post('/storage/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const { fileName } = uploadRes.data;

            // 2. Get public URL
            const urlRes = await api.get(`/storage/url/${fileName}`);
            const { url } = urlRes.data;

            // 3. Update user profile
            await api.patch(`/users/${userId}`, { avatarUrl: url });

            setAvatarUrl(url);
            setStatus({ type: 'success', message: 'Avatar updated successfully!' });
        } catch (err) {
            console.error('Failed to upload avatar', err);
            setStatus({ type: 'error', message: 'Failed to upload avatar.' });
        }
    };

    const onSubmit = async (values: ProfileFormValues) => {
        setSaving(true);
        setStatus(null);
        try {
            await api.patch(`/users/${userId}`, values);
            setStatus({ type: 'success', message: 'Profile updated successfully!' });
            // Hide success message after 3 seconds
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            console.error('Failed to update profile', err);
            setStatus({ type: 'error', message: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Profile Settings</h1>
                <p className="text-slate-400">Update your avatar and personal information.</p>
            </div>

            {/* Settings Navigation Tabs */}
            <div className="flex border-b border-slate-800">
                <Link
                    href="/settings/profile"
                    className="px-6 py-3 text-sm font-medium text-blue-500 border-b-2 border-blue-500"
                >
                    Profile
                </Link>
                <Link
                    href="/settings/security"
                    className="px-6 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                    Security
                </Link>
            </div>

            {status && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl flex items-center gap-3 border ${status.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}
                >
                    {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="text-sm font-medium">{status.message}</p>
                </motion.div>
            )}

            <Card className="p-8 border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
                <div className="mb-10 flex flex-col items-center gap-4">
                    <AvatarUpload currentAvatar={avatarUrl} onUpload={handleAvatarUpload} />
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-white">Profile Photo</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">PNG, JPG up to 10MB</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-500" /> First Name
                            </label>
                            <Input
                                {...register('firstName')}
                                placeholder="Enter your first name"
                                className={errors.firstName ? 'border-red-500/50 focus:ring-red-500/50' : ''}
                            />
                            {errors.firstName && (
                                <p className="text-xs text-red-400 mt-1">{errors.firstName.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-500" /> Last Name
                            </label>
                            <Input
                                {...register('lastName')}
                                placeholder="Enter your last name"
                                className={errors.lastName ? 'border-red-500/50 focus:ring-red-500/50' : ''}
                            />
                            {errors.lastName && (
                                <p className="text-xs text-red-400 mt-1">{errors.lastName.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-500" /> Phone Number
                            </label>
                            <Input
                                {...register('phone')}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <BadgeCheck className="w-4 h-4 text-slate-500" /> Professional Title
                            </label>
                            <Input
                                {...register('title')}
                                placeholder="e.g. Senior Full Stack Developer"
                            />
                            {errors.title && (
                                <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-500" /> Professional Overview (Bio)
                        </label>
                        <textarea
                            {...register('overview')}
                            rows={6}
                            placeholder="Write a brief introduction about your professional background and expertise..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all resize-none"
                        />
                        {errors.overview && (
                            <p className="text-xs text-red-400 mt-1">{errors.overview.message}</p>
                        )}
                        <p className="text-[10px] text-slate-500 italic">Minimum 20 characters. This will be the first thing clients see on your profile.</p>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/20 flex items-center gap-2 group"
                        >
                            {saving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            )}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
