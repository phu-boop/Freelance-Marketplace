'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, Loader2, Plus, Trash2, Check, Banknote, CreditCard } from 'lucide-react';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';

interface WithdrawalMethod {
    id: string;
    type: 'BANK_ACCOUNT' | 'PAYPAL';
    provider: string;
    accountNumber: string;
    accountName: string;
    isDefault: boolean;
}

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    balance: number;
}

import { useCurrency } from '@/components/CurrencyProvider';

export default function WithdrawalModal({
    isOpen,
    onClose,
    onSuccess,
    balance
}: WithdrawalModalProps) {
    const { userId } = useKeycloak();
    const { formatAmount, currency } = useCurrency();
    const [amount, setAmount] = useState('');
    const [methods, setMethods] = useState<WithdrawalMethod[]>([]);
    const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isAddingMethod, setIsAddingMethod] = useState(false);
    const [newMethod, setNewMethod] = useState({
        type: 'BANK_ACCOUNT',
        provider: '',
        accountNumber: '',
        accountName: ''
    });

    const fetchMethods = async () => {
        if (!userId) return;
        try {
            const res = await api.get(`/payments/withdrawal-methods/${userId}`);
            setMethods(res.data);
            const defaultMethod = res.data.find((m: WithdrawalMethod) => m.isDefault);
            if (defaultMethod) setSelectedMethodId(defaultMethod.id);
            else if (res.data.length > 0) setSelectedMethodId(res.data[0].id);
        } catch (error) {
            console.error('Failed to fetch withdrawal methods', error);
        }
    };

    useEffect(() => {
        if (isOpen && userId) {
            fetchMethods();
        }
    }, [isOpen, userId]);

    const handleAddMethod = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/payments/withdrawal-methods', {
                userId,
                data: newMethod
            });
            await fetchMethods();
            setIsAddingMethod(false);
            setNewMethod({
                type: 'BANK_ACCOUNT',
                provider: '',
                accountNumber: '',
                accountName: ''
            });
        } catch (error) {
            console.error('Failed to add withdrawal method', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMethod = async (id: string) => {
        if (!confirm('Are you sure you want to delete this withdrawal method?')) return;
        try {
            await api.delete(`/payments/withdrawal-methods/${userId}/${id}`);
            await fetchMethods();
        } catch (error) {
            console.error('Failed to delete withdrawal method', error);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMethodId) return;
        setLoading(true);
        try {
            await api.post('/payments/withdraw', {
                userId,
                amount: parseFloat(amount)
            });
            onSuccess();
            onClose();
            setAmount('');
        } catch (error) {
            console.error('Withdrawal failed', error);
            alert(error instanceof Error ? error.message : 'Withdrawal failed');
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
                        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Withdraw Funds</h2>
                            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {!isAddingMethod ? (
                                <form onSubmit={handleWithdraw} className="space-y-6">
                                    <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-500/20">
                                        <p className="text-sm text-blue-400 font-medium">Available Balance</p>
                                        <p className="text-3xl font-bold text-white">{formatAmount(balance)}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-400">Amount to Withdraw (in {currency})</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency === 'USD' ? '$' : currency}</span>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                max={balance}
                                                step="0.01"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-bold text-slate-400">Withdrawal Method</label>
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingMethod(true)}
                                                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" />
                                                Add New
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            {methods.map((method) => (
                                                <div
                                                    key={method.id}
                                                    onClick={() => setSelectedMethodId(method.id)}
                                                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedMethodId === method.id
                                                        ? 'bg-blue-600/10 border-blue-500'
                                                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${selectedMethodId === method.id ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                                            {method.type === 'BANK_ACCOUNT' ? <Banknote className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{method.provider}</p>
                                                            <p className="text-xs text-slate-400">{method.accountNumber}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {selectedMethodId === method.id && <Check className="w-4 h-4 text-blue-500" />}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteMethod(method.id);
                                                            }}
                                                            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {methods.length === 0 && (
                                                <p className="text-sm text-slate-500 italic text-center py-4">
                                                    No withdrawal methods added yet.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !selectedMethodId || !amount || parseFloat(amount) <= 0}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUpRight className="w-5 h-5" />}
                                        Confirm Withdrawal
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleAddMethod} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-400">Method Type</label>
                                        <select
                                            value={newMethod.type}
                                            onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value as any })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        >
                                            <option value="BANK_ACCOUNT">Bank Account</option>
                                            <option value="PAYPAL">PayPal</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-400">Provider / Bank Name</label>
                                        <input
                                            required
                                            value={newMethod.provider}
                                            onChange={(e) => setNewMethod({ ...newMethod, provider: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                            placeholder="e.g. Vietcombank"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-400">Account Number / Email</label>
                                        <input
                                            required
                                            value={newMethod.accountNumber}
                                            onChange={(e) => setNewMethod({ ...newMethod, accountNumber: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                            placeholder="e.g. 1234567890"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-400">Account Holder Name</label>
                                        <input
                                            required
                                            value={newMethod.accountName}
                                            onChange={(e) => setNewMethod({ ...newMethod, accountName: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                            placeholder="e.g. NGUYEN VAN A"
                                        />
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingMethod(false)}
                                            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                            Add Method
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
