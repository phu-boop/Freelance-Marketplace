'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Briefcase, CreditCard, Users, Clock, Building2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';

export default function ClientDashboardPage() {
    const { authenticated, token } = useKeycloak();
    const [teams, setTeams] = useState<any[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<any>(null); // null = Personal context
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="space-y-8">
            {/* Context Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400">
                        {selectedTeam ? `Managing organization: ${selectedTeam.name}` : 'Managing your personal account'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <button className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-slate-200 hover:border-slate-700 transition-all">
                            {selectedTeam ? (
                                <><Building2 className="w-4 h-4 text-indigo-400" /> {selectedTeam.name}</>
                            ) : (
                                <><Users className="w-4 h-4 text-emerald-400" /> Personal</>
                            )}
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                        </button>

                        <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 invisible group-hover:visible z-50 transition-all opacity-0 group-hover:opacity-100">
                            <button
                                onClick={() => setSelectedTeam(null)}
                                className={`w-full text-left px-4 py-2 hover:bg-slate-800 transition-colors flex items-center gap-3 ${!selectedTeam ? 'text-indigo-400' : 'text-slate-300'}`}
                            >
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-emerald-400" />
                                </div>
                                <span className="font-medium">Personal</span>
                            </button>

                            {teams.map(team => (
                                <button
                                    key={team.id}
                                    onClick={() => setSelectedTeam(team)}
                                    className={`w-full text-left px-4 py-2 hover:bg-slate-800 transition-colors flex items-center gap-3 ${selectedTeam?.id === team.id ? 'text-indigo-400' : 'text-slate-300'}`}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                        <Building2 className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <span className="font-medium truncate">{team.name}</span>
                                </button>
                            ))}

                            <div className="border-t border-slate-800 mt-2 pt-2">
                                <Link href="/settings/company">
                                    <button className="w-full text-left px-4 py-2 hover:bg-slate-800 transition-colors text-slate-500 text-sm flex items-center gap-2">
                                        <PlusCircle className="w-4 h-4" />
                                        Manage Organizations
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <Link href="/marketplace/create">
                        <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all">
                            <PlusCircle className="w-5 h-5" />
                            Post a Job
                        </button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Jobs', value: selectedTeam ? '2' : '1', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Total Spent', value: selectedTeam ? '$8,200' : '$4,250', icon: CreditCard, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Collaborators', value: selectedTeam ? selectedTeam.members.length.toString() : '0', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'Open Tasks', value: '12', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-6 rounded-3xl bg-slate-900 border border-slate-800"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                        <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Recent Jobs Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-white">Active Postings</h2>
                    <Link href="/client/jobs" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                        View All Posts &rarr;
                    </Link>
                </div>

                <div className="space-y-4">
                    {/* Placeholder for jobs list */}
                    <div className="text-center py-16 bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">
                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                            <Briefcase className="w-8 h-8 text-slate-700" />
                        </div>
                        <p className="text-slate-500 font-medium tracking-tight">
                            No active {selectedTeam ? 'team' : 'personal'} jobs at the moment.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
