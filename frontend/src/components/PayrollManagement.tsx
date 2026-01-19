'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Banknote,
    Calculator,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronRight,
    ArrowRight,
    CircleDollarSign,
    ShieldCheck
} from 'lucide-react';
import api from '@/lib/api';
import { useCurrency } from '@/components/CurrencyProvider';

interface Contract {
    id: string;
    freelancer_id: string;
    client_id: string;
    totalAmount: number;
    status: string;
    type: string;
    eorFeePercentage: number;
    startDate: string;
    freelancerName?: string;
}

interface PayrollPreview {
    gross: number;
    eorFee: number;
    taxAmount: number;
    taxRate: number;
    totalBenefitsCost: number;
    netAmount: number;
}

export default function PayrollManagement() {
    const { formatAmount } = useCurrency();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [grossAmount, setGrossAmount] = useState<string>('');
    const [preview, setPreview] = useState<PayrollPreview | null>(null);
    const [calculating, setCalculating] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/contracts/my');
            const eorContracts = res.data.filter((c: Contract) => c.type === 'EOR' && c.status === 'ACTIVE');

            // Fetch freelancer names for these contracts
            const enrichedContracts = await Promise.all(eorContracts.map(async (c: Contract) => {
                try {
                    const userRes = await api.get(`/users/${c.freelancer_id}`);
                    return { ...c, freelancerName: `${userRes.data.firstName} ${userRes.data.lastName}` };
                } catch {
                    return { ...c, freelancerName: 'Unknown Freelancer' };
                }
            }));

            setContracts(enrichedContracts);
        } catch (error) {
            console.error('Failed to fetch EOR contracts', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async () => {
        if (!selectedContract || !grossAmount) return;
        setCalculating(true);
        setPreview(null);
        try {
            const res = await api.get('/payments/payroll/preview', {
                params: {
                    contractId: selectedContract.id,
                    grossAmount: parseFloat(grossAmount),
                    employeeId: selectedContract.freelancer_id
                }
            });
            setPreview(res.data);
        } catch (error) {
            console.error('Preview failed', error);
            alert('Failed to calculate preview. Please check if tax settings are available for the employee country.');
        } finally {
            setCalculating(false);
        }
    };

    const handleProcess = async () => {
        if (!selectedContract || !grossAmount) return;
        setProcessing(true);
        try {
            await api.post('/payments/payroll/process', {
                contractId: selectedContract.id,
                employeeId: selectedContract.freelancer_id,
                grossAmount: parseFloat(grossAmount),
                periodStart: new Date().toISOString(), // Mocking period for demo
                periodEnd: new Date().toISOString()
            });
            setSuccess(true);
            setGrossAmount('');
            setPreview(null);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Processing failed', error);
            alert('Payroll processing failed. Ensure wallet has sufficient funds.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-blue-500" />
                    Employer of Record (EOR) Payroll
                </h1>
                <p className="text-slate-400">Manage tax-compliant payroll, benefits, and insurance for your global talent.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contract List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active EOR Contracts</h2>
                        <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-full">{contracts.length}</span>
                    </div>

                    <div className="space-y-3">
                        {contracts.map(contract => (
                            <button
                                key={contract.id}
                                onClick={() => {
                                    setSelectedContract(contract);
                                    setPreview(null);
                                    setGrossAmount('');
                                }}
                                className={`w-full p-4 rounded-2xl border transition-all text-left flex flex-col gap-1 ${selectedContract?.id === contract.id
                                        ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10'
                                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-white">{contract.freelancerName}</span>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedContract?.id === contract.id ? 'rotate-90 text-blue-500' : 'text-slate-600'}`} />
                                </div>
                                <span className="text-xs text-slate-500">Contract: {contract.id.slice(0, 8)}...</span>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-blue-400 font-bold">EOR - {contract.eorFeePercentage}% Fee</span>
                                </div>
                            </button>
                        ))}
                        {contracts.length === 0 && (
                            <div className="p-8 text-center bg-slate-900 border border-dashed border-slate-800 rounded-2xl">
                                <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">No active EOR contracts found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payroll Calculator & Summary */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedContract ? (
                            <motion.div
                                key={selectedContract.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
                            >
                                <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{selectedContract.freelancerName}</h3>
                                        <p className="text-sm text-slate-400">Payroll Cycle: Monthly</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Fee Tier</p>
                                        <p className="text-blue-400 font-bold">{selectedContract.eorFeePercentage}% Platform Fee</p>
                                    </div>
                                </div>

                                <div className="p-8 space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                            <Calculator className="w-4 h-4" />
                                            Enter Gross Pay Amount
                                        </label>
                                        <div className="flex gap-4">
                                            <div className="relative flex-1">
                                                <CircleDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                                <input
                                                    type="number"
                                                    value={grossAmount}
                                                    onChange={(e) => setGrossAmount(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                                />
                                            </div>
                                            <button
                                                onClick={handlePreview}
                                                disabled={!grossAmount || calculating}
                                                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-2xl font-bold transition-all flex items-center gap-2"
                                            >
                                                {calculating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5" />}
                                                Calculate
                                            </button>
                                        </div>
                                    </div>

                                    {preview && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-6 pt-6 border-t border-slate-800"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {/* Deductions Breakdown */}
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-bold text-slate-500 uppercase">Employee Breakdown</h4>
                                                    <div className="p-4 rounded-2xl bg-slate-800/50 space-y-3">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-400">Gross Salary</span>
                                                            <span className="text-white font-medium">{formatAmount(preview.gross)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-slate-400">Income Tax</span>
                                                                <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded">{(preview.taxRate * 100).toFixed(1)}%</span>
                                                            </div>
                                                            <span className="text-red-400">-{formatAmount(preview.taxAmount)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-400">Benefits Contribution</span>
                                                            <span className="text-red-400">-{formatAmount(preview.totalBenefitsCost)}</span>
                                                        </div>
                                                        <div className="pt-2 border-t border-slate-700 flex justify-between">
                                                            <span className="font-bold text-white">Net Take-Home</span>
                                                            <span className="font-bold text-green-400">{formatAmount(preview.netAmount)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Employer Costs */}
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-bold text-slate-500 uppercase">Total Employer Cost</h4>
                                                    <div className="p-4 rounded-2xl bg-blue-600/5 border border-blue-500/20 space-y-3">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-400">Salary Amount</span>
                                                            <span className="text-white font-medium">{formatAmount(preview.gross)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-400">EOR Platform Fee ({selectedContract.eorFeePercentage}%)</span>
                                                            <span className="text-white font-medium">{formatAmount(preview.eorFee)}</span>
                                                        </div>
                                                        <div className="pt-2 border-t border-blue-500/10 flex justify-between">
                                                            <span className="font-bold text-white">Total Charge</span>
                                                            <span className="font-bold text-blue-400">{formatAmount(preview.gross + preview.eorFee)}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 italic">
                                                        * Funds will be deducted from your organization wallet. Benefits and taxes are automatically remitted to relevant authorities.
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleProcess}
                                                disabled={processing}
                                                className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:bg-green-600/50 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
                                            >
                                                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Banknote className="w-5 h-5" />}
                                                Confirm & Process Payroll
                                            </button>
                                        </motion.div>
                                    )}

                                    {success && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-green-400"
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                            <p className="font-bold text-sm">Payroll successfully processed and funds distributed.</p>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-900 border border-dashed border-slate-800 rounded-3xl p-12 text-center">
                                <div className="p-4 rounded-full bg-slate-800/50 mb-6">
                                    <ArrowRight className="w-8 h-8 text-slate-600" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Select a Global Employee</h3>
                                <p className="text-slate-500 max-w-xs">Choose a contract from the list to manage payroll, view tax breakdowns, and remit payments.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Compliance Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 h-fit">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h5 className="font-bold text-white text-sm mb-1">Global Compliance</h5>
                        <p className="text-xs text-slate-500 leading-relaxed">Tax withholdings are calculated based on current regional regulations in the employee's country of residence.</p>
                    </div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex gap-4">
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 h-fit">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h5 className="font-bold text-white text-sm mb-1">Benefits Management</h5>
                        <p className="text-xs text-slate-500 leading-relaxed">Active health and retirement plans are automatically factored into Net pay and employer cost summaries.</p>
                    </div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex gap-4">
                    <div className="p-3 rounded-xl bg-green-500/10 text-green-500 h-fit">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h5 className="font-bold text-white text-sm mb-1">Automated Reporting</h5>
                        <p className="text-xs text-slate-500 leading-relaxed">1099-K and regional tax documents are generated at year-end based on these payroll records.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
