'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    Lock,
    Smartphone,
    Monitor,
    Clock,
    MapPin,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Trash2,
    ShieldCheck,
    Globe,
    LogOut
} from 'lucide-react';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';

interface SecurityDevice {
    id: string;
    deviceId: string;
    deviceName: string;
    browser: string;
    os: string;
    lastIp: string;
    lastUsedAt: string;
    isTrusted: boolean;
}

interface LoginHistory {
    id: string;
    ipAddress: string;
    userAgent: string;
    location: string;
    status: 'SUCCESS' | 'FAILED';
    device: string;
    createdAt: string;
}

export default function SecurityDashboard() {
    const { userId } = useKeycloak();
    const [devices, setDevices] = useState<SecurityDevice[]>([]);
    const [history, setHistory] = useState<LoginHistory[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSecurityContext = async () => {
        try {
            const res = await api.get('/api/users/me/security-context');
            setDevices(res.data.devices);
            setHistory(res.data.history);
        } catch (error) {
            console.error('Failed to fetch security context', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSecurityContext();
    }, []);

    const handleRevokeDevice = async (deviceId: string) => {
        if (!confirm('Are you sure you want to revoke access for this device?')) return;
        try {
            await api.delete(`/api/users/me/devices/${deviceId}`);
            setDevices(devices.filter(d => d.deviceId !== deviceId));
        } catch (error) {
            console.error('Failed to revoke device', error);
        }
    };

    const handleRevokeAll = async () => {
        if (!confirm('This will log you out of all other devices. Continue?')) return;
        try {
            const currentDeviceId = localStorage.getItem('deviceId') || 'current';
            await api.delete('/api/users/me/devices', { data: { currentDeviceId } });
            fetchSecurityContext();
        } catch (error) {
            console.error('Failed to revoke all devices', error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12">
            {/* Hero Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        Security & Privacy
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Manage your account security and data portability</p>
                </div>
                <button
                    onClick={handleRevokeAll}
                    className="px-6 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    Revoke All Sessions
                </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recognized Devices */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <Lock className="w-5 h-5 text-blue-500" />
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Active Devices</h2>
                    </div>

                    <div className="space-y-4">
                        {devices.map((device) => (
                            <motion.div
                                key={device.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 bg-slate-900 border border-slate-800 rounded-[2rem] flex items-center justify-between group hover:border-blue-500/30 transition-all"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-slate-950 rounded-2xl text-slate-500 group-hover:text-blue-500 transition-colors">
                                        {device.os?.toLowerCase().includes('ios') || device.os?.toLowerCase().includes('android')
                                            ? <Smartphone className="w-6 h-6" />
                                            : <Monitor className="w-6 h-6" />
                                        }
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black uppercase tracking-tight text-lg">
                                            {device.browser} on {device.os}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-1 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {device.lastIp}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(device.lastUsedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRevokeDevice(device.deviceId)}
                                    className="p-3 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-xl transition-all"
                                    title="Revoke Access"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Login History */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <Clock className="w-5 h-5 text-amber-500" />
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Login History</h2>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-950/50">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Device / IP</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {history.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.status === 'SUCCESS' ? (
                                                <div className="flex items-center gap-2 text-green-500 font-black text-[10px] uppercase tracking-widest">
                                                    <CheckCircle2 className="w-3 h-3" /> Success
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest">
                                                    <AlertTriangle className="w-3 h-3" /> Failed
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-white font-bold text-sm">{item.device}</p>
                                            <p className="text-slate-500 text-[10px] font-medium">{item.ipAddress}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-white font-bold text-sm">{new Date(item.createdAt).toLocaleTimeString()}</p>
                                            <p className="text-slate-500 text-[10px] font-medium uppercase">{new Date(item.createdAt).toLocaleDateString()}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Privacy Tools */}
            <div className="pt-12 border-t border-slate-800">
                <div className="flex items-center gap-3 px-2 mb-8">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Data & Privacy Tools</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-8 bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem] flex items-start gap-6">
                        <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 text-white">
                            <Monitor className="w-6 h-6" />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Export Your Data</h3>
                                <p className="text-slate-400 font-medium text-sm mt-1 leading-relaxed">
                                    Download a copy of all your profile information, activity, and settings in human-readable JSON format.
                                </p>
                            </div>
                            <button
                                onClick={async () => {
                                    const res = await api.post('/api/users/me/export-data');
                                    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `my-data-${new Date().toISOString().split('T')[0]}.json`;
                                    a.click();
                                }}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4 rotate-90" />
                                Start Export
                            </button>
                        </div>
                    </div>

                    <div className="p-8 bg-red-600/5 border border-red-500/20 rounded-[2.5rem] flex items-start gap-6">
                        <div className="p-4 bg-red-600 rounded-2xl shadow-lg shadow-red-600/20 text-white">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Delete Account</h3>
                                <p className="text-slate-400 font-medium text-sm mt-1 leading-relaxed">
                                    Permanently delete your account and all associated data. This action is irreversible.
                                </p>
                            </div>
                            <button
                                onClick={async () => {
                                    if (confirm('CRITICAL: This will permanently delete your entire profile and all history. Are you absolutely certain?')) {
                                        await api.delete('/api/users/me/delete-account');
                                        window.location.href = '/';
                                    }
                                }}
                                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Delete Forever
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
