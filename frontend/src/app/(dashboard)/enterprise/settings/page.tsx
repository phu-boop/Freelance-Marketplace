'use client';

import React, { useState, useEffect } from 'react';
import {
    Settings,
    Shield,
    Globe,
    Save,
    Loader2
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function TeamSettingsPage() {
    const [team, setTeam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [ssoConfig, setSsoConfig] = useState<{ domain: string, isEnabled: boolean } | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const userRes = await api.get('/users/profile');
                const teamId = userRes.data.ownedTeams?.[0]?.id;

                if (teamId) {
                    const [teamRes, ssoRes] = await Promise.all([
                        api.get(`/teams/${teamId}`),
                        api.get(`/teams/${teamId}/sso`).catch(() => ({ data: null }))
                    ]);
                    setTeam(teamRes.data);
                    setSsoConfig(ssoRes.data);
                }
            } catch (error) {
                console.error('Failed to fetch settings', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSaveSSO = async () => {
        if (!team) return;
        setSaving(true);
        try {
            await api.post(`/teams/${team.id}/sso`, {
                domain: ssoConfig?.domain
            });
            toast.success("SSO Configuration Saved", {
                description: "Your team's single sign-on settings have been updated.",
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to save settings", {
                description: "Please check your inputs and try again.",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-slate-400 font-medium">Loading settings...</p>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl max-w-2xl mx-auto mt-20">
                <h2 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h2>
                <p className="text-slate-300">You must be a Team Owner to view these settings.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-8">
                <div className="p-4 bg-slate-800 rounded-2xl">
                    <Settings className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Organization Settings</h1>
                    <p className="text-slate-400">Manage your enterprise configuration and security policies.</p>
                </div>
            </div>

            {/* SSO Settings */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Globe className="w-6 h-6 text-blue-400" />
                        <CardTitle>Single Sign-On (SSO)</CardTitle>
                    </div>
                    <CardDescription>
                        Configure SAML/OIDC authentication for your team members.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="domain" className="text-slate-300">Email Domain</Label>
                        <div className="flex gap-4">
                            <Input
                                id="domain"
                                placeholder="e.g. acme-corp.com"
                                className="bg-slate-950 border-slate-700 text-white"
                                value={ssoConfig?.domain || ''}
                                onChange={(e) => setSsoConfig(prev => ({ ...prev!, domain: e.target.value }))}
                            />
                            <Button
                                onClick={handleSaveSSO}
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Config
                            </Button>
                        </div>
                        <p className="text-xs text-slate-500">
                            Users with email addresses matching this domain will be redirected to your IDP.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Approval Policies */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-emerald-400" />
                        <CardTitle>Financial Controls</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="space-y-1">
                            <h4 className="font-bold text-white">Require Approval for Hiring</h4>
                            <p className="text-sm text-slate-400">Admins must approve contracts over $5,000</p>
                        </div>
                        <Switch checked={true} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="space-y-1">
                            <h4 className="font-bold text-white">Department Budgets</h4>
                            <p className="text-sm text-slate-400">Prevent spending when budget is exceeded</p>
                        </div>
                        <Switch checked={false} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
