'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Smartphone,
    Lock,
    Trash2,
    AlertTriangle,
    CheckCircle,
    Eye,
    EyeOff,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useKeycloak } from '@/components/KeycloakProvider';
import TwoFactorModal from '@/components/TwoFactorModal';
import api from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export default function SecuritySettingsPage() {
    const { userId, authenticated } = useKeycloak();
    const { toast } = useToast();

    // 2FA State
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(true);

    // Password Form State
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [submittingPassword, setSubmittingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const fetchStatus = async () => {
        try {
            const res = await api.get(`/users/${userId}`);
            setIs2FAEnabled(res.data.twoFactorEnabled);
        } catch (error) {
            console.error('Failed to fetch user security status');
        } finally {
            setLoadingStatus(false);
        }
    };

    useEffect(() => {
        if (authenticated && userId) {
            fetchStatus();
        }
    }, [userId, authenticated]);

    const [passwordErrors, setPasswordErrors] = useState<{
        newPassword?: string;
        confirmPassword?: string;
        currentPassword?: string;
    }>({});

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordErrors({});

        let hasError = false;
        const newErrors: any = {};

        // Frontend Validations
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'New passwords do not match.';
            hasError = true;
        }

        if (passwordData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters long.';
            hasError = true;
        }

        if (passwordData.newPassword === passwordData.currentPassword) {
            newErrors.newPassword = 'New password must be different from current password.';
            hasError = true;
        }

        if (hasError) {
            setPasswordErrors(newErrors);
            toast({
                title: 'Validation Error',
                description: Object.values(newErrors)[0] as string,
                variant: 'destructive',
            });
            return;
        }

        setSubmittingPassword(true);
        try {
            await api.post(`/users/${userId}/change-password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            toast({
                title: 'Success!',
                description: 'Your password has been changed successfully.',
            });

            // Reset form
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setShowPasswordForm(false);
        } catch (error: any) {
            const status = error.response?.status;
            let description = 'Could not update password. Please try again.';

            if (status === 401) {
                description = 'The current password you entered is incorrect.';
                setPasswordErrors({ currentPassword: 'Incorrect password' });
            } else if (status === 400) {
                description = error.response?.data?.message || 'Invalid request.';
            }

            toast({
                title: 'Error',
                description,
                variant: 'destructive',
            });
        } finally {
            setSubmittingPassword(false);
        }
    };

    const handleDisable2FA = async () => {
        if (confirm('Are you sure you want to disable 2FA? Your account will be less secure.')) {
            try {
                await api.post(`/users/${userId}/toggle-2fa`);
                setIs2FAEnabled(false);
                toast({
                    title: '2FA Disabled',
                    description: 'Two-factor authentication has been turned off.',
                });
            } catch (error) {
                toast({ title: 'Error', description: 'Failed to disable 2FA', variant: 'destructive' });
            }
        }
    };

    return (
        <div className="space-y-8 p-6 max-w-4xl mx-auto min-h-screen pb-20">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-white mb-2">Security Settings</h1>
                <p className="text-slate-400">Protect your account with robust authentication methods.</p>
            </motion.div>

            {/* Password Management Card */}
            <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden">
                <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                        <div className="p-3 rounded-xl bg-blue-500/10 h-fit border border-blue-500/20">
                            <Lock className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">Account Password</h3>
                            <p className="text-sm text-slate-400 mb-6">
                                Update your password to keep your account secure. We recommend a mix of letters, numbers, and symbols.
                            </p>

                            {!showPasswordForm ? (
                                <Button
                                    variant="outline"
                                    className="border-slate-700 text-slate-200 hover:bg-slate-800"
                                    onClick={() => setShowPasswordForm(true)}
                                >
                                    Update Password
                                </Button>
                            ) : (
                                <motion.form
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    onSubmit={handlePasswordChange}
                                    className="space-y-4 max-w-md pt-4 border-t border-slate-800 mt-2"
                                >
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label className="text-slate-300">Current Password</Label>
                                            {passwordErrors.currentPassword && (
                                                <span className="text-xs text-red-400 font-medium">Wrong password</span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Input
                                                type={showCurrentPassword ? "text" : "password"}
                                                required
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className={`bg-slate-950 border-slate-800 text-white pr-10 ${passwordErrors.currentPassword ? 'border-red-500 ring-1 ring-red-500' : ''
                                                    }`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                            >
                                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label className="text-slate-300">New Password</Label>
                                            {passwordErrors.newPassword && (
                                                <span className="text-xs text-red-400 font-medium">{passwordErrors.newPassword.includes('long') ? 'Too short' : 'Invalid'}</span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Input
                                                type={showNewPassword ? "text" : "password"}
                                                required
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className={`bg-slate-950 border-slate-800 text-white pr-10 ${passwordErrors.newPassword ? 'border-red-500 ring-1 ring-red-500' : ''
                                                    }`}
                                                placeholder="Min. 8 characters"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                            >
                                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label className="text-slate-300">Confirm New Password</Label>
                                            {passwordErrors.confirmPassword && (
                                                <span className="text-xs text-red-400 font-medium">Not matching</span>
                                            )}
                                        </div>
                                        <Input
                                            type="password"
                                            required
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className={`bg-slate-950 border-slate-800 text-white ${passwordErrors.confirmPassword ? 'border-red-500 ring-1 ring-red-500' : ''
                                                }`}
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="submit"
                                            disabled={submittingPassword}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {submittingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Save Changes
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-slate-400 hover:text-white"
                                            onClick={() => setShowPasswordForm(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </motion.form>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* 2FA Section */}
            <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm relative overflow-hidden group">
                {is2FAEnabled && (
                    <div className="absolute top-0 right-0 p-3 bg-green-500/10 rounded-bl-xl border-b border-l border-green-500/20">
                        <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-wider">
                            <CheckCircle className="w-4 h-4" /> Enabled
                        </div>
                    </div>
                )}

                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className={`p-3 rounded-xl h-fit border transition-colors ${is2FAEnabled ? 'bg-green-500/10 border-green-500/20' : 'bg-slate-800 border-slate-700'
                            }`}>
                            <Smartphone className={`w-6 h-6 ${is2FAEnabled ? 'text-green-400' : 'text-slate-400'}`} />
                        </div>
                        <div className="max-w-xl">
                            <h3 className="text-lg font-semibold text-white mb-1">Two-Factor Authentication (2FA)</h3>
                            <p className="text-sm text-slate-400 mb-6">
                                Add an extra layer of security to your account by requiring a verification code from an authenticator app every time you log in.
                            </p>

                            {!loadingStatus ? (
                                <div className="flex gap-3">
                                    {!is2FAEnabled ? (
                                        <Button
                                            onClick={() => setShow2FAModal(true)}
                                            className="bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            Enable 2FA Protection
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            onClick={handleDisable2FA}
                                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Disable 2FA
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="h-10 w-32 bg-slate-800 animate-pulse rounded-md" />
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Account Recovery / Activity - Optional Future Additions */}
            <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm opacity-60">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-slate-800 h-fit border border-slate-700">
                        <Shield className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Account Activity</h3>
                        <p className="text-sm text-slate-400">
                            Monitor and manage your active sessions and login history. (Coming Soon)
                        </p>
                    </div>
                </div>
            </Card>

            <TwoFactorModal
                isOpen={show2FAModal}
                onClose={() => setShow2FAModal(false)}
                onSuccess={() => {
                    setIs2FAEnabled(true);
                    fetchStatus(); // Refresh to be safe
                }}
            />
        </div>
    );
}
