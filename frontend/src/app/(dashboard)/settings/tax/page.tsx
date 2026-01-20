'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Info, CreditCard, ChevronRight, CheckCircle2, AlertCircle, Lock, Shield } from 'lucide-react';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import SettingsTabs from '@/components/settings/SettingsTabs';

type TaxStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
type FormType = 'W-9' | 'W-8BEN' | 'W-8BEN-E' | 'NONE';

export default function TaxCompliancePage() {
    const { userId } = useKeycloak();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<TaxStatus>('UNVERIFIED');
    const [formType, setFormType] = useState<FormType>('NONE');
    const [taxId, setTaxId] = useState('');
    const [taxIdType, setTaxIdType] = useState('SSN');
    const [billingAddress, setBillingAddress] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!userId) return;
        const fetchTaxInfo = async () => {
            try {
                const res = await api.get(`/users/${userId}`);
                setStatus(res.data.taxVerifiedStatus || 'UNVERIFIED');
                setFormType(res.data.taxFormType || 'NONE');
                setTaxId(res.data.taxId || '');
                setTaxIdType(res.data.taxIdType || 'SSN');
                setBillingAddress(res.data.billingAddress || '');
            } catch (err) {
                console.error('Failed to fetch tax info', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTaxInfo();
    }, [userId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.patch(`/users/${userId}/tax`, {
                taxId,
                taxIdType,
                billingAddress,
                taxFormType: formType
            });
            setStatus('PENDING');
            alert('Tax information submitted successfully for verification.');
        } catch (err) {
            console.error('Failed to submit tax info', err);
            alert('Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="h-96 animate-pulse bg-slate-900/50 rounded-xl" />;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Tax & Compliance</h1>
                <p className="text-slate-400">Securely manage your tax identifiers and legal documentation.</p>
            </div>

            <SettingsTabs />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* Status Overview */}
                    <Card className={`p-6 border-slate-800 bg-slate-900/30 flex items-center justify-between ${status === 'VERIFIED' ? 'border-emerald-500/20 bg-emerald-500/5' :
                        status === 'PENDING' ? 'border-amber-500/20 bg-amber-500/5' :
                            'border-slate-800'
                        }`}>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-500' :
                                status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                                    'bg-slate-800 text-slate-400'
                                }`}>
                                {status === 'VERIFIED' ? <CheckCircle2 className="w-6 h-6" /> :
                                    status === 'PENDING' ? <ShieldCheck className="w-6 h-6" /> :
                                        <AlertCircle className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">Verification Status</h3>
                                <p className="text-sm text-slate-400 uppercase tracking-widest font-bold">{status}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 font-medium">Last updated: Today</p>
                        </div>
                    </Card>

                    {/* Tax Form Selection */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white">1. Select Tax Form</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => setFormType('W-9')}
                                className={`p-6 rounded-2xl border text-left transition-all ${formType === 'W-9' ? 'bg-blue-600/10 border-blue-500' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-slate-950 rounded-lg"><Info className="w-4 h-4 text-blue-400" /></div>
                                    {formType === 'W-9' && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                                </div>
                                <h4 className="text-white font-bold mb-1">Form W-9</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">For US Citizens, Residents, or legal entities.</p>
                            </button>

                            <button
                                onClick={() => setFormType('W-8BEN')}
                                className={`p-6 rounded-2xl border text-left transition-all ${formType === 'W-8BEN' ? 'bg-blue-600/10 border-blue-500' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-slate-950 rounded-lg"><Info className="w-4 h-4 text-blue-400" /></div>
                                    {formType === 'W-8BEN' && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                                </div>
                                <h4 className="text-white font-bold mb-1">Form W-8BEN</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">For non-US individuals who perform work outside the US.</p>
                            </button>
                        </div>
                    </div>

                    {/* Tax Details Form */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white">2. Identity & Billing</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">ID Type</label>
                                        <select
                                            value={taxIdType}
                                            onChange={(e) => setTaxIdType(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                                        >
                                            <option value="SSN">SSN</option>
                                            <option value="EIN">EIN</option>
                                            <option value="VAT">VAT ID</option>
                                            <option value="TIN">TIN</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Tax ID / SSN</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={taxId}
                                                onChange={(e) => setTaxId(e.target.value)}
                                                placeholder="Enter full identifier"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                                                required
                                            />
                                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 font-bold" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Legal Billing Address</label>
                                    <textarea
                                        value={billingAddress}
                                        onChange={(e) => setBillingAddress(e.target.value)}
                                        placeholder="Enter your full legal address for invoicing"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium h-24 resize-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-blue-600/5 border border-blue-500/20 rounded-xl flex gap-3">
                                <Shield className="w-5 h-5 text-blue-400 shrink-0" />
                                <p className="text-[10px] text-slate-400 leading-relaxed font-medium uppercase tracking-tight">
                                    Your data is encrypted using AES-256-GCM. We only store a masked version for reference in the UI.
                                    By submitting, you certify that the information provided is true and correct.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || formType === 'NONE'}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                            >
                                {submitting ? 'Submitting...' : 'Certify & Save Information'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sidebar Guide */}
                <div className="space-y-6">
                    <Card className="p-6 border-slate-800 bg-slate-900 shadow-xl">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-400" /> Need Help?
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-slate-950 rounded-xl">
                                <h4 className="text-xs font-bold text-white mb-1">Which form is right?</h4>
                                <p className="text-[10px] text-slate-500 leading-relaxed">
                                    Generally, US persons use W-9, while non-US individuals use W-8BEN. Consult a tax professional for specific advice.
                                </p>
                            </div>
                            <div className="p-3 bg-slate-950 rounded-xl">
                                <h4 className="text-xs font-bold text-white mb-1">Why is this required?</h4>
                                <p className="text-[10px] text-slate-500 leading-relaxed">
                                    To comply with global tax regulations and ensure accurate reporting for payments made through the platform.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <div className="p-6 bg-emerald-600/5 border border-emerald-500/20 rounded-3xl">
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest mb-2">
                            <CheckCircle2 className="w-3 h-3" /> Compliance Check
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">
                            Once verified, you will receive a digital certificate for your records and platform fees may be adjusted based on your jurisdiction.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
