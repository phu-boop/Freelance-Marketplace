'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Calendar, Wallet, CheckCircle2, AlertCircle, Clock, Hash, Download } from 'lucide-react';
import { useCurrency } from '@/components/CurrencyProvider';

interface Transaction {
    id: string;
    amount: number;
    type: string;
    status: string;
    createdAt: string;
    description: string;
    referenceId?: string;
    invoiceId?: string;
    metadata?: Record<string, unknown>;
    wallet?: {
        userId: string;
    };
    invoice?: {
        id: string;
        invoiceNumber: string;
    };
}

interface TransactionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

export default function TransactionDetailsModal({ isOpen, onClose, transaction }: TransactionDetailsModalProps) {
    const { formatAmount } = useCurrency();

    if (!isOpen || !transaction) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'PENDING': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'FAILED': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle2 className="w-5 h-5" />;
            case 'PENDING': return <Clock className="w-5 h-5" />;
            case 'FAILED': return <AlertCircle className="w-5 h-5" />;
            default: return <AlertCircle className="w-5 h-5" />;
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Wallet className="w-6 h-6 text-blue-500" />
                            Transaction Details
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Amount & Status */}
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 text-sm font-bold ${getStatusColor(transaction.status)}`}>
                                    {getStatusIcon(transaction.status)}
                                    {transaction.status}
                                </div>
                            </div>
                            <div>
                                <h3 className={`text-4xl font-bold ${transaction.amount >= 0 ? 'text-white' : 'text-slate-200'}`}>
                                    {formatAmount(Number(transaction.amount))}
                                </h3>
                                <p className="text-slate-400 mt-2">{transaction.description}</p>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-6 p-6 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    <Calendar className="w-3 h-3" />
                                    Date
                                </div>
                                <p className="text-white font-medium">
                                    {new Date(transaction.createdAt).toLocaleString(undefined, {
                                        dateStyle: 'medium',
                                        timeStyle: 'short'
                                    })}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    <Hash className="w-3 h-3" />
                                    Reference ID
                                </div>
                                <p className="text-white font-mono text-sm truncate" title={transaction.id}>
                                    {transaction.id.substring(0, 16)}...
                                </p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    <Hash className="w-3 h-3" />
                                    Type
                                </div>
                                <p className="text-white font-medium">{transaction.type}</p>
                            </div>
                            {transaction.invoice && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        <FileText className="w-3 h-3" />
                                        Invoice
                                    </div>
                                    <p className="text-blue-400 font-medium hover:underline cursor-pointer">
                                        #{transaction.invoice.invoiceNumber}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                            >
                                Close
                            </button>
                            {transaction.invoice && (
                                <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                                    <Download className="w-4 h-4" />
                                    Download Invoice
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
