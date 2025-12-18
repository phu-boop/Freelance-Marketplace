'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    DollarSign,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    Loader2,
    Download
} from 'lucide-react';
import api from '@/lib/api';

// Mock Contracts Data
const mockContracts = [
    {
        id: 'c1',
        jobTitle: 'Senior React Developer',
        clientName: 'TechFlow Inc.',
        freelancerName: 'Me',
        amount: 5000,
        paidAmount: 2500,
        status: 'Active',
        startDate: '2024-03-15',
        deadline: '2024-04-15'
    },
    {
        id: 'c2',
        jobTitle: 'UI/UX Design System',
        clientName: 'Creative Studio',
        freelancerName: 'Me',
        amount: 3000,
        paidAmount: 3000,
        status: 'Completed',
        startDate: '2024-02-01',
        deadline: '2024-02-28'
    }
];

export default function ContractsPage() {
    const [contracts, setContracts] = useState(mockContracts);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handlePayment = async (contractId: string) => {
        setProcessingId(contractId);
        try {
            // Simulate payment API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Update local state
            setContracts(prev => prev.map(c =>
                c.id === contractId
                    ? { ...c, paidAmount: c.amount, status: 'Completed' }
                    : c
            ));

            alert('Payment processed successfully!');
        } catch (err) {
            console.error('Payment failed', err);
            alert('Payment failed. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">My Contracts</h1>
                <p className="text-slate-400">Manage your active contracts and payments.</p>
            </div>

            <div className="grid gap-6">
                {contracts.map((contract, idx) => (
                    <motion.div
                        key={contract.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/30 transition-all"
                    >
                        <div className="flex flex-col lg:flex-row justify-between gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{contract.jobTitle}</h3>
                                        <p className="text-slate-400">Client: {contract.clientName}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-6 text-sm text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Started: {new Date(contract.startDate).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Deadline: {new Date(contract.deadline).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 lg:w-1/3">
                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                                    <div className="flex justify-between text-sm text-slate-400">
                                        <span>Total Amount</span>
                                        <span className="text-white font-medium">${contract.amount}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-400">
                                        <span>Paid</span>
                                        <span className="text-green-400 font-medium">${contract.paidAmount}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 transition-all duration-1000"
                                            style={{ width: `${(contract.paidAmount / contract.amount) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    {contract.status === 'Completed' || contract.paidAmount >= contract.amount ? (
                                        <button className="flex-1 py-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl font-medium flex items-center justify-center gap-2 cursor-default">
                                            <CheckCircle2 className="w-5 h-5" />
                                            Paid in Full
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handlePayment(contract.id)}
                                            disabled={!!processingId}
                                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                                        >
                                            {processingId === contract.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <CreditCard className="w-5 h-5" />
                                                    Make Payment
                                                </>
                                            )}
                                        </button>
                                    )}
                                    <button className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all">
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
