'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    CheckCircle2,
    AlertCircle,
    RefreshCcw,
    Server,
    Database,
    Zap,
    Flame,
    Clock,
    ShieldCheck,
    Globe
} from 'lucide-react';
import api from '@/lib/api';

interface ServiceStatus {
    status: 'up' | 'down' | 'loading';
    responseTime?: number;
    details?: any;
}

interface ServicesState {
    [key: string]: ServiceStatus;
}

const SERVICES_LIST = [
    { id: 'user-service', name: 'User Service', icon: <Server className="w-5 h-5" /> },
    { id: 'job-service', name: 'Job Service', icon: <Server className="w-5 h-5" /> },
    { id: 'proposal-service', name: 'Proposal Service', icon: <Server className="w-5 h-5" /> },
    { id: 'payment-service', name: 'Payment Service', icon: <Zap className="w-5 h-5" /> },
    { id: 'contract-service', name: 'Contract Service', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'notification-service', name: 'Notification Service', icon: <Globe className="w-5 h-5" /> },
    { id: 'search-service', name: 'Search Service', icon: <Server className="w-5 h-5" /> },
    { id: 'analytics-service', name: 'Analytics Service', icon: <Activity className="w-5 h-5" /> },
    { id: 'audit-service', name: 'Audit Service', icon: <Database className="w-5 h-5" /> },
    { id: 'database', name: 'PostgreSQL Core', icon: <Database className="w-5 h-5" /> },
];

