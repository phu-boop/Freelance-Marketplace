'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DownloadCloud, ShieldAlert, Loader2, FileJson, Lock } from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function PrivacySettingsPage() {
    const { userId } = useKeycloak();
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        if (!userId) return;
        setDownloading(true);
        try {
            const res = await api.get(`/users/${userId}/export`);
            const dataStr = JSON.stringify(res.data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `user-data-${userId}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to download data', err);
            alert('Failed to download data. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Data & Privacy</h1>
                <p className="text-slate-400">Manage your personal data and privacy settings.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 overflow-x-auto">
                <Link
                    href="/settings/profile"
                    className="px-6 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors whitespace-nowrap"
                >
                    Profile
                </Link>
                <Link
                    href="/settings/security"
                    className="px-6 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors whitespace-nowrap"
                >
                    Security
                </Link>
                <Link
                    href="/settings/verification"
                    className="px-6 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors whitespace-nowrap"
                >
                    Verification
                </Link>
                <Link
                    href="/settings/notifications"
                    className="px-6 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors whitespace-nowrap"
                >
                    Notifications
                </Link>
                <Link
                    href="/settings/privacy"
                    className="px-6 py-3 text-sm font-medium text-blue-500 border-b-2 border-blue-500 whitespace-nowrap"
                >
                    Data & Privacy
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Data Download Section */}
                <Card className="p-8 border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
                    <div className="flex items-start gap-6">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center shrink-0">
                            <DownloadCloud className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Download Your Data</h3>
                                <p className="text-sm text-slate-400 max-w-2xl">
                                    In compliance with GDPR and data privacy regulations, you can download a copy of all the personal data we hold about you. This includes your profile, employment history, and portfolio items.
                                </p>
                            </div>

                            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                    <FileJson className="w-4 h-4 text-amber-400" />
                                    <span>Format: <strong>JSON</strong></span>
                                    <span className="w-1 h-1 bg-slate-600 rounded-full" />
                                    <span>Includes: Profile, Education, Experience, Portfolio</span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    onClick={handleDownload}
                                    disabled={downloading}
                                    className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                                >
                                    {downloading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Preparing Download...
                                        </>
                                    ) : (
                                        <>
                                            <DownloadCloud className="w-4 h-4 mr-2" />
                                            Request Data Export
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Account Deletion Section (Placeholder) */}
                <Card className="p-8 border-red-900/20 bg-red-950/5 backdrop-blur-xl">
                    <div className="flex items-start gap-6">
                        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center shrink-0">
                            <ShieldAlert className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Delete Account</h3>
                                <p className="text-sm text-slate-400">
                                    Permanently delete your account and all associated data. This action cannot be undone.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50"
                            >
                                Delete Account
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
