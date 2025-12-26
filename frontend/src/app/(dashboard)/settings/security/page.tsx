'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    KeyRound,
    Lock,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Smartphone,
    ShieldCheck
} from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SecuritySettingsPage() {
    const { userId } = useKeycloak();
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema)
    });

    const onSubmit = async (values: PasswordFormValues) => {
        setSaving(true);
        setStatus(null);
        try {
            await api.post(`/users/${userId}/change-password`, {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            });
            setStatus({ type: 'success', message: 'Password changed successfully!' });
            reset();
            setTimeout(() => setStatus(null), 3000);
        } catch (err: any) {
            console.error('Failed to change password', err);
            const msg = err.response?.data?.message || 'Failed to change password. Please check your current password.';
            setStatus({ type: 'error', message: msg });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Security Settings</h1>
                <p className="text-slate-400">Manage your password and security preferences.</p>
            </div>

            {/* Settings Navigation Tabs */}
            <div className="flex border-b border-slate-800">
                <Link
                    href="/settings/profile"
                    className="px-6 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                    Profile
                </Link>
                <Link
                    href="/settings/security"
                    className="px-6 py-3 text-sm font-medium text-blue-500 border-b-2 border-blue-500"
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

            <div className="grid grid-cols-1 gap-8">
                {/* 2FA Section */}
                <TwoFactorSection userId={userId} onStatusChange={setStatus} />

                {/* Change Password Section */}
                <Card className="p-8 border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                            <KeyRound className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Change Password</h3>
                            <p className="text-sm text-slate-400">Ensure your account is using a long, random password to stay secure.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-slate-500" /> Current Password
                            </label>
                            <Input
                                type="password"
                                {...register('currentPassword')}
                                placeholder="Enter current password"
                                className={errors.currentPassword ? 'border-red-500/50 focus:ring-red-500/50' : ''}
                            />
                            {errors.currentPassword && (
                                <p className="text-xs text-red-400 mt-1">{errors.currentPassword.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-slate-500" /> New Password
                            </label>
                            <Input
                                type="password"
                                {...register('newPassword')}
                                placeholder="Enter new password"
                                className={errors.newPassword ? 'border-red-500/50 focus:ring-red-500/50' : ''}
                            />
                            {errors.newPassword && (
                                <p className="text-xs text-red-400 mt-1">{errors.newPassword.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-slate-500" /> Confirm New Password
                            </label>
                            <Input
                                type="password"
                                {...register('confirmPassword')}
                                placeholder="Confirm new password"
                                className={errors.confirmPassword ? 'border-red-500/50 focus:ring-red-500/50' : ''}
                            />
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <div className="pt-4">
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
                                {saving ? 'Updating...' : 'Update Password'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}

function TwoFactorSection({ userId, onStatusChange }: { userId: string | undefined | null, onStatusChange: (status: any) => void }) {
    const [isEnabled, setIsEnabled] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [qrCode, setQrCode] = React.useState<string | null>(null);
    const [verificationCode, setVerificationCode] = React.useState('');
    const [verifying, setVerifying] = React.useState(false);

    React.useEffect(() => {
        if (!userId) return;
        const checkStatus = async () => {
            try {
                const res = await api.get(`/users/${userId}`);
                setIsEnabled(res.data.twoFactorEnabled);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        checkStatus();
    }, [userId]);

    const handleSetup = async () => {
        try {
            const res = await api.post(`/users/${userId}/2fa/setup`);
            setQrCode(res.data.qrCodeUrl);
        } catch (err) {
            onStatusChange({ type: 'error', message: 'Failed to start 2FA setup' });
        }
    };

    const handleVerify = async () => {
        setVerifying(true);
        try {
            await api.post(`/users/${userId}/2fa/verify`, { token: verificationCode });
            setIsEnabled(true);
            setQrCode(null);
            onStatusChange({ type: 'success', message: 'Two-Factor Authentication enabled!' });
        } catch (err) {
            onStatusChange({ type: 'error', message: 'Invalid verification code' });
        } finally {
            setVerifying(false);
        }
    };

    if (loading) return <div className="h-40 animate-pulse bg-slate-900/50 rounded-xl" />;

    return (
        <Card className="p-8 border-slate-800/50 bg-slate-900/50 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex items-start gap-6 relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isEnabled ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
                    {isEnabled ? (
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    ) : (
                        <Smartphone className="w-6 h-6 text-slate-400" />
                    )}
                </div>

                <div className="flex-1 space-y-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-white">Two-Factor Authentication</h3>
                            {isEnabled && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                                    Enabled
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-400 max-w-xl">
                            Add an extra layer of security to your account by requiring a verification code from your authenticator app.
                        </p>
                    </div>

                    {!isEnabled && !qrCode && (
                        <Button
                            onClick={handleSetup}
                            className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                        >
                            Setup 2FA
                        </Button>
                    )}

                    {qrCode && (
                        <div className="mt-4 p-6 bg-slate-950 rounded-xl border border-slate-800 inline-block animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="bg-white p-2 rounded-lg">
                                    <img src={qrCode} alt="2FA QR Code" className="w-40 h-40" />
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-white">Scan this QR Code</h4>
                                    <p className="text-sm text-slate-400 max-w-xs">
                                        Open Google Authenticator or your preferred app and scan the code. Then enter the 6-digit code below.
                                    </p>
                                    <div className="flex gap-2">
                                        <Input
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            placeholder="000 000"
                                            className="w-32 text-center tracking-widest font-mono text-lg"
                                            maxLength={6}
                                        />
                                        <Button
                                            onClick={handleVerify}
                                            disabled={verifying || verificationCode.length !== 6}
                                            className="bg-blue-600 hover:bg-blue-500 text-white"
                                        >
                                            {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                                        </Button>
                                    </div>
                                    <button
                                        onClick={() => setQrCode(null)}
                                        className="text-xs text-slate-500 hover:text-slate-400 underline"
                                    >
                                        Cancel setup
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
