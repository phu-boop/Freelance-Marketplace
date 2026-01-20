'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import { Wallet, Loader2, Plus, Globe, Smartphone, Save, CheckCircle2, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import DepositModal from '@/components/DepositModal';
import WithdrawalModal from '@/components/WithdrawalModal';
import { useCurrency } from '@/components/CurrencyProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConnectsShop from '@/components/wallet/ConnectsShop';
import TransactionHistoryTable from '@/components/wallet/TransactionHistoryTable';

interface Transaction {
    id: string;
    amount: number;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'FEE';
    status: string;
    createdAt: string;
    description: string;
}

interface WalletData {
    id: string;
    balance: number;
    currency: string;
    preferredCurrency: string;
    cryptoAddress?: string;
    transactions: Transaction[];
}

export default function WalletPage() {
    const { userId, authenticated } = useKeycloak();
    const router = useRouter();
    const { currency, setCurrency, formatAmount, rates } = useCurrency();
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [cryptoAddress, setCryptoAddress] = useState('');
    const [isSavingCrypto, setIsSavingCrypto] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const fetchWallet = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await api.get(`/payments/wallet/${userId}`);
            setWallet(res.data);
            setCryptoAddress(res.data.cryptoAddress || '');
        } catch (error) {
            console.error('Failed to fetch wallet', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const handleSaveCrypto = async () => {
        setIsSavingCrypto(true);
        try {
            await api.patch('/payments/wallet/crypto-address', { address: cryptoAddress });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error('Failed to save crypto address', err);
        } finally {
            setIsSavingCrypto(false);
        }
    };


    useEffect(() => {
        if (authenticated && userId) {
            fetchWallet();
        }
    }, [authenticated, userId, fetchWallet]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-end gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="md:col-span-2 h-64 rounded-[2.5rem]" />
                    <div className="space-y-6">
                        <Skeleton className="h-32 rounded-3xl" />
                        <Skeleton className="h-32 rounded-3xl" />
                    </div>
                </div>

                <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <div className="space-y-2">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-20 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-white">My Wallet</h1>
                    <p className="text-slate-400">Manage your earnings and funds globally.</p>
                </div>

                <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
                    <Globe className="w-4 h-4 text-slate-500 ml-2" />
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="bg-transparent text-white border-none focus:ring-0 text-sm font-bold"
                    >
                        {Object.keys(rates).map(c => (
                            <option key={c} value={c} className="bg-slate-900">{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl mb-6">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6">Overview</TabsTrigger>
                    <TabsTrigger value="connects" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Buy Connects
                    </TabsTrigger>
                    <TabsTrigger
                        value="subscriptions"
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6"
                        onClick={() => router.push('/subscriptions')}
                    >
                        Subscriptions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Balance Card */}
                        <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Wallet className="w-32 h-32" />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <div>
                                    <p className="text-blue-200 font-medium">Total Balance</p>
                                    <h2 className="text-5xl font-bold mt-2">
                                        {formatAmount(Number(wallet?.balance || 0))}
                                    </h2>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setIsDepositOpen(true)}
                                        className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Deposit
                                    </button>
                                    <button
                                        onClick={() => setIsWithdrawOpen(true)}
                                        className="px-6 py-3 bg-blue-700/50 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors border border-blue-400/30"
                                    >
                                        Withdraw
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Stats & Crypto */}
                        <div className="space-y-6">
                            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                                <div className="space-y-1">
                                    <p className="text-slate-400 text-sm">Total Earnings</p>
                                    <p className="text-2xl font-bold text-white">{formatAmount(0)}</p>
                                </div>
                                <div className="h-px bg-slate-800" />
                                <div className="space-y-1">
                                    <p className="text-slate-400 text-sm">Pending Clearance</p>
                                    <p className="text-2xl font-bold text-slate-300">{formatAmount(0)}</p>
                                </div>
                            </div>

                            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                                <div className="flex items-center gap-2 text-indigo-400">
                                    <Smartphone className="w-5 h-5" />
                                    <h3 className="font-bold">Crypto Wallet</h3>
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="ETH or SOL address"
                                        value={cryptoAddress}
                                        onChange={(e) => setCryptoAddress(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <button
                                        onClick={handleSaveCrypto}
                                        disabled={isSavingCrypto}
                                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {isSavingCrypto ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                            saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                        {saveSuccess ? 'Saved!' : 'Save Address'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <TransactionHistoryTable />
                    </div>
                </TabsContent>

                <TabsContent value="connects">
                    <ConnectsShop />
                </TabsContent>
            </Tabs>

            <DepositModal
                isOpen={isDepositOpen}
                onClose={() => setIsDepositOpen(false)}
                onSuccess={fetchWallet}
            />

            <WithdrawalModal
                isOpen={isWithdrawOpen}
                onClose={() => setIsWithdrawOpen(false)}
                onSuccess={fetchWallet}
                balance={Number(wallet?.balance || 0)}
            />
        </div>
    );
}
