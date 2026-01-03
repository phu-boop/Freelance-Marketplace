'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Briefcase, CreditCard, Users, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ClientDashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Overview</h1>
                    <p className="text-slate-400">Manage your postings and hires.</p>
                </div>
                <Link href="/marketplace/create">
                    <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all">
                        <PlusCircle className="w-5 h-5" />
                        Post a Job
                    </button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Jobs', value: '3', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Total Spent', value: '$12,450', icon: CreditCard, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Hired Freelancers', value: '8', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'Hours Billed', value: '142', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-6 rounded-2xl bg-slate-900 border border-slate-800"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                        <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Recent Jobs Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Active Job Postings</h2>
                    <Link href="/client/jobs" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                        View All
                    </Link>
                </div>

                <div className="space-y-4">
                    {/* Placeholder for jobs list */}
                    <div className="text-center py-10 text-slate-500">
                        <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>You have no active jobs at the moment.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
