'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Clock,
    PlusCircle,
    Database,
    Send,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Gavel,
    FileCode
} from 'lucide-react';

interface TimelineEvent {
    type: string;
    date: string;
    description: string;
    metadata?: any;
}

interface DisputeTimelineProps {
    events: TimelineEvent[];
}

const getEventIcon = (type: string) => {
    switch (type) {
        case 'CONTRACT_CREATED': return <PlusCircle className="w-4 h-4 text-blue-400" />;
        case 'MILESTONE_CREATED': return <Database className="w-4 h-4 text-slate-400" />;
        case 'MILESTONE_FUNDED': return <Database className="w-4 h-4 text-green-400" />;
        case 'WORK_SUBMITTED': return <Send className="w-4 h-4 text-blue-500" />;
        case 'WORK_APPROVED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
        case 'WORK_REJECTED': return <XCircle className="w-4 h-4 text-red-500" />;
        case 'DISPUTE_OPENED': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
        case 'EVIDENCE_ADDED': return <FileCode className="w-4 h-4 text-indigo-400" />;
        case 'ARBITRATION_OPENED': return <Gavel className="w-4 h-4 text-purple-400" />;
        case 'ARBITRATION_RESOLVED': return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
        default: return <Clock className="w-4 h-4 text-slate-500" />;
    }
};

export default function DisputeTimeline({ events }: DisputeTimelineProps) {
    return (
        <div className="space-y-6">
            <h4 className="text-sm font-bold text-slate-500 uppercase px-2 tracking-widest">Historical Context</h4>
            <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                {events.map((event, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative"
                    >
                        <div className="absolute -left-[25px] top-1 p-1 bg-slate-950 border border-slate-800 rounded-full z-10 shadow-xl">
                            {getEventIcon(event.type)}
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                {new Date(event.date).toLocaleString()}
                            </span>
                            <p className="text-sm font-bold text-white leading-tight">
                                {event.description}
                            </p>
                            {event.metadata && (
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {Object.entries(event.metadata).map(([key, value]) => (
                                        typeof value === 'string' && (
                                            <span key={key} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-500 border border-slate-700/50">
                                                {key}: {value.length > 20 ? value.slice(0, 20) + '...' : value}
                                            </span>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
                {events.length === 0 && (
                    <div className="py-4 text-slate-600 text-xs italic">
                        No events recorded for this contract.
                    </div>
                )}
            </div>
        </div>
    );
}
