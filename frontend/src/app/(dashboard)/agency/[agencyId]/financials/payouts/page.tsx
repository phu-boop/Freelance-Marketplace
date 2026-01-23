'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Wallet, CreditCard, Building2, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { motion } from 'framer-motion';

export default function AgencyPayoutsPage() {
    const params = useParams();
    const router = useRouter();
    const agencyId = params?.agencyId as string;

    const [loading, setLoading] = useState(true);
    const [wallet, setWallet] = useState<any>(null);
    const [methods, setMethods] = useState<any[]>([]); // Mocked for now if endpoints missing
    const [amount, setAmount] = useState('');
    const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!agencyId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const walletRes = await api.get(`/payments/wallet/agency/${agencyId}`);
                setWallet(walletRes.data);

                // Ideally fetch agency-specific methods. For MVP, reusing user methods or mocking.
                // Assuming agency uses owner's methods or we have a separate endpoint.
                // Let's mock a couple for the UI if list is empty, or fetch user methods.
                // Since `payment-service` doesn't strictly separate agency methods yet.
                const methodsRes = await api.get('/payments/methods').catch(() => ({ data: [] }));

                if (methodsRes.data.length > 0) {
                    setMethods(methodsRes.data);
                    setSelectedMethodId(methodsRes.data[0].id);
                } else {
                    // Mock Data for Demo
                    setMethods([
                        { id: 'm1', type: 'BANK', details: { bankName: 'Chase', last4: '4242' }, isDefault: true },
                        { id: 'm2', type: 'PAYPAL', details: { email: 'agency@example.com' }, isDefault: false }
                    ]);
                    setSelectedMethodId('m1');
                }

            } catch (err: any) {
                console.error('Failed to fetch payout data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [agencyId]);

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            await api.post('/payments/withdraw/agency', {
                agencyId,
                amount: parseFloat(amount),
                methodId: selectedMethodId,
                instant: false // For now
            });
            setSuccess(true);
            setTimeout(() => {
                router.push(`/agency/${agencyId}/financials`);
            }, 2000);
        } catch (err: any) {
            console.error('Withdrawal failed', err);
            setError(err.response?.data?.message || 'Withdrawal failed. Please check your balance.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-950">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-slate-950 mb-6"
                >
                    <CheckCircle2 className="w-10 h-10" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Withdrawal Initiated!</h2>
                <p className="text-slate-400">Your funds are on the way. You will receive them shortly.</p>
            </div>
        );
    }

    const availableBalance = Number(wallet?.balance || 0);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <header className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Withdraw Funds</h1>
                    <p className="text-slate-400 text-sm">Transfer earnings to your bank or payment method.</p>
                </div>
            </header>

            <div className="max-w-xl mx-auto space-y-8">
                {/* Balance Card */}
                <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl text-center">
                    <p className="text-slate-400 text-sm mb-1">Available to Withdraw</p>
                    <h2 className="text-4xl font-bold text-white mb-6">
                        ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h2>
                    <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-full" />
                    </div>
                </div>

                <form onSubmit={handleWithdraw} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-300 ml-1">Amount to Withdraw ($)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                            <input
                                type="number"
                                min="1"
                                max={availableBalance}
                                step="0.01"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-4 pl-8 pr-4 text-xl font-bold text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="flex justify-between px-1">
                            {error ? (
                                <span className="text-xs text-red-500 font-bold">{error}</span>
                            ) : (
                                <span className="text-xs text-slate-500">Min: $1.00</span>
                            )}
                            <button
                                type="button"
                                onClick={() => setAmount(availableBalance.toString())}
                                className="text-xs font-bold text-blue-400 hover:text-blue-300"
                            >
                                Max Amount
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-300 ml-1">Select Method</label>
                        <div className="space-y-2">
                            {methods.map((method) => (
                                <div
                                    key={method.id}
                                    onClick={() => setSelectedMethodId(method.id)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedMethodId === method.id
                                        ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/50'
                                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedMethodId === method.id ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                            {method.type === 'BANK' ? <Building2 className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-white">
                                                {method.type === 'BANK' ? method.details.bankName : 'PayPal'}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {method.type === 'BANK' ? `Ending in •••• ${method.details.last4}` : method.details.email}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedMethodId === method.id && (
                                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || !amount || Number(amount) <= 0 || Number(amount) > availableBalance}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Withdrawal'}
                    </button>
                </form>
            </div>
        </div>
    );
}
