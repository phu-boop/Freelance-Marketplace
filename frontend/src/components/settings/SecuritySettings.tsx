'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Eye, Trash2, Key, History, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function SecuritySettings() {
    const [twoFactor, setTwoFactor] = useState(false);
    const [encryptionActive, setEncryptionActive] = useState(true);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Shield className="w-6 h-6 text-blue-500" />
                    Security & Data Privacy
                </h3>
                <p className="text-slate-400 text-sm mt-1">Manage your encryption settings, session history, and data rights.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 2FA Card */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                            <Key className="w-4 h-4 text-blue-400" />
                            Two-Factor Authentication
                        </CardTitle>
                        <CardDescription className="text-xs">Add an extra layer of security to your account.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <Label htmlFor="2fa-toggle" className="text-sm text-slate-300">Enable 2FA (Authenticator App)</Label>
                        <Switch
                            id="2fa-toggle"
                            checked={twoFactor}
                            onCheckedChange={setTwoFactor}
                        />
                    </CardContent>
                </Card>

                {/* Data Encryption Card */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                            <Lock className="w-4 h-4 text-green-400" />
                            Field-Level Encryption
                        </CardTitle>
                        <CardDescription className="text-xs">Tax IDs and PII are encrypted with AES-256-GCM.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Encryption Status</span>
                        <div className="px-2 py-1 rounded bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                            Active
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Access Logs */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                        <History className="w-4 h-4 text-indigo-400" />
                        Account Access Logs
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">A detailed audit trail of your account activity for compliance.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[
                            { event: 'Profile Updated', service: 'user-service', time: '2 mins ago', status: 'VERIFIED' },
                            { event: 'KYC Document Upload', service: 'storage-service', time: '1 hour ago', status: 'SCANNED' },
                            { event: 'Login attempt', service: 'auth-service', time: '3 hours ago', status: 'SUCCESS' },
                        ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800/50">
                                <div>
                                    <p className="text-sm font-medium text-slate-200">{log.event}</p>
                                    <p className="text-[10px] text-slate-500">{log.service} • {log.time}</p>
                                </div>
                                <div className="text-[10px] font-bold text-blue-400 px-2 py-1 border border-blue-400/20 rounded">
                                    {log.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="pt-0">
                    <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-white ml-auto">
                        View Full Audit Trail
                    </Button>
                </CardFooter>
            </Card>

            {/* GDPR Rights */}
            <Card className="bg-red-950/10 border-red-900/50">
                <CardHeader>
                    <CardTitle className="text-sm font-bold text-red-500 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Danger Zone (Data Privacy Rights)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-xs text-slate-400">
                        In accordance with GDPR and Data Privacy laws, you have the right to be forgotten.
                        Deleting your data will purge all personal records, transaction history (once legal retention ends), and profiles.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button variant="outline" className="border-slate-800 text-xs font-bold w-full sm:w-auto">
                            Download My Data (JSON)
                        </Button>
                        <Button variant="destructive" className="bg-red-600 hover:bg-red-500 text-xs font-bold w-full sm:w-auto">
                            Request Data Deletion
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
