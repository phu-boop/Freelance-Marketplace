'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cloud,
    Check,
    X,
    Users,
    ShieldCheck,
    Clock,
    Loader2,
    Building2,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';
import { Button } from '@/components/ui/button';

interface CloudInvitation {
    id: string;
    cloudId: string;
    cloud: {
        name: string;
        description: string;
    };
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    createdAt: string;
}

interface CloudMembership {
    id: string;
    cloudId: string;
    cloud: {
        name: string;
        description: string;
    };
    role: string;
    status: string;
}

export default function FreelancerCloudsPage() {
    const { userId, authenticated } = useKeycloak();
    const [invitations, setInvitations] = useState<CloudInvitation[]>([]);
    const [memberships, setMemberships] = useState<CloudMembership[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (authenticated && userId) {
            fetchData();
        }
    }, [authenticated, userId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [invRes, memRes] = await Promise.all([
                api.get('/clouds/invitations/my'),
                api.get(`/clouds/user/${userId}`)
            ]);
            setInvitations(invRes.data || []);
            setMemberships(memRes.data || []);
        } catch (error) {
            console.error('Failed to fetch cloud data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (invitationId: string, accept: boolean) => {
        setActionLoading(invitationId);
        try {
            await api.post(`/clouds/invitations/${invitationId}/respond`, { accept });
            fetchData();
        } catch (error) {
            console.error('Failed to respond to invitation', error);
            alert('Failed to process response.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-bold text-white">Talent Clouds</h1>
                <p className="text-slate-400 mt-1">Manage your enterprise cloud memberships and invitations.</p>
            </div>

            {/* Invitations Section */}
            {invitations.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-500" />
                        Pending Invitations
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {invitations.map((inv) => (
                            <motion.div
                                key={inv.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between hover:border-yellow-500/30 transition-all"
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
                                            <Cloud className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{inv.cloud.name}</h3>
                                            <p className="text-xs text-slate-500">Invited on {new Date(inv.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-400 line-clamp-2 mb-6">
                                        {inv.cloud.description}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => handleRespond(inv.id, true)}
                                        disabled={actionLoading === inv.id}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                                    >
                                        {actionLoading === inv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Accept'}
                                    </Button>
                                    <Button
                                        onClick={() => handleRespond(inv.id, false)}
                                        disabled={actionLoading === inv.id}
                                        variant="outline"
                                        className="flex-1 border-slate-800 text-slate-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
                                    >
                                        Decline
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* My Clouds Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                    My Cloud Memberships
                </h2>
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : memberships.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {memberships.map((mem) => (
                            <motion.div
                                key={mem.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-blue-500/30 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                                        Active
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                    {mem.cloud.name}
                                </h3>
                                <p className="text-sm text-slate-400 line-clamp-2 mb-6">
                                    {mem.cloud.description}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                                        <Users className="w-4 h-4" />
                                        <span>Enterprise Network</span>
                                    </div>
                                    <Button variant="ghost" className="text-blue-500 hover:text-blue-400 p-0 h-auto font-medium text-xs flex items-center gap-1">
                                        View Cloud <ExternalLink className="w-3 h-3" />
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
                        <h3 className="text-xl font-bold text-white mb-2">No Cloud Memberships</h3>
                        <p className="text-slate-400 max-w-xs mx-auto text-sm">
                            Cloud memberships are private and by invitation only. Enterprise clients can invite you to their clouds to give you priority access to their projects.
                        </p>
                    </div>
                )}
            </section>

            {/* Info Box */}
            <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex gap-4">
                <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-blue-400 mb-1">About Talent Clouds</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Talent Clouds allow large organizations to build their own curated networks of trusted freelancers. Being a member gives you early access to high-budget enterprise jobs and direct communication channels with key project managers.
                    </p>
                </div>
            </div>
        </div>
    );
}
