'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Shield,
    Ban,
    CheckCircle2,
    Loader2,
    AlertTriangle,
    UserCheck
} from 'lucide-react';
import api from '@/lib/api';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    status: string;
    createdAt: string;
    guardianRiskScore?: number;
    guardianFlags?: string[];
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data.results || []);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAction = async (userId: string, action: 'suspend' | 'ban' | 'activate') => {
        setProcessingId(userId);
        try {
            await api.post(`/admins/users/${userId}/${action}`);
            await fetchUsers();
        } catch (error) {
            console.error(`Failed to ${action} user`, error);
        } finally {
            setProcessingId(null);
        }
    };

    const filteredUsers = users.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">User Management</h1>
                    <p className="text-slate-400">View and moderate system users.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-all w-full md:w-80"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                </div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950/50 border-b border-slate-800">
                                <tr>
                                    <th className="p-4 text-sm font-medium text-slate-400">User</th>
                                    <th className="p-4 text-sm font-medium text-slate-400">Roles</th>
                                    <th className="p-4 text-sm font-medium text-slate-400">Status</th>
                                    <th className="p-4 text-sm font-medium text-slate-400">Risk</th>
                                    <th className="p-4 text-sm font-medium text-slate-400">Joined</th>
                                    <th className="p-4 text-sm font-medium text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
                                                    {user.firstName?.charAt(0) || user.email.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{user.firstName} {user.lastName}</p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.map((role) => (
                                                    <span key={role} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                        <Shield className="w-3 h-3" />
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.status === 'ACTIVE'
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                : user.status === 'SUSPENDED'
                                                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                {user.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : user.status === 'SUSPENDED' ? <AlertTriangle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {user.guardianRiskScore !== undefined && user.guardianRiskScore > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${user.guardianRiskScore > 70
                                                            ? 'bg-red-500/20 text-red-500 border-red-500/30'
                                                            : user.guardianRiskScore > 30
                                                                ? 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                                                                : 'bg-blue-500/20 text-blue-500 border-blue-500/30'
                                                        }`}>
                                                        <Shield className="w-3 h-3" />
                                                        {user.guardianRiskScore}%
                                                    </div>
                                                    {user.guardianFlags && user.guardianFlags.length > 0 && (
                                                        <span className="text-[9px] text-slate-500 truncate w-32" title={user.guardianFlags.join(', ')}>
                                                            {user.guardianFlags[0]}
                                                            {user.guardianFlags.length > 1 && ` +${user.guardianFlags.length - 1}`}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-600">Low Risk</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-slate-400">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {user.status !== 'ACTIVE' && (
                                                    <button
                                                        onClick={() => handleAction(user.id, 'activate')}
                                                        disabled={!!processingId}
                                                        className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
                                                        title="Activate User"
                                                    >
                                                        {processingId === user.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCheck className="w-5 h-5" />}
                                                    </button>
                                                )}
                                                {user.status === 'ACTIVE' && (
                                                    <button
                                                        onClick={() => handleAction(user.id, 'suspend')}
                                                        disabled={!!processingId}
                                                        className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-all"
                                                        title="Suspend User"
                                                    >
                                                        {processingId === user.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertTriangle className="w-5 h-5" />}
                                                    </button>
                                                )}
                                                {user.status !== 'BANNED' && (
                                                    <button
                                                        onClick={() => handleAction(user.id, 'ban')}
                                                        disabled={!!processingId}
                                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                        title="Ban User"
                                                    >
                                                        {processingId === user.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Ban className="w-5 h-5" />}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
