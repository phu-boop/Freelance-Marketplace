'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Settings, Percent, DollarSign, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';

interface Config {
    key: string;
    value: string;
}

export default function AdminSettingsPage() {
    const [configs, setConfigs] = useState<Config[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchConfigs = async () => {
            try {
                const res = await api.get('/admins/configs');
                setConfigs(res.data);
            } catch (error) {
                console.error('Failed to fetch configs', error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfigs();
    }, []);

    const handleSave = async (key: string, value: string) => {
        setSaving(true);
        try {
            await api.post('/admins/configs', { key, value });
            setMessage({ type: 'success', text: `Config ${key} saved successfully!` });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Failed to save config', error);
            setMessage({ type: 'error', text: 'Failed to save configuration.' });
        } finally {
            setSaving(false);
        }
    };

    const updateConfigLocal = (key: string, value: string) => {
        setConfigs(prev => prev.map(c => c.key === key ? { ...c, value } : c));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    const configItems = [
        {
            key: 'PLATFORM_FEE_PERCENT',
            label: 'Platform Fee (%)',
            description: 'Percentage taken from freelancer earnings per milestone.',
            icon: Percent,
            type: 'number'
        },
        {
            key: 'MINIMUM_WITHDRAWAL',
            label: 'Minimum Withdrawal ($)',
            description: 'Minimum amount a user can withdraw from their wallet.',
            icon: DollarSign,
            type: 'number'
        },
        {
            key: 'KYC_REQUIRED',
            label: 'KYC Required',
            description: 'Whether users must complete KYC before withdrawing funds.',
            icon: ShieldCheck,
            type: 'boolean'
        }
    ];

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">System Settings</h1>
                <p className="text-slate-400">Configure global platform parameters and fees.</p>
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}
                >
                    {message.text}
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {configItems.map((item) => {
                    const config = configs.find(c => c.key === item.key) || { key: item.key, value: '' };
                    return (
                        <div key={item.key} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{item.label}</h3>
                                    <p className="text-sm text-slate-500">{item.description}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {item.type === 'boolean' ? (
                                    <select
                                        value={config.value}
                                        onChange={(e) => updateConfigLocal(item.key, e.target.value)}
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                        <option value="true">Enabled</option>
                                        <option value="false">Disabled</option>
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={config.value}
                                        onChange={(e) => updateConfigLocal(item.key, e.target.value)}
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="Enter value..."
                                    />
                                )}
                                <button
                                    onClick={() => handleSave(item.key, config.value)}
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-bold transition-all flex items-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-6">
                <div className="flex items-center gap-3">
                    <Settings className="w-6 h-6 text-slate-400" />
                    <h2 className="text-xl font-bold text-white">Advanced Controls</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold transition-all text-left">
                        Clear System Cache
                    </button>
                    <button className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold transition-all text-left">
                        Rebuild Search Index
                    </button>
                    <button className="p-4 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-500 text-sm font-bold transition-all text-left border border-red-500/20">
                        Maintenance Mode
                    </button>
                </div>
            </div>
        </div>
    );
}
