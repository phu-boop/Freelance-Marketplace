'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, MoreHorizontal } from 'lucide-react';

interface Transaction {
    id: string;
    type: 'PAYMENT' | 'WITHDRAWAL' | 'DEPOSIT' | 'AGENCY_REVENUE_SHARE' | 'CONNECTS_PURCHASE';
    amount: number;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
    description: string;
    createdAt: string;
}

interface TransactionListProps {
    transactions: Transaction[];
    isLoading?: boolean;
}

export default function TransactionList({ transactions, isLoading }: TransactionListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-slate-800/50 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="p-8 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800 border-dashed">
                No transactions found.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {transactions.map((tx, idx) => (
                <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'WITHDRAWAL' || tx.type === 'CONNECTS_PURCHASE'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-emerald-500/10 text-emerald-500'
                            }`}>
                            {tx.type === 'WITHDRAWAL' || tx.type === 'CONNECTS_PURCHASE' ? (
                                <ArrowUpRight className="w-5 h-5" />
                            ) : (
                                <ArrowDownLeft className="w-5 h-5" />
                            )}
                        </div>
                        <div>
                            <h4 className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors">
                                {tx.description || tx.type.replace(/_/g, ' ')}
                            </h4>
                            <p className="text-slate-500 text-xs mt-0.5">
                                {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className={`font-bold ${tx.type === 'WITHDRAWAL' || tx.type === 'CONNECTS_PURCHASE' ? 'text-white' : 'text-emerald-400'
                                }`}>
                                {tx.type === 'WITHDRAWAL' || tx.type === 'CONNECTS_PURCHASE' ? '-' : '+'}${Math.abs(Number(tx.amount)).toFixed(2)}
                            </p>
                            <div className="flex items-center justify-end gap-1 mt-0.5">
                                {tx.status === 'COMPLETED' ? (
                                    <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                                        <CheckCircle2 className="w-3 h-3" /> Completed
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[10px] text-amber-500 font-medium">
                                        <Clock className="w-3 h-3" /> Pending
                                    </span>
                                )}
                            </div>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-white transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
