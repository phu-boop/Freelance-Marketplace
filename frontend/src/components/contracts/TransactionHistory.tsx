'use client';

import React from 'react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
    id: string;
    amount: string;
    type: string;
    status: string;
    description: string;
    createdAt: string;
}

interface TransactionHistoryProps {
    transactions: Transaction[];
    isLoading: boolean;
}

export function TransactionHistory({ transactions, isLoading }: TransactionHistoryProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <div className="relative w-12 h-12 mb-4">
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p>Loading transactions...</p>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <CreditCard className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-white font-medium mb-1">No transactions yet</h3>
                <p className="text-slate-400 text-sm max-w-xs">Financial activities for this contract will appear here once milestones are approved.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">Payment History</h3>
                <span className="text-xs text-slate-500">{transactions.length} record(s)</span>
            </div>

            <div className="space-y-3">
                {transactions.map((tx) => (
                    <div
                        key={tx.id}
                        className="group relative overflow-hidden bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 transition-all hover:bg-slate-800/60 hover:border-slate-700/50 hover:shadow-lg hover:shadow-blue-500/5"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'PAYMENT' ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-700/30 text-slate-400'
                                    }`}>
                                    {tx.type === 'PAYMENT' ? (
                                        tx.description.toLowerCase().includes('from') ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />
                                    ) : (
                                        <Clock className="w-5 h-5" />
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-white flex items-center gap-2">
                                        ${parseFloat(tx.amount).toFixed(2)}
                                        {tx.status === 'COMPLETED' ? (
                                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                                        ) : (
                                            <Clock className="w-3 h-3 text-yellow-500" />
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-300 mt-1">{tx.description}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                                            {format(new Date(tx.createdAt), 'MMM dd, yyyy · HH:mm')}
                                        </span>
                                        <span className="text-[10px] text-slate-600 font-mono">ID: {tx.id.slice(0, 8)}</span>
                                    </div>
                                </div>
                            </div>

                            <a
                                href={`/api/payments/transactions/${tx.id}/invoice`}
                                target="_blank"
                                rel="noreferrer"
                                className="opacity-0 group-hover:opacity-100 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all flex items-center gap-2 text-xs"
                            >
                                <FileText className="w-4 h-4" />
                                Invoice
                            </a>
                        </div>

                        {/* Decorative glow effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-blue-500/5 border border-dashed border-blue-500/20 rounded-xl">
                <div className="flex gap-3 text-xs text-blue-400/80 leading-relaxed">
                    <div className="mt-0.5"><CheckCircle2 className="w-4 h-4" /></div>
                    <p>
                        All payments are held securely in escrow and released only upon approval.
                        Invoices are automatically generated for every transaction.
                    </p>
                </div>
            </div>
        </div>
    );
}
