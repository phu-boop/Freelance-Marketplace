'use client';

import React, { useState } from 'react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import { Upload, ShieldCheck, Loader2, CheckCircle } from 'lucide-react';

export default function KycPage() {
    const { userId } = useKeycloak();
    const [uploading, setUploading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        try {
            // 1. Upload ID to Storage
            const formData = new FormData();
            formData.append('file', file);
            // Assuming API Gateway routes /storage to Storage Service
            // For now, we might need to use the direct URL or ensure Gateway is configured
            // Let's assume we have a proxy or direct access for MVP
            const uploadRes = await api.post('/storage/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const idDocument = uploadRes.data.fileName;

            // 2. Submit KYC to User Service
            await api.post(`/users/${userId}/kyc`, { idDocument });

            setSubmitted(true);
        } catch (error) {
            console.error('KYC submission failed:', error);
        } finally {
            setUploading(false);
        }
    };

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto text-center space-y-6 pt-20">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-white">Verification Submitted</h1>
                <p className="text-slate-400">
                    Thank you for submitting your documents. Our team will review them shortly.
                    You will be notified once your account is verified.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-8 h-8 text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold text-white">Identity Verification</h1>
                <p className="text-slate-400">
                    To ensure trust and safety on our platform, we require all freelancers to verify their identity.
                    Please upload a valid government-issued ID (Passport, Driver's License, or National ID).
                </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 border-dashed text-center space-y-6">
                <div className="space-y-2">
                    <Upload className="w-12 h-12 text-slate-500 mx-auto" />
                    <h3 className="text-lg font-medium text-white">Upload ID Document</h3>
                    <p className="text-sm text-slate-500">Supported formats: JPG, PNG, PDF (Max 5MB)</p>
                </div>

                <div className="flex justify-center">
                    <label className="cursor-pointer">
                        <span className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors inline-block">
                            {file ? file.name : 'Select File'}
                        </span>
                        <input
                            type="file"
                            className="hidden"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </label>
                </div>

                {file && (
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                    >
                        {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Submit for Verification'}
                    </button>
                )}
            </div>
        </div>
    );
}
