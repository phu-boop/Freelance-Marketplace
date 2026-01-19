'use client';

import React from 'react';
import { ShieldCheck, Calendar, DollarSign, ArrowRight, ExternalLink, Clock } from 'lucide-react';
import Link from 'next/link';
import { HireModal } from '../HireModal';

interface ContractContextSidebarProps {
    contract: any;
    loading: boolean;
    participantId?: string;
    participantName?: string;
    showHireButton?: boolean;
}

export const ContractContextSidebar: React.FC<ContractContextSidebarProps> = ({
    contract,
    loading,
    participantId,
    participantName,
    showHireButton = false
}) => {
    if (loading) {
        return (
            <div className="w-80 border-l border-slate-800 bg-slate-950/20 p-4 animate-pulse">
                <div className="h-6 bg-slate-800 rounded w-1/2 mb-4" />
                <div className="h-32 bg-slate-800 rounded mb-4" />
                <div className="space-y-4">
                    <div className="h-10 bg-slate-800 rounded" />
                    <div className="h-10 bg-slate-800 rounded" />
                </div>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="w-80 border-l border-slate-800 bg-slate-950/20 p-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500 mb-4">
                    <ShieldCheck className="w-6 h-6 opacity-20" />
                </div>
                <h3 className="text-slate-400 font-medium mb-1">No Active Contract</h3>
                <p className="text-xs text-slate-500 mb-6">Start a contract with this freelancer to see project details here.</p>

                {showHireButton && participantId && (
                    <HireModal
                        freelancerId={participantId}
                        freelancerName={participantName || 'Freelancer'}
                    />
                )}
            </div>
        );
    }

    const activeMilestone = contract.milestones?.find((m: any) => m.status === 'ACTIVE' || m.status === 'PENDING' || m.status === 'IN_REVIEW');

    return (
        <div className="w-80 border-l border-slate-800 bg-slate-950/20 flex flex-col overflow-y-auto hidden lg:flex">
            <div className="p-4 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Project Context</h3>
            </div>

            <div className="p-4 space-y-6">
                {/* Contract Overview */}
                <div>
                    <Link
                        href={`/contracts/${contract.id}`}
                        className="group flex items-start justify-between mb-2"
                    >
                        <h4 className="text-white font-semibold group-hover:text-indigo-400 transition-colors line-clamp-2">
                            {contract.job?.title || 'Active Contract'}
                        </h4>
                        <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 transition-colors mt-1" />
                    </Link>
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest ${contract.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' :
                            contract.status === 'DISPUTED' ? 'bg-red-500/10 text-red-500' :
                                'bg-amber-500/10 text-amber-500'
                            }`}>
                            {contract.status}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">Fixed Price</span>
                    </div>

                    {contract.status === 'DISPUTED' && (
                        <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20">
                            <div className="text-[10px] text-red-500 uppercase font-bold mb-1 tracking-widest">Under Dispute</div>
                            <p className="text-[10px] text-red-400/80 leading-relaxed">
                                This contract is under investigation. Payments are frozen until arbitration is resolved.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Budget</div>
                            <div className="text-white font-bold flex items-center gap-0.5">
                                <DollarSign className="w-3 h-3 text-green-500" />
                                {contract.totalAmount}
                            </div>
                        </div>
                        <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Escrowed</div>
                            <div className="text-white font-bold flex items-center gap-0.5 text-green-400">
                                <ShieldCheck className="w-3 h-3" />
                                ${contract.milestones?.filter((m: any) => m.escrowStatus === 'FUNDED').reduce((acc: number, m: any) => acc + Number(m.amount), 0)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Milestone */}
                {activeMilestone && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                        <div className="text-[10px] text-indigo-400 uppercase font-bold mb-2 tracking-widest">Active Milestone</div>
                        <p className="text-sm text-white font-medium mb-3">{activeMilestone.description}</p>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                                    <DollarSign className="w-3 h-3" /> Amount
                                </span>
                                <span className="text-white font-bold">${activeMilestone.amount}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                                    <Calendar className="w-3 h-3" /> Due Date
                                </span>
                                <span className="text-white font-medium">
                                    {activeMilestone.dueDate ? new Date(activeMilestone.dueDate).toLocaleDateString() : 'No date'}
                                </span>
                            </div>
                        </div>

                        {activeMilestone.status === 'IN_REVIEW' ? (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
                                <Clock className="w-3 h-3 animate-pulse" />
                                Waiting for Approval
                            </div>
                        ) : activeMilestone.status === 'ACTIVE' ? (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
                                <ShieldCheck className="w-3 h-3" />
                                Milestone Funded
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-500/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest border border-slate-500/20">
                                <Clock className="w-3 h-3" />
                                Pending Activation
                            </div>
                        )}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="pt-4 border-t border-slate-800">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Quick Actions</h5>
                    <div className="space-y-2">
                        <Link
                            href={`/contracts/${contract.id}`}
                            className="w-full flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-all border border-transparent hover:border-white/10"
                        >
                            Submit Deliverable <ArrowRight className="w-3 h-3" />
                        </Link>
                        <Link
                            href={`/contracts/${contract.id}`}
                            className="w-full flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-all border border-transparent hover:border-white/10"
                        >
                            Request Extension <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
