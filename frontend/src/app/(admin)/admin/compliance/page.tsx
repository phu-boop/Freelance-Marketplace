'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter, CheckCircle2, XCircle, Clock, Eye, ExternalLink, ShieldAlert, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface PendingVerification {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    taxVerifiedStatus: string;
    taxIdType: string;
    taxId: string; // Masked version
    taxFormType: string;
    kycStatus: string;
    updatedAt: string;
}

export default function AdminCompliancePage() {
    const [verifications, setVerifications] = useState<PendingVerification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'REJECTED'>('PENDING');

    const fetchVerifications = async () => {
        setLoading(true);
        try {
            // In a real app, we'd have a specific admin endpoint with fitlers
            const res = await api.get('/api/users'); // Simplified: get all users and filter
            const pending = res.data.filter((u: any) =>
                u.taxVerifiedStatus === 'PENDING' || u.kycStatus === 'PENDING'
            );
            setVerifications(pending);
        } catch (err) {
            console.error('Failed to fetch compliance queue', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVerifications();
    }, [filter]);

    const handleAction = async (userId: string, status: 'VERIFIED' | 'REJECTED') => {
        try {
            await api.post(`/api/users/${userId}/kyc/verify`, { status });
            setVerifications(verifications.filter(v => v.id !== userId));
            alert(`User ${status.toLowerCase()} successfully.`);
        } catch (err) {
            console.error('Action failed', err);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                        <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/20">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        Compliance Queue
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">
                        Review Tax IDs, Identity Documents, and Governance exceptions
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="bg-slate-900 border border-slate-800 rounded-xl px-10 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 w-80"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    </div>
                    <button
                        onClick={fetchVerifications}
                        className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
                    >
                        <Clock className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats Cards */}
                <Card className="p-6 bg-slate-900/50 border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Pending</p>
                    <p className="text-3xl font-black text-white">{verifications.length}</p>
                </Card>
                <Card className="p-6 bg-slate-900/50 border-slate-800">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Tax Reviews</p>
                    <p className="text-3xl font-black text-white">
                        {verifications.filter(v => v.taxVerifiedStatus === 'PENDING').length}
                    </p>
                </Card>
                <Card className="p-6 bg-slate-900/50 border-slate-800">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">KYC Reviews</p>
                    <p className="text-3xl font-black text-white">
                        {verifications.filter(v => v.kycStatus === 'PENDING').length}
                    </p>
                </Card>
                <Card className="p-6 bg-slate-600/5 border-emerald-500/20">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">SLA Health</p>
                    <p className="text-3xl font-black text-emerald-400">98.4%</p>
                </Card>
            </div>

            {/* Main Queue Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-800 bg-slate-950/50">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">User / Identity</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tax Information</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">SLA</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {verifications.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-emerald-500 font-black">
                                            {user.firstName[0]}{user.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="text-white font-black uppercase tracking-tight text-sm flex items-center gap-2">
                                                {user.firstName} {user.lastName}
                                                <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-blue-500 transition-colors cursor-pointer" />
                                            </p>
                                            <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="space-y-1">
                                        <div className="flex gap-2">
                                            <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[9px] font-black uppercase">{user.taxFormType || 'N/A'}</span>
                                            <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[9px] font-black uppercase">{user.taxIdType}</span>
                                        </div>
                                        <p className="text-white font-mono text-xs">{user.taxId || 'NOT_SUBMITTED'}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Tax Pending</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${user.kycStatus === 'VERIFIED' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${user.kycStatus === 'VERIFIED' ? 'text-emerald-500' : 'text-slate-500'}`}>
                                                KYC {user.kycStatus}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="space-y-1">
                                        <p className="text-white font-black text-xs">14H LEFT</p>
                                        <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="w-2/3 h-full bg-blue-500" />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleAction(user.id, 'REJECTED')}
                                            className="p-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition-all"
                                            title="Reject Verification"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleAction(user.id, 'VERIFIED')}
                                            className="p-3 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-xl transition-all"
                                            title="Approve Verification"
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {verifications.length === 0 && !loading && (
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="p-6 bg-slate-800/50 rounded-full">
                                            <ShieldAlert className="w-12 h-12 text-slate-700" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Queue is Empty</h3>
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">All users are verified and compliant</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Risk Policy Notice */}
            <div className="p-8 bg-amber-600/5 border border-amber-500/20 rounded-[2.5rem] flex items-start gap-6">
                <div className="p-4 bg-amber-600 rounded-2xl shadow-lg shadow-amber-600/20 text-white">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Manual Review Policy</h3>
                    <p className="text-slate-400 font-medium text-sm mt-1 leading-relaxed max-w-4xl">
                        Verify the tax ID format and name matching before approval. Rejection triggers an automated notification to the user requesting re-submission with corrected details. High-value accounts (&gt;$50k/mo) require secondary partner review.
                    </p>
                </div>
            </div>
        </div>
    );
}
