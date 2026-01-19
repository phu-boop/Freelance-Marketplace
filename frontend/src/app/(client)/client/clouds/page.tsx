'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cloud,
    Plus,
    Users,
    Search,
    MoreVertical,
    Mail,
    Shield,
    TrendingUp,
    Building2,
    CheckCircle2,
    X,
    Loader2
} from 'lucide-react';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TalentCloud {
    id: string;
    name: string;
    description: string;
    visibility: 'PRIVATE' | 'PUBLIC';
    members: any[];
    ownerId: string;
    createdAt: string;
}

export default function TalentCloudsPage() {
    const { userId, authenticated } = useKeycloak();
    const [clouds, setClouds] = useState<TalentCloud[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCloud, setNewCloud] = useState({ name: '', description: '' });
    const [invitingCloudId, setInvitingCloudId] = useState<string | null>(null);
    const [inviteUserId, setInviteUserId] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (authenticated && userId) {
            fetchClouds();
        }
    }, [authenticated, userId]);

    const fetchClouds = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/clouds/user/${userId}`);
            setClouds(res.data);
        } catch (error) {
            console.error('Failed to fetch clouds', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCloud = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.post('/clouds', {
                ...newCloud,
                ownerId: userId,
                visibility: 'PRIVATE'
            });
            setIsCreateModalOpen(false);
            setNewCloud({ name: '', description: '' });
            fetchClouds();
        } catch (error) {
            console.error('Failed to create cloud', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleInvite = async () => {
        if (!invitingCloudId || !inviteUserId) return;
        setActionLoading(true);
        try {
            await api.post(`/clouds/${invitingCloudId}/invite`, {
                userId: inviteUserId
            });
            setInvitingCloudId(null);
            setInviteUserId('');
            fetchClouds();
            alert('Invitation sent!');
        } catch (error) {
            console.error('Failed to invite member', error);
            alert('Failed to send invitation. Make sure the User ID is correct.');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Talent Clouds</h1>
                    <p className="text-slate-400">Manage your private pools of vetted talent.</p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 h-12 rounded-xl flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Create New Cloud
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : clouds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {clouds.map((cloud) => (
                        <motion.div
                            key={cloud.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                                    <Cloud className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-700">
                                        {cloud.visibility}
                                    </span>
                                    <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                    {cloud.name}
                                </h3>
                                <p className="text-slate-400 text-sm line-clamp-2">
                                    {cloud.description || 'No description provided.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                                        <Users className="w-4 h-4" />
                                        <span className="text-xs font-medium">Members</span>
                                    </div>
                                    <p className="text-lg font-bold text-white">{cloud.members?.length || 0}</p>
                                </div>
                                <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                                        <Shield className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-medium">Vetted</span>
                                    </div>
                                    <p className="text-lg font-bold text-white">
                                        {cloud.members?.filter(m => m.status === 'ACTIVE').length || 0}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setInvitingCloudId(cloud.id)}
                                    variant="outline"
                                    className="flex-1 border-slate-800 hover:bg-slate-800 text-slate-300"
                                >
                                    Invite Talent
                                </Button>
                                <Button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white">
                                    View Members
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                        <Cloud className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Talent Clouds Yet</h3>
                    <p className="text-slate-400 mb-8 max-w-xs mx-auto">
                        Create private clouds to organize and prioritize your favorite freelancers for future projects.
                    </p>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8"
                    >
                        Create Your First Cloud
                    </Button>
                </div>
            )}

            {/* Create Cloud Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">New Talent Cloud</h2>
                                <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateCloud} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Cloud Name</label>
                                    <Input
                                        required
                                        placeholder="e.g. Senior Frontend Experts"
                                        value={newCloud.name}
                                        onChange={e => setNewCloud({ ...newCloud, name: e.target.value })}
                                        className="bg-slate-950 border-slate-800 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Description</label>
                                    <textarea
                                        rows={3}
                                        placeholder="What's the purpose of this cloud?"
                                        value={newCloud.description}
                                        onChange={e => setNewCloud({ ...newCloud, description: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-500 h-12 text-lg font-bold mt-2"
                                >
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Cloud'}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Invite Modal */}
            <AnimatePresence>
                {invitingCloudId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Invite Freelancer</h2>
                                <button onClick={() => setInvitingCloudId(null)} className="text-slate-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">User ID</label>
                                    <Input
                                        required
                                        placeholder="Enter the freelancer's unique ID"
                                        value={inviteUserId}
                                        onChange={e => setInviteUserId(e.target.value)}
                                        className="bg-slate-950 border-slate-800"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">
                                        For demo purposes, enter any valid User ID.
                                    </p>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setInvitingCloudId(null)}
                                        className="flex-1 border-slate-800 text-slate-400"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleInvite}
                                        disabled={actionLoading || !inviteUserId}
                                        className="flex-1 bg-blue-600 hover:bg-blue-500 lg"
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send Invite'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
