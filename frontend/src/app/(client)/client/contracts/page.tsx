'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, Search, MoreHorizontal, Loader2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface Contract {
    id: string;
    title: string;
    status: string;
    totalAmount: number;
    startDate: string;
    freelancerId: string;
}

export default function ClientContractsPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                // Use the new endpoint in contract-service
                const res = await api.get('/contracts/my');
                setContracts(res.data);
            } catch (error) {
                console.error('Failed to fetch contracts', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContracts();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Contracts</h1>
                    <p className="text-slate-400">Manage your active contracts and hires.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : contracts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {contracts.map((contract) => (
                        <motion.div
                            key={contract.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-indigo-400" />
                                        <h3 className="text-xl font-bold text-white">{contract.title || 'Untitled Contract'}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${contract.status === 'ACTIVE'
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : 'bg-slate-800 text-slate-400 border-slate-700'
                                            }`}>
                                            {contract.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Started {new Date(contract.startDate).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500">Total Budget:</span>
                                            <span className="text-white">${contract.totalAmount}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link href={`/client/contracts/${contract.id}`}>
                                        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors">
                                            View Details
                                        </button>
                                    </Link>
                                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
                    <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No active contracts</h3>
                    <p className="text-slate-400">When you hire a freelancer, the contract will appear here.</p>
                </div>
            )}
        </div>
    );
}
