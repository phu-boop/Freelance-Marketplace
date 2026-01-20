'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    Briefcase, Calendar, Clock, DollarSign, ArrowUpRight, CheckCircle,
    Search, Filter, MoreVertical, ShieldCheck, AlertCircle, MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { formatDistance } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/Skeleton';
import { useKeycloak } from '@/components/KeycloakProvider';

export default function ContractsPage() {
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { userId } = useKeycloak();

    useEffect(() => {
        const fetchContracts = async () => {
            setLoading(true);
            try {
                const status = activeTab === 'active' ? 'ACTIVE' : 'COMPLETED,TERMINATED';
                const res = await api.get(`/contracts/my?status=${status}`);
                setContracts(res.data);
            } catch (error) {
                console.error('Failed to fetch contracts', error);
            } finally {
                setLoading(false);
            }
        };
        fetchContracts();
    }, [activeTab]);

    const filteredContracts = contracts.filter(c =>
        (c.job?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'from-emerald-400 to-teal-500';
            case 'COMPLETED': return 'from-blue-400 to-indigo-500';
            case 'TERMINATED': return 'from-red-400 to-rose-500';
            default: return 'from-slate-400 to-slate-500';
        }
    };

    const getStatusBadge = (status: string) => {
        const color = getStatusColor(status);
        return (
            <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${color} shadow-lg shadow-emerald-500/20`}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-bold text-white flex items-center gap-3"
                        >
                            <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-500">
                                <Briefcase className="w-8 h-8" />
                            </div>
                            My Contracts
                        </motion.h1>
                        <p className="text-slate-400 mt-2 text-lg">
                            Manage your active projects, finances, and work history.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all relative overflow-hidden ${activeTab === 'active' ? 'text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            {activeTab === 'active' && (
                                <motion.div
                                    layoutId="tab-bg"
                                    className="absolute inset-0 bg-blue-600 rounded-xl"
                                />
                            )}
                            <span className="relative z-10">Active Projects</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all relative overflow-hidden ${activeTab === 'history' ? 'text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            {activeTab === 'history' && (
                                <motion.div
                                    layoutId="tab-bg"
                                    className="absolute inset-0 bg-blue-600 rounded-xl"
                                />
                            )}
                            <span className="relative z-10">History</span>
                        </button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search contracts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                        />
                    </div>
                    <button className="px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-slate-700 transition-all flex items-center gap-2 font-bold">
                        <Filter className="w-5 h-5" />
                        Filters
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="bg-slate-900 rounded-3xl border border-slate-800 p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-3">
                                        <Skeleton className="h-4 w-24 rounded-full" />
                                        <Skeleton className="h-8 w-96 rounded-lg" />
                                    </div>
                                    <Skeleton className="h-10 w-32 rounded-xl" />
                                </div>
                                <div className="h-px bg-slate-800/50" />
                                <div className="flex gap-12">
                                    <Skeleton className="h-12 w-32 rounded-xl" />
                                    <Skeleton className="h-12 w-32 rounded-xl" />
                                    <Skeleton className="h-12 w-32 rounded-xl" />
                                </div>
                            </div>
                        ))
                    ) : filteredContracts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-900 rounded-3xl border border-slate-800 p-20 text-center space-y-6"
                        >
                            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto relative">
                                <Briefcase className="w-10 h-10 text-slate-500" />
                                <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500 rounded-full animate-ping opacity-20" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white">
                                    {searchQuery ? 'No matches found' : activeTab === 'active' ? 'No Active Contracts' : 'No Contract History'}
                                </h3>
                                <p className="text-slate-500 text-lg max-w-md mx-auto">
                                    {searchQuery ? `We couldn't find any contracts matching "${searchQuery}".` :
                                        activeTab === 'active' ? "You don't have any active projects right now. Time to find your next opportunity!" :
                                            "You haven't completed any contracts yet. Keep working hard!"}
                                </p>
                            </div>
                            {activeTab === 'active' && !searchQuery && (
                                <Link
                                    href="/marketplace"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-all hover:scale-105 shadow-xl shadow-blue-500/20"
                                >
                                    Explore Jobs <ArrowUpRight className="w-5 h-5" />
                                </Link>
                            )}
                        </motion.div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredContracts.map((contract, idx) => (
                                <motion.div
                                    key={contract.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-slate-900 rounded-3xl border border-slate-800 p-8 hover:border-blue-500/30 transition-all group relative overflow-hidden"
                                >
                                    {/* Background Decor */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 mb-3">
                                                    {getStatusBadge(contract.status)}
                                                    <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded-lg">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        Started {formatDistance(new Date(contract.createdAt || contract.updatedAt), new Date(), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors cursor-pointer" onClick={() => window.location.href = `/contracts/${contract.id}`}>
                                                    {contract.job?.title || 'Contract Details'}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <span>Client: </span>
                                                    <span className="text-slate-300 font-medium">{contract.client?.firstName || 'Confidential Client'}</span>
                                                    {/* Verified Badge Mock */}
                                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition-all">
                                                    <MessageSquare className="w-5 h-5" />
                                                </button>
                                                <Link
                                                    href={`/contracts/${contract.id}`}
                                                    className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-2"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-800">
                                            {/* Financials */}
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                    <DollarSign className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500 font-medium mb-1">Contract Value</p>
                                                    <div className="text-xl font-bold text-white">${contract.bidAmount.toLocaleString()}</div>
                                                    <p className="text-xs text-emerald-500 mt-1 font-medium">Fully Funded in Escrow</p>
                                                </div>
                                            </div>

                                            {/* Timeline */}
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                    <Calendar className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500 font-medium mb-1">Timeline</p>
                                                    <div className="text-xl font-bold text-white">{contract.timeline}</div>
                                                    <p className="text-xs text-slate-400 mt-1">Est. Completion: {new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            {/* Status/Milestones */}
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                                    <CheckCircle className="w-6 h-6" />
                                                </div>
                                                <div className="w-full">
                                                    <p className="text-sm text-slate-500 font-medium mb-1">Milestone Progress</p>
                                                    <div className="flex justify-between items-end mb-1">
                                                        <div className="text-xl font-bold text-white">0%</div>
                                                        <div className="text-xs text-purple-400 font-bold">1 Active Milestone</div>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-[5%]" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}
