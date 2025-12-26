'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { DocumentUpload } from '@/components/DocumentUpload';

export default function VerificationSettingsPage() {
    const { userId } = useKeycloak();
    const [status, setStatus] = useState<'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_SUBMITTED'>('NOT_SUBMITTED');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        const fetchStatus = async () => {
            try {
                const res = await api.get(`/users/${userId}`);
                if (res.data.isIdentityVerified) {
                    setStatus('VERIFIED');
                } else if (res.data.kycStatus === 'PENDING') {
                    setStatus('PENDING');
                } else if (res.data.kycStatus === 'REJECTED') {
                    setStatus('REJECTED');
                } else {
                    setStatus('NOT_SUBMITTED');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, [userId]);

    const handleUploadComplete = async (url: string) => {
        try {
            await api.post(`/users/${userId}/kyc`, { idDocument: url });
            setStatus('PENDING');
        } catch (err) {
            console.error('Failed to submit KYC', err);
        }
    };

    if (loading) return <div className="h-96 animate-pulse bg-slate-900/50 rounded-xl max-w-4xl mx-auto" />;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Identity Verification</h1>
                <p className="text-slate-400">Verify your identity to unlock all platform features.</p>
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
                    className="px-6 py-3 text-sm font-medium text-blue-500 border-b-2 border-blue-500"
                >
                    Verification
                </Link>
            </div>

            <Card className="p-8 border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
                <div className="flex items-start gap-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 
                        ${status === 'VERIFIED' ? 'bg-emerald-500/10' :
                            status === 'PENDING' ? 'bg-amber-500/10' :
                                status === 'REJECTED' ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                        {status === 'VERIFIED' ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> :
                            status === 'PENDING' ? <Clock className="w-6 h-6 text-amber-500" /> :
                                status === 'REJECTED' ? <AlertCircle className="w-6 h-6 text-red-500" /> :
                                    <Shield className="w-6 h-6 text-blue-500" />}
                    </div>

                    <div className="flex-1 space-y-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-white">Identity Status</h3>
                                <span className={`px-2 py-0.5 rounded-full border text-xs font-medium uppercase
                                    ${status === 'VERIFIED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                        status === 'PENDING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                            status === 'REJECTED' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                'bg-slate-800 border-slate-700 text-slate-400'}`}>
                                    {status.replace('_', ' ')}
                                </span>
                            </div>

                            {status === 'VERIFIED' && (
                                <p className="text-slate-400">
                                    Your identity has been verified. You have full access to all platform features.
                                </p>
                            )}
                            {status === 'PENDING' && (
                                <p className="text-slate-400">
                                    We have received your documents and are currently reviewing them. This usually takes 24-48 hours.
                                </p>
                            )}
                            {status === 'REJECTED' && (
                                <p className="text-red-400">
                                    Your verification was rejected. Please ensure the document is clear and valid, then try again.
                                </p>
                            )}
                            {status === 'NOT_SUBMITTED' && (
                                <p className="text-slate-400">
                                    Please upload a valid government-issued ID (Passport, Driver's License, or National ID) to verify your identity.
                                </p>
                            )}
                        </div>

                        {(status === 'NOT_SUBMITTED' || status === 'REJECTED') && (
                            <div className="max-w-md p-6 bg-slate-950/50 rounded-xl border border-slate-800">
                                <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-400" /> Upload Document
                                </h4>
                                <DocumentUpload
                                    onUploadComplete={handleUploadComplete}
                                    label="Select ID Document"
                                    maxSizeMB={10}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
