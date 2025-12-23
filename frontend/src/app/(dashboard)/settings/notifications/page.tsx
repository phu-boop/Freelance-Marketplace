'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Mail, Smartphone, Globe, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';

interface NotificationState {
    emailNotifications: boolean;
    pushNotifications: boolean;
    inAppNotifications: boolean;
}

export default function NotificationSettingsPage() {
    const { userId } = useKeycloak();
    const [preferences, setPreferences] = useState<NotificationState>({
        emailNotifications: true,
        pushNotifications: true,
        inAppNotifications: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        if (!userId) return;
        const fetchPreferences = async () => {
            try {
                const res = await api.get(`/users/${userId}`);
                setPreferences({
                    emailNotifications: res.data.emailNotifications,
                    pushNotifications: res.data.pushNotifications,
                    inAppNotifications: res.data.inAppNotifications
                });
            } catch (err) {
                console.error(err);
                setStatus({ type: 'error', message: 'Failed to load settings' });
            } finally {
                setLoading(false);
            }
        };
        fetchPreferences();
    }, [userId]);

    const handleToggle = async (key: keyof NotificationState) => {
        const newValue = !preferences[key];
        setPreferences(prev => ({ ...prev, [key]: newValue }));
        setSaving(true);
        setStatus(null);

        try {
            await api.patch(`/users/${userId}`, { [key]: newValue });
            // Optional: set success status briefly
        } catch (err) {
            console.error(err);
            // Revert on failure
            setPreferences(prev => ({ ...prev, [key]: !newValue }));
            setStatus({ type: 'error', message: 'Failed to update setting' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="h-96 animate-pulse bg-slate-900/50 rounded-xl max-w-4xl mx-auto" />;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Notification Preferences</h1>
                <p className="text-slate-400">Choose how and when you want to be notified.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800">
                <Link
                    href="/settings/profile"
                    className="px-6 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                    Profile
                </Link>
                <Link
                    href="/settings/security"
                    className="px-6 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                    Security
                </Link>
                <Link
                    href="/settings/verification"
                    className="px-6 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                    Verification
                </Link>
                <Link
                    href="/settings/notifications"
                    className="px-6 py-3 text-sm font-medium text-blue-500 border-b-2 border-blue-500"
                >
                    Notifications
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

            <Card className="p-0 border-slate-800/50 bg-slate-900/50 backdrop-blur-xl overflow-hidden">
                <div className="p-8 border-b border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                            <Bell className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">General Notifications</h3>
                            <p className="text-sm text-slate-400">Manage your alerts across different channels.</p>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-slate-800">
                    <NotificationToggle
                        icon={<Mail className="w-5 h-5 text-slate-400" />}
                        title="Email Notifications"
                        description="Receive digests, job alerts, and important updates via email."
                        enabled={preferences.emailNotifications}
                        onToggle={() => handleToggle('emailNotifications')}
                    />
                    <NotificationToggle
                        icon={<Smartphone className="w-5 h-5 text-slate-400" />}
                        title="Push Notifications"
                        description="Get real-time alerts on your mobile device for messages and new proposals."
                        enabled={preferences.pushNotifications}
                        onToggle={() => handleToggle('pushNotifications')}
                    />
                    <NotificationToggle
                        icon={<Globe className="w-5 h-5 text-slate-400" />}
                        title="In-App Notifications"
                        description="Show badge alerts and popups within the web application."
                        enabled={preferences.inAppNotifications}
                        onToggle={() => handleToggle('inAppNotifications')}
                    />
                </div>
            </Card>

            <div className="flex justify-end items-center gap-2 text-xs text-slate-500">
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                {saving ? 'Saving changes...' : 'Changes are saved automatically'}
            </div>
        </div>
    );
}

function NotificationToggle({
    icon,
    title,
    description,
    enabled,
    onToggle
}: {
    icon: React.ReactNode,
    title: string,
    description: string,
    enabled: boolean,
    onToggle: () => void
}) {
    return (
        <div className="p-6 flex items-start gap-4 hover:bg-slate-800/30 transition-colors">
            <div className="mt-1">{icon}</div>
            <div className="flex-1">
                <h4 className="font-medium text-white mb-1">{title}</h4>
                <p className="text-sm text-slate-400">{description}</p>
            </div>
            <button
                onClick={onToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${enabled ? 'bg-blue-600' : 'bg-slate-700'
                    }`}
            >
                <span
                    className={`${enabled ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
                />
            </button>
        </div>
    );
}
