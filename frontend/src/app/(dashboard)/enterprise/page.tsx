'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    Users,
    CreditCard,
    Settings,
    Plus,
    Briefcase,
    ShieldCheck,
    BarChart3
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function EnterpriseDashboard() {
    const [team, setTeam] = useState<any>(null);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEnterpriseData = async () => {
            try {
                // Mock fetching the user's team. In real app, might fetch list and pick first or current.
                // Assuming we have an endpoint or we fetch via user profile -> ownedTeams
                const userRes = await api.get('/users/profile');
                const teamId = userRes.data.ownedTeams?.[0]?.id || userRes.data.teams?.[0]?.teamId;

                if (teamId) {
                    const [teamRes, deptsRes] = await Promise.all([
                        api.get(`/teams/${teamId}`),
                        api.get(`/teams/${teamId}/departments`)
                    ]);
                    setTeam(teamRes.data);
                    setDepartments(deptsRes.data);
                }
            } catch (error) {
                console.error('Failed to fetch enterprise data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEnterpriseData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8 max-w-7xl mx-auto p-8">
                <Skeleton className="h-48 w-full rounded-3xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-700">
                    <Building2 className="w-10 h-10 text-slate-400" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-white">No Organization Found</h2>
                    <p className="text-slate-400 max-w-md">You are not currently part of an Enterprise Team. Create one to unlock advanced management features.</p>
                </div>
                <Button className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold">
                    Create Organization
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                        {team.logoUrl ? (
                            <img src={team.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                            <Building2 className="w-10 h-10 text-blue-400" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">{team.name}</h1>
                        <p className="text-slate-400 text-lg flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            Enterprise Plan
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button asChild variant="outline" className="h-12 rounded-xl border-slate-700 hover:bg-slate-800">
                        <Link href="/enterprise/settings">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </Link>
                    </Button>
                    <Button className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20">
                        <Plus className="w-5 h-5 mr-2" />
                        Invite Member
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900 border-slate-800 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Spend</CardTitle>
                        <CreditCard className="w-4 h-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white">$124,500</div>
                        <p className="text-xs text-emerald-400 font-bold mt-1 flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" /> +12% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Team Members</CardTitle>
                        <Users className="w-4 h-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white">{team.members?.length || 0}</div>
                        <div className="flex items-center -space-x-2 mt-2">
                            {team.members?.slice(0, 5).map((m: any, i: number) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs text-white font-bold">
                                    {m.user?.firstName?.[0]}
                                </div>
                            ))}
                            {(team.members?.length > 5) && (
                                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs text-slate-400 font-bold">
                                    +{team.members.length - 5}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Active Departments</CardTitle>
                        <Briefcase className="w-4 h-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white">{departments.length}</div>
                        <p className="text-xs text-slate-500 font-bold mt-1">Across {team.members?.length || 1} employees</p>
                    </CardContent>
                </Card>
            </div>

            {/* Departments Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">Departments</h3>
                    <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                        Manage Budgets
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.length === 0 ? (
                        <div className="col-span-full p-12 text-center bg-slate-900/30 border border-slate-800 border-dashed rounded-3xl">
                            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">No departments configured yet.</p>
                            <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">Add Department</Button>
                        </div>
                    ) : (
                        departments.map((dept) => (
                            <motion.div
                                key={dept.id}
                                whileHover={{ y: -4 }}
                                className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 hover:border-slate-700 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{dept.name}</h4>
                                        <p className="text-xs text-slate-500 font-mono mt-1">{dept.code || 'NO-CODE'}</p>
                                    </div>
                                    <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 bg-emerald-500/10">Active</Badge>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Budget Used</span>
                                        <span className="text-white font-bold">{Math.min(100, Math.round((Number(dept.spent) / Number(dept.budget || 1)) * 100))}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full"
                                            style={{ width: `${Math.min(100, Math.round((Number(dept.spent) / Number(dept.budget || 1)) * 100))}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>${Number(dept.spent).toLocaleString()}</span>
                                        <span>of ${Number(dept.budget || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}

                    {/* Add Dept Card */}
                    <button className="p-6 bg-slate-900/30 border border-slate-800 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-500 hover:bg-slate-900/50 hover:border-slate-700 hover:text-blue-400 transition-all group">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-sm">Create Department</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
