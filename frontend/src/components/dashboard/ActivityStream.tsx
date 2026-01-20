'use client';

import React from 'react';
import {
    CheckCircle2,
    Circle,
    DollarSign,
    FileText,
    MessageSquare,
    Plus,
    Star,
    ArrowUpRight,
    LucideIcon,
    Flag,
    ShieldCheck
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
    id: string;
    type: 'PROPOSAL' | 'PAYMENT' | 'CONTRACT' | 'MESSAGE' | 'REVIEW' | 'JOB' | 'MILESTONE' | 'ESCROW';
    title: string;
    description: string;
    timestamp: string;
    status?: 'SUCCESS' | 'PENDING' | 'ALERT';
}

const iconMap: Record<string, LucideIcon> = {
    PROPOSAL: FileText,
    PAYMENT: DollarSign,
    CONTRACT: CheckCircle2,
    MESSAGE: MessageSquare,
    REVIEW: Star,
    JOB: Plus,
    MILESTONE: Flag,
    ESCROW: ShieldCheck
};

const colorMap: Record<string, string> = {
    SUCCESS: 'text-green-500',
    PENDING: 'text-blue-500',
    ALERT: 'text-amber-500',
};

export function ActivityStream({ activities }: { activities: ActivityItem[] }) {
    if (activities.length === 0) {
        return (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl">
                <p className="text-slate-400 text-sm">No recent activity found.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Circle className="w-2 h-2 fill-blue-500 text-blue-500" />
                    Activity Stream
                </h3>
            </div>
            <div className="p-6 space-y-8 relative">
                {/* Timeline Line */}
                <div className="absolute left-9 top-8 bottom-8 w-px bg-slate-800" />

                {activities.map((activity, idx) => {
                    const Icon = iconMap[activity.type] || Circle;
                    return (
                        <div key={activity.id} className="relative flex gap-6 group">
                            <div className="relative z-10 w-6 h-6 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center group-hover:border-blue-500 transition-colors shrink-0">
                                <Icon className="w-3 h-3 text-slate-400 group-hover:text-blue-400" />
                            </div>
                            <div className="space-y-1 pb-2">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{activity.title}</h4>
                                    {activity.status && (
                                        <span className={`w-1.5 h-1.5 rounded-full ${colorMap[activity.status] || 'bg-slate-500 shadow-[0_0_8px_rgba(100,100,100,0.5)]'}`} />
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed max-w-md">{activity.description}</p>
                                <div className="flex items-center gap-3 pt-1">
                                    <span className="text-[10px] font-medium text-slate-500">
                                        {formatDistanceToNow(new Date(activity.timestamp))} ago
                                    </span>
                                    <button className="text-[10px] font-bold text-blue-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                        View Details <ArrowUpRight className="w-2.5 h-2.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
