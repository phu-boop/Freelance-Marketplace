'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Send, CheckCircle2, FileText, ArrowLeft, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function AppealPage() {
    const [step, setStep] = useState<'status' | 'form' | 'success'>('status');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'SUSPENSION',
        reason: '',
        evidenceUrls: []
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // In a real app, we'd get userId from auth context
            const userId = 'me';
            await api.post(`/users/${userId}/appeals`, formData);
            setStep('success');
        } catch (err) {
            console.error('Failed to submit appeal', err);
            alert('Failed to submit appeal. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
            <div className="max-w-xl w-full">
                <AnimatePresence mode="wait">
                    {step === 'status' && (
                        <motion.div
                            key="status"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-500/10 rounded-2xl">
                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white">Account Restricted</h1>
                                    <p className="text-slate-400">Guardian AI detected suspicious activity on your account.</p>
                                </div>
                            </div>

                            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-4">
                                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Restriction Details</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Reason</span>
                                        <span className="text-red-400 font-medium text-right ml-4">Off-platform payment attempt detected in chat.</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Date</span>
                                        <span className="text-slate-300">Jan 20, 2026</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Impact</span>
                                        <span className="text-amber-400">Messaging Restricted, New Contracts Blocked</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    We take platform safety seriously. If you believe this was an error, you can submit an appeal.
                                    Our security team will review your case within 24-48 hours.
                                </p>
                                <div className="flex gap-4">
                                    <Link href="/" className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all text-center">
                                        Back to Home
                                    </Link>
                                    <button
                                        onClick={() => setStep('form')}
                                        className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/20"
                                    >
                                        Start Appeal
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'form' && (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6"
                        >
                            <button onClick={() => setStep('status')} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-all text-sm font-medium mb-2">
                                <ArrowLeft className="w-4 h-4" /> Back to details
                            </button>

                            <div>
                                <h2 className="text-2xl font-bold text-white">Submit Appeal</h2>
                                <p className="text-slate-500 mt-1">Provide as much detail as possible to help us review your case.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Reason for appeal</label>
                                    <textarea
                                        required
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        placeholder="Explain why you believe the restriction should be lifted..."
                                        className="w-full h-40 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Supporting Evidence (Optional)</label>
                                    <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 hover:bg-slate-800/50 transition-all text-center cursor-pointer">
                                        <div className="flex flex-col items-center gap-2 text-slate-500">
                                            <UploadCloud className="w-10 h-10" />
                                            <span className="text-sm font-medium">Click to upload screenshots or docs</span>
                                            <span className="text-xs">Maximum 3 files, 5MB each</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !formData.reason}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Processing...' : (
                                        <>
                                            Submit Appeal <Send className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-12 shadow-2xl text-center space-y-6"
                        >
                            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-12 h-12 text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white">Appeal Submitted</h2>
                                <p className="text-slate-400 mt-2">
                                    Your appeal has been received. Our security team will review the information provided and notify you via email when a decision is made.
                                </p>
                            </div>
                            <div className="pt-4">
                                <Link href="/" className="inline-block px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all">
                                    Return to Home
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
