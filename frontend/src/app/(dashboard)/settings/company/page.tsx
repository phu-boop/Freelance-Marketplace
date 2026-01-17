'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Plus,
    Settings,
    UserPlus,
    Trash2,
    Building2,
    Briefcase,
    ShieldCheck,
    Search,
    Mail,
    X,
    LayoutDashboard
} from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';
import { getPublicUrl } from '@/lib/utils';
import api from '@/lib/api';

interface TeamMember {
    id: string;
    userId: string;
    role: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatarUrl?: string;
    };
}

interface Team {
    id: string;
    name: string;
    description: string;
    logoUrl?: string;
    ownerId: string;
    members: TeamMember[];
}

export default function CompanyTeamPage() {
    const { authenticated, token } = useKeycloak();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTeam, setNewTeam] = useState({ name: '', description: '' });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authenticated && token) {
            fetchTeams();
        }
    }, [authenticated, token]);

    const fetchTeams = async () => {
        try {
            const resp = await api.get('/user/teams');
            if (resp.status === 200) {
                setTeams(resp.data);
            }
        } catch (err) {
            console.error('Failed to fetch teams', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const resp = await api.post('/user/teams', newTeam);
            if (resp.status === 201 || resp.status === 200) {
                setShowCreateModal(false);
                setNewTeam({ name: '', description: '' });
                fetchTeams();
            } else {
                setError(resp.data.message || 'Failed to create organization');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">Company Organizations</h1>
                    <p className="text-slate-400 mt-2">Manage your company's departments, teams, and collaborative workflows.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                >
                    <Plus className="w-4 h-4" />
                    New Organization
                </button>
            </div>

            {teams.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center"
                >
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Building2 className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-200">No Organizations Yet</h2>
                    <p className="text-slate-400 mt-2 max-w-sm mx-auto">
                        Create an organization to invite your colleagues and manage jobs, contracts, and billing together.
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-8 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                        Create your first organization &rarr;
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team, idx) => (
                        <motion.div
                            key={team.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
                                    {team.logoUrl ? (
                                        <img src={getPublicUrl(team.logoUrl)} alt={team.name} className="w-full h-full object-cover rounded-2xl" />
                                    ) : (
                                        <Building2 className="w-6 h-6 text-slate-400" />
                                    )}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200">
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-100">{team.name}</h3>
                            <p className="text-sm text-slate-400 line-clamp-2 mt-1">{team.description}</p>

                            <div className="mt-6 pt-6 border-t border-slate-800">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Members</span>
                                    <span className="text-xs text-indigo-400">{team.members.length} member(s)</span>
                                </div>
                                <div className="flex -space-x-2">
                                    {team.members.slice(0, 5).map((m) => (
                                        <div
                                            key={m.id}
                                            className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-slate-300"
                                            title={`${m.user.firstName} ${m.user.lastName}`}
                                        >
                                            {m.user.avatarUrl ? (
                                                <img src={getPublicUrl(m.user.avatarUrl)} alt={m.user.firstName} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                `${m.user.firstName[0]}${m.user.lastName[0]}`
                                            )}
                                        </div>
                                    ))}
                                    {team.members.length > 5 && (
                                        <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                                            +{team.members.length - 5}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-3">
                                <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-xl text-sm font-medium transition-colors">
                                    Manage Team
                                </button>
                                <button className="flex-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 py-2 rounded-xl text-sm font-medium transition-colors border border-indigo-500/20">
                                    Dashboard
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: ShieldCheck, label: 'Security', value: 'Enterprise', color: 'text-emerald-400' },
                    { icon: LayoutDashboard, label: 'Centralized Billing', value: 'Enabled', color: 'text-indigo-400' },
                    { icon: Users, label: 'Total Members', value: teams.reduce((acc, t) => acc + t.members.length, 0), color: 'text-purple-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 flex items-center gap-4">
                        <div className={`p-2 rounded-xl bg-slate-800 ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">{stat.label}</p>
                            <p className="text-sm font-bold text-slate-200">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-100">Create New Organization</h2>
                                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTeam} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Organization Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newTeam.name}
                                        onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                        placeholder="e.g. Acme Corp - Marketing"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                                    <textarea
                                        rows={4}
                                        value={newTeam.description}
                                        onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
                                        placeholder="Describe the purpose of this team..."
                                    />
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    Confirm & Create Organization
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
