'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Cloud,
    Users,
    Briefcase,
    Settings,
    Shield,
    Globe,
    Calendar,
    Lock,
    Unlock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { InviteMemberModal } from './InviteMemberModal';

interface CloudLayoutProps {
    cloud: any;
    activeTab: 'overview' | 'jobs' | 'talent' | 'access';
    onTabChange: (tab: 'overview' | 'jobs' | 'talent' | 'access') => void;
    children: React.ReactNode;
}

export function CloudLayout({ cloud, activeTab, onTabChange, children }: CloudLayoutProps) {
    const [showInviteModal, setShowInviteModal] = React.useState(false);

    if (!cloud) return null;

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                        {cloud.logoUrl ? (
                            <img src={cloud.logoUrl} alt={cloud.name} className="w-full h-full object-cover rounded-[2rem]" />
                        ) : (
                            <Cloud className="w-10 h-10 text-white" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-white tracking-tight">{cloud.name}</h1>
                            {cloud.visibility === 'PRIVATE' ? (
                                <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-amber-500/20 flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Private Cloud
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-500/20 flex items-center gap-1">
                                    <Unlock className="w-3 h-3" /> Public Cloud
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
                            <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {cloud.costCenter || 'No Cost Center'}</span>
                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Created {format(new Date(cloud.createdAt), 'MMM yyyy')}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Settings
                    </button>
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="px-5 py-2.5 bg-indigo-600 shadow-xl shadow-indigo-500/20 text-white rounded-2xl text-sm font-bold hover:bg-indigo-500 transition-all flex items-center gap-2"
                    >
                        <Users className="w-4 h-4" /> Invite Talent
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto pb-2 gap-2 border-b border-slate-800/50">
                {[
                    { id: 'overview', icon: Shield, label: 'Overview' },
                    { id: 'jobs', icon: Briefcase, label: 'Exclusive Jobs' },
                    { id: 'talent', icon: Users, label: 'Vetted Talent' },
                    { id: 'access', icon: Lock, label: 'Access Control' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id as any)}
                        className={cn(
                            "px-6 py-3 rounded-t-2xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
                            activeTab === tab.id
                                ? "bg-slate-900 text-indigo-400 border-x border-t border-slate-800 relative z-10"
                                : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div layoutId="cloud-tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                        )}
                    </button>
                ))}
            </div>

            <div className="min-h-[400px]">
                {children}
            </div>

            <InviteMemberModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                cloudId={cloud.id}
                cloudName={cloud.name}
            />
        </div >
    );
}
