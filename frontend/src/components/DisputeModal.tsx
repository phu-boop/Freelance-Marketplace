'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2, ShieldAlert } from 'lucide-react';
import api from '@/lib/api';

interface DisputeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    contractId: string;
}

export default function DisputeModal({
    isOpen,
    onClose,
    onSuccess,
    contractId
}: DisputeModalProps) {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/contracts/${contractId}/dispute`, { reason });
            onSuccess();
            onClose();
            setReason('');
        } catch (error) {
            console.error('Failed to open dispute', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-red-500/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                    <ShieldAlert className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Open Dispute</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-sm text-red-400 leading-relaxed">
                                <p className="font-bold mb-1 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Important Notice
                                </p>
                                Opening a dispute will freeze the contract and notify the administration. Please provide a detailed reason for the dispute.
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400">Reason for Dispute</label>
                                <textarea
                                    required
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all resize-none"
                                    placeholder="Explain why you are opening this dispute..."
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !reason.trim()}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />}
                                    Open Dispute
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
