'use client';

import React from 'react';
import api from '@/lib/api';
import { Briefcase, Calendar, Clock, DollarSign, ArrowUpRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDistance } from 'date-fns';

export default function ContractsPage() {
    const [contracts, setContracts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchContracts = async () => {
            try {
                const res = await api.get('/proposals/my/contracts');
                setContracts(res.data);
            } catch (error) {
                console.error('Failed to fetch contracts', error);
            } finally {
                setLoading(false);
            }
        };
        fetchContracts();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-6">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Briefcase className="w-8 h-8 text-blue-500" />
                            My Contracts
                        </h1>
                        <p className="text-slate-400 mt-2">
                            Manage your active projects and track your work history.
                        </p>
                    </div>
                </div>

                {/* Contracts List */}
                <div className="grid gap-6">
                    {contracts.length === 0 ? (
                        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="w-8 h-8 text-slate-500" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">No Active Contracts</h3>
                            <p className="text-slate-400 mb-6">You don't have any active contracts yet. Start applying for jobs!</p>
                            <Link
                                href="/jobs"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
                            >
                                Find Work
                            </Link>
                        </div>
                    ) : (
                        contracts.map((contract) => (
                            <div key={contract.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 hover:border-slate-700 transition-colors group">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                Active
                                            </span>
                                            <span className="text-slate-400 text-xs flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Started {formatDistance(new Date(contract.updatedAt), new Date(), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                            {contract.job.title}
                                        </h3>
                                    </div>
                                    <Link
                                        href={`/contracts/${contract.id}`}
                                        className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors"
                                    >
                                        View Details
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
                                            <DollarSign className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-400">Rate</div>
                                            <div className="font-medium text-white">${contract.bidAmount}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-400">Timeline</div>
                                            <div className="font-medium text-white">{contract.timeline}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
                                            <CheckCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-400">Client</div>
                                            <div className="font-medium text-white">Verified Client</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
