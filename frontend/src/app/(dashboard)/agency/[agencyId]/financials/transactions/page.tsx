'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Filter, Download } from 'lucide-react';
import api from '@/lib/api';
import TransactionList from '@/components/agency/financials/TransactionList';

export default function AgencyTransactionsPage() {
    const params = useParams();
    const router = useRouter();
    const agencyId = params?.agencyId as string;

    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [filterType, setFilterType] = useState('ALL');

    useEffect(() => {
        if (!agencyId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const url = filterType === 'ALL'
                    ? `/payments/transactions/agency/${agencyId}?limit=50`
                    : `/payments/transactions/agency/${agencyId}?limit=50&type=${filterType}`;

                const txRes = await api.get(url);
                setTransactions(txRes.data.data);
            } catch (err: any) {
                console.error('Failed to fetch transactions', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [agencyId, filterType]);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8 space-y-6">
            <header className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Transaction History</h1>
                    <p className="text-slate-400 text-sm">View all financial activity for this agency.</p>
                </div>
            </header>

            <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 px-3 py-1.5 focus:outline-none focus:border-blue-500"
                    >
                        <option value="ALL">All Transactions</option>
                        <option value="PAYMENT">Payments</option>
                        <option value="WITHDRAWAL">Withdrawals</option>
                        <option value="AGENCY_REVENUE_SHARE">Revenue Share</option>
                        <option value="DEPOSIT">Deposits</option>
                    </select>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : (
                <TransactionList transactions={transactions} />
            )}
        </div>
    );
}
