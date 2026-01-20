"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    BarChart3,
    Activity,
    AlertTriangle,
    Calendar,
    RefreshCw,
    ShieldAlert,
    ChevronRight,
    Info
} from "lucide-react"
import api from "@/lib/api"

interface AiOperationalInsightsProps {
    contractId: string;
}

export default function AiOperationalInsights({ contractId }: AiOperationalInsightsProps) {
    const [loading, setLoading] = useState(false);
    const [standup, setStandup] = useState<string | null>(null);
    const [alerts, setAlerts] = useState<any[]>([]);

    const fetchInsights = async () => {
        setLoading(true);
        try {
            // 1. Fetch Daily Standup (Simplified for MVP: fetching last X messages would happen here)
            // For now, we call the endpoint with empty messages or mock them
            const standupRes = await api.post(`/jobs/contracts/${contractId}/ai/standup`, {
                messages: ["Task A completed", "Working on Task B", "Need feedback on UI"]
            });
            setStandup(standupRes.data.summary);

            // 2. Fetch Submissions for Risk Alerts
            const contractRes = await api.get(`/contracts/${contractId}`);
            const submissions = contractRes.data.milestones?.flatMap((m: any) => m.submissions || []) || [];
            const riskAlerts = submissions
                .filter((s: any) => s.metadata?.riskLevel === 'HIGH' || s.metadata?.riskLevel === 'MEDIUM')
                .map((s: any) => ({
                    id: s.id,
                    level: s.metadata.riskLevel,
                    message: s.metadata.riskReport,
                    date: s.createdAt
                }));
            setAlerts(riskAlerts);
        } catch (err) {
            console.error("Failed to fetch insights", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, [contractId]);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Activity className="text-blue-400 w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Operational Intelligence</h3>
                </div>
                <button
                    onClick={fetchInsights}
                    className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors group"
                    title="Refresh Insights"
                >
                    <RefreshCw className={`w-4 h-4 text-slate-500 group-hover:text-blue-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="space-y-4">
                {/* Daily Standup Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                        <Calendar size={14} />
                        Daily Standup Summary
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Info size={40} />
                        </div>
                        {standup ? (
                            <div className="text-sm text-slate-300 leading-relaxed font-light whitespace-pre-wrap">
                                {standup}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 italic">
                                {loading ? "Generating update..." : "No recent activity to summarize."}
                            </div>
                        )}
                    </div>
                </div>

                {/* Risk Alerts Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                        <ShieldAlert size={14} />
                        Risk & Security Alerts
                    </div>
                    <div className="space-y-2">
                        {alerts.length > 0 ? (
                            alerts.map((alert, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={alert.id}
                                    className={`p-3 rounded-xl border flex gap-3 ${alert.level === 'HIGH'
                                            ? 'bg-red-500/5 border-red-500/20 text-red-400'
                                            : 'bg-amber-500/5 border-amber-500/20 text-amber-400'
                                        }`}
                                >
                                    <AlertTriangle size={18} className="shrink-0" />
                                    <div className="flex-1">
                                        <div className="text-xs font-bold uppercase mb-1">{alert.level} RISK DETECTED</div>
                                        <p className="text-xs leading-snug text-slate-300">{alert.message}</p>
                                        <div className="mt-2 text-[10px] opacity-60 font-mono">
                                            {new Date(alert.date).toLocaleString()}
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="opacity-40" />
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-8 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-600">
                                <ShieldAlert size={24} className="opacity-20 mb-2" />
                                <span className="text-xs">No active security or quality alerts</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <div className="p-3 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-3">
                    <div className="h-8 w-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        <BarChart3 className="text-indigo-400 w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-indigo-300 uppercase letter-spacing-1">Health Score</div>
                        <div className="text-sm font-bold text-white">94/100 - Strong Progress</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
