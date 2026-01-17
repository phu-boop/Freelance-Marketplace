'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Mail, Smartphone, Globe, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
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
    const [integrations, setIntegrations] = useState<any[]>([]);
    const [newIntegration, setNewIntegration] = useState({ provider: 'slack' as const, webhookUrl: '' });
    const [isPushSupported, setIsPushSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        if (!userId) return;
        fetchData();
        checkPushStatus();
    }, [userId]);

    const fetchData = async () => {
        try {
            const [prefRes, intRes] = await Promise.all([
                api.get(`/users/${userId}`),
                api.get('/notifications/integrations')
            ]);

            setPreferences({
                emailNotifications: prefRes.data.emailNotifications,
                pushNotifications: prefRes.data.pushNotifications,
                inAppNotifications: prefRes.data.inAppNotifications
            });
            setIntegrations(intRes.data);
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', message: 'Failed to load settings' });
        } finally {
            setLoading(false);
        }
    };

    const checkPushStatus = async () => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
            setIsPushSupported(false);
            return;
        }
        setIsPushSupported(true);

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
    };

    const handleToggle = async (key: keyof NotificationState) => {
        const newValue = !preferences[key];
        setPreferences(prev => ({ ...prev, [key]: newValue }));
        setSaving(true);
        setStatus(null);

        try {
            await api.patch(`/users/${userId}`, { [key]: newValue });
        } catch (err) {
            console.error(err);
            setPreferences(prev => ({ ...prev, [key]: !newValue }));
            setStatus({ type: 'error', message: 'Failed to update setting' });
        } finally {
            setSaving(false);
        }
    };

    const handleSubscribePush = async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: 'BOdcfnA0k9gD38QQtgU2UX-CMkqLOKoHu30xNdeF_DockAaOveiGy2E-7xs-DW9WyBalDc9Rr-1SZdtrWVrimys' // Public VAPID Key
            });

            await api.post('/notifications/push/subscribe', {
                deviceFingerprint: navigator.userAgent,
                subscription
            });

            setIsSubscribed(true);
            setStatus({ type: 'success', message: 'Successfully subscribed to push notifications' });
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', message: 'Failed to subscribe to push notifications. Check browser permissions.' });
        }
    };

    const handleUnsubscribePush = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
            }

            await api.post('/notifications/push/unsubscribe', {
                deviceFingerprint: navigator.userAgent
            });

            setIsSubscribed(false);
            setStatus({ type: 'success', message: 'Unsubscribed from push notifications' });
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', message: 'Failed to unsubscribe' });
        }
    };

    const handleAddIntegration = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.post('/notifications/integrations', newIntegration);
            setIntegrations(prev => [...prev, res.data]);
            setNewIntegration({ provider: 'slack', webhookUrl: '' });
            setStatus({ type: 'success', message: 'Integration added successfully' });
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', message: 'Failed to add integration' });
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveIntegration = async (id: string) => {
        try {
            await api.delete(`/notifications/integrations/${id}`);
            setIntegrations(prev => prev.filter(i => i._id !== id));
            setStatus({ type: 'success', message: 'Integration removed' });
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', message: 'Failed to remove integration' });
        }
    };

    if (loading) return <div className="h-96 animate-pulse bg-slate-900/50 rounded-xl max-w-4xl mx-auto" />;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
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

            <div className="grid grid-cols-1 gap-8">
                {/* General Channels */}
                <Card className="p-0 border-slate-800/50 bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-2xl">
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
                        <div className="p-6 flex items-start gap-4 hover:bg-slate-800/30 transition-colors">
                            <div className="mt-1"><Smartphone className="w-5 h-5 text-slate-400" /></div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-white">Browser Push Notifications</h4>
                                    {isSubscribed && (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                                            Active
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-400 mb-3">Get real-time alerts on your desktop or mobile browser.</p>
                                {isPushSupported ? (
                                    <button
                                        onClick={isSubscribed ? handleUnsubscribePush : handleSubscribePush}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isSubscribed
                                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                                            }`}
                                    >
                                        {isSubscribed ? 'Disable Push' : 'Enable Push Notifications'}
                                    </button>
                                ) : (
                                    <p className="text-xs text-amber-500/80 italic font-medium">Your browser does not support push notifications.</p>
                                )}
                            </div>
                            <button
                                onClick={() => handleToggle('pushNotifications')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.pushNotifications ? 'bg-blue-600' : 'bg-slate-700'}`}
                            >
                                <span className={`${preferences.pushNotifications ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`} />
                            </button>
                        </div>
                        <NotificationToggle
                            icon={<Globe className="w-5 h-5 text-slate-400" />}
                            title="In-App Notifications"
                            description="Show badge alerts and popups within the web application."
                            enabled={preferences.inAppNotifications}
                            onToggle={() => handleToggle('inAppNotifications')}
                        />
                    </div>
                </Card>

                {/* Third Party Integrations */}
                <Card className="p-0 border-slate-800/50 bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center">
                                <Globe className="w-6 h-6 text-indigo-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Integrations</h3>
                                <p className="text-sm text-slate-400">Send notifications directly to Slack or Discord.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {integrations.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Connected Channels</h4>
                                <div className="grid gap-3">
                                    {integrations.map((int) => (
                                        <div key={int._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-white uppercase overflow-hidden">
                                                    {int.provider === 'slack' ? (
                                                        <span className="text-emerald-500">S</span>
                                                    ) : (
                                                        <span className="text-indigo-400">D</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white capitalize">{int.provider} Channel</p>
                                                    <p className="text-xs text-slate-500 font-mono truncate max-w-xs">{int.webhookUrl}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveIntegration(int._id)}
                                                className="p-2 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all hover:bg-red-500/5 rounded-lg"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleAddIntegration} className="space-y-4 pt-4 border-t border-slate-800">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Add New Integration</h4>
                            <div className="flex flex-col md:flex-row gap-3">
                                <select
                                    value={newIntegration.provider}
                                    onChange={(e) => setNewIntegration(prev => ({ ...prev, provider: e.target.value as any }))}
                                    className="bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="slack">Slack</option>
                                    <option value="discord">Discord</option>
                                </select>
                                <input
                                    type="url"
                                    placeholder="Webhook URL"
                                    value={newIntegration.webhookUrl}
                                    onChange={(e) => setNewIntegration(prev => ({ ...prev, webhookUrl: e.target.value }))}
                                    required
                                    className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600"
                                />
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Adding...' : 'Connect'}
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-500">
                                Paste the webhook URL from your Slack or Discord channel settings.
                            </p>
                        </form>
                    </div>
                </Card>
            </div>

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
