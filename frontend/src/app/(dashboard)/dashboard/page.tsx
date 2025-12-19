'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Briefcase,
    Clock,
    DollarSign,
    Star,
    ArrowUpRight,
    TrendingUp,
    User,
    FileText
} from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import Link from 'next/link';

const stats = [
    { label: 'Active Contracts', value: '12', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Earnings', value: '$4,250', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Avg. Rating', value: '4.9', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'Hours Worked', value: '164h', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

const recentActivity = [
    { id: 1, type: 'proposal', title: 'Senior React Developer', status: 'Pending', date: '2 hours ago' },
    { id: 2, type: 'contract', title: 'E-commerce Website', status: 'Active', date: '1 day ago' },
    { id: 3, type: 'payment', title: 'Milestone 1 Payment', status: 'Received', date: '3 days ago' },
];

export default function DashboardPage() {
    const { userId } = useKeycloak();
    const [user, setUser] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;
            try {
                const res = await api.get(`/users/${userId}`);
                setUser(res.data);
            } catch (err) {
                console.error('Failed to fetch user', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400 mt-1">
                        {loading ? 'Loading...' : `Welcome back, ${user?.firstName || 'User'}! Here's what's happening today.`}
                    </p>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2">
                    Browse Jobs <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group"
                    >
                        <div className="flex justify-between items-start">
                            <div className={stat.bg + " p-3 rounded-xl"}>
                                <stat.icon className={stat.color + " w-6 h-6"} />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="mt-4">
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        {recentActivity.map((activity, idx) => (
                            <div
                                key={activity.id}
                                className={"p-4 flex items-center justify-between hover:bg-slate-800/50 transition-all " + (idx !== recentActivity.length - 1 ? "border-b border-slate-800" : "")}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                                        {activity.type === 'proposal' && <FileText className="w-5 h-5 text-blue-400" />}
                                        {activity.type === 'contract' && <Briefcase className="w-5 h-5 text-green-400" />}
                                        {activity.type === 'payment' && <DollarSign className="w-5 h-5 text-yellow-400" />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">{activity.title}</div>
                                        <div className="text-xs text-slate-500">{activity.date}</div>
                                    </div>
                                </div>
                                <span className={"px-3 py-1 rounded-full text-xs font-medium " + (
                                    activity.status === 'Active' ? "bg-green-500/10 text-green-400" :
                                        activity.status === 'Pending' ? "bg-blue-500/10 text-blue-400" :
                                            "bg-yellow-500/10 text-yellow-400"
                                )}>
                                    {activity.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions / Profile Summary */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Profile Strength</h3>
                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-1">
                                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                                        {user?.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-8 h-8 text-slate-400" />
                                        )}
                                    </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-slate-900 rounded-full" />
                            </div>
                            <div>
                                <div className="font-bold text-white">{user?.firstName} {user?.lastName}</div>
                                <div className="text-sm text-slate-400">{user?.title || 'User'}</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Completeness</span>
                                <span className="text-blue-400 font-medium">{user?.completionPercentage || 0}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-500"
                                    style={{ width: `${user?.completionPercentage || 0}%` }}
                                />
                            </div>
                        </div>
                        <Link
                            href="/profile"
                            className="block w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-center rounded-lg text-sm font-medium transition-all"
                        >
                            View Profile
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