export default function ReliabilityDashboard() {
    const [services, setServices] = useState<ServicesState>(
        SERVICES_LIST.reduce((acc, s) => ({ ...acc, [s.id]: { status: 'loading' } }), {})
    );
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [refreshing, setRefreshing] = useState(false);

    const fetchHealth = async () => {
        setRefreshing(true);
        try {
            // Using admin-service health endpoint which aggregates others
            const res = await api.get('http://localhost:3009/health');
            const data = res.data;

            const newState: ServicesState = {};
            SERVICES_LIST.forEach(s => {
                const serviceInfo = data.info?.[s.id] || data.error?.[s.id];
                newState[s.id] = {
                    status: serviceInfo?.status === 'up' ? 'up' : 'down',
                    details: serviceInfo
                };
            });

            // Database check is special in Terminus output
            if (data.info?.database || data.error?.database) {
                newState['database'] = {
                    status: (data.info?.database?.status || data.error?.database?.status) === 'up' ? 'up' : 'down'
                };
            }

            setServices(newState);
            setLastUpdated(new Date());
        } catch (error: any) {
            console.error('Health check failed', error);
            // If the whole health check fails, mark all as down or keep loading
            const errorState: ServicesState = {};
            SERVICES_LIST.forEach(s => errorState[s.id] = { status: 'down' });
            setServices(errorState);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 30000); // 30s auto-refresh
        return () => clearInterval(interval);
    }, []);

    const [chaos, setChaos] = useState({ latencyEnabled: false, errorRate: 0 });

    const toggleChaos = async (key: string, value: string) => {
        try {
            await api.post('http://localhost:3009/api/admins/configs', { key, value });
            // Refresh config state
            if (key === 'CHAOS_LATENCY_ENABLED') setChaos(prev => ({ ...prev, latencyEnabled: value === 'true' }));
            if (key === 'CHAOS_ERROR_RATE') setChaos(prev => ({ ...prev, errorRate: Number(value) }));
        } catch (error) {
            console.error('Failed to update chaos config', error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-10 bg-slate-950 min-h-screen text-slate-200">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tight">
                        <Activity className="w-10 h-10 text-emerald-500 animate-pulse" />
                        Platform Reliability
                    </h1>
                    <p className="text-slate-400 font-medium">Monitoring the health and resilience of our 19+ microservices ecosystem.</p>
                </div>

                <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
                    <div className="px-4 text-xs font-mono text-slate-500">
                        Last scan: {lastUpdated.toLocaleTimeString()}
                    </div>
                    <button
                        onClick={fetchHealth}
                        disabled={refreshing}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                        <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Scanning...' : 'System Scan'}
                    </button>
                </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {SERVICES_LIST.map((service, idx) => (
                    <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-6 rounded-3xl border transition-all duration-300 group relative overflow-hidden ${services[service.id]?.status === 'up'
                            ? 'bg-slate-900/40 border-slate-800 hover:border-emerald-500/30'
                            : services[service.id]?.status === 'down'
                                ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                                : 'bg-slate-900/20 border-slate-800 animate-pulse'
                            }`}
                    >
                        {/* Background Glow */}
                        <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-10 transition-all duration-500 group-hover:opacity-20 ${services[service.id]?.status === 'up' ? 'bg-emerald-500' : 'bg-red-500'
                            }`} />

                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-2xl ${services[service.id]?.status === 'up'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : services[service.id]?.status === 'down'
                                    ? 'bg-red-500/10 text-red-500'
                                    : 'bg-slate-800 text-slate-600'
                                }`}>
                                {service.icon}
                            </div>
                            {services[service.id]?.status === 'up' ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : services[service.id]?.status === 'down' ? (
                                <AlertCircle className="w-5 h-5 text-red-500" />
                            ) : null}
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-white mb-1 tracking-tight">{service.name}</h3>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${services[service.id]?.status === 'up' ? 'bg-emerald-500' : 'bg-red-500'
                                    }`} />
                                <span className={`text-xs font-black uppercase tracking-widest ${services[service.id]?.status === 'up' ? 'text-emerald-500' : 'text-red-500'
                                    }`}>
                                    {services[service.id]?.status === 'up' ? 'Operational' : 'Degraded'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-800/50 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <span>Status: {services[service.id]?.status}</span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                99.9% SLI
                            </span>
                        </div>
                    </motion.div>
                ))}
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-10">
                {/* Latency Heatmap Placeholder */}
                <div className="lg:col-span-2 p-8 rounded-[2rem] bg-slate-900/40 border border-slate-800 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black text-white flex items-center gap-3">
                            <Zap className="w-6 h-6 text-amber-500" />
                            Latency Heatmap
                        </h2>
                        <span className="text-xs font-mono text-slate-500">Live Tracing Active</span>
                    </div>
                    <div className="h-64 bg-slate-950/50 rounded-2xl border border-slate-800/50 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="text-center space-y-2 relative z-10">
                            <Clock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Awaiting Trace Data</p>
                            <p className="text-slate-600 text-[10px]">Execute cross-service requests to populate heatmap.</p>
                        </div>
                    </div>
                </div>

                {/* Chaos Resilience Lab */}
                <div className="p-8 rounded-[2rem] bg-orange-500/5 border border-orange-500/10 space-y-6">
                    <h2 className="text-xl font-black text-white flex items-center gap-3">
                        <Flame className="w-6 h-6 text-orange-500" />
                        Chaos Lab
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Controlled failure injection experiments to verify system resilience.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => toggleChaos('CHAOS_LATENCY_ENABLED', chaos.latencyEnabled ? 'false' : 'true')}
                            className={`w-full p-4 rounded-2xl bg-slate-900 border transition-all flex items-center gap-3 group ${chaos.latencyEnabled ? 'border-orange-500 animate-pulse' : 'border-slate-800 hover:border-orange-500/30'}`}
                        >
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-orange-500 transition-colors">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-bold text-white">{chaos.latencyEnabled ? 'Stop Latency' : 'Inject Latency'}</div>
                                <div className="text-[10px] text-slate-600">Simulate 2s network lag</div>
                            </div>
                        </button>
                        <button
                            onClick={() => toggleChaos('CHAOS_ERROR_RATE', chaos.errorRate > 0 ? '0' : '0.1')}
                            className={`w-full p-4 rounded-2xl bg-slate-900 border transition-all flex items-center gap-3 group ${chaos.errorRate > 0 ? 'border-orange-500 animate-pulse' : 'border-slate-800 hover:border-orange-500/30'}`}
                        >
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-orange-500 transition-colors">
                                <Flame className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-bold text-white">{chaos.errorRate > 0 ? 'Stop Errors' : 'Service Timeout'}</div>
                                <div className="text-[10px] text-slate-600">Force error response (10%)</div>
                            </div>
                        </button>
                    </div>
                    <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Danger Zone
                        </p>
                        <p className="text-[9px] text-orange-500/70 mt-1 italic">Experiments apply to the entire DEV environment.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
