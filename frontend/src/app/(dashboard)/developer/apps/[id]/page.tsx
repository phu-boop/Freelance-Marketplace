"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Copy, Check, Shield, Globe, Bell } from 'lucide-react';
import Link from 'next/link';

export default function AppDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [copied, setCopied] = useState<string | null>(null);
    const [app, setApp] = useState<any>(null);

    useEffect(() => {
        // Simulate fetch
        setTimeout(() => {
            setApp({
                id,
                name: 'Billing Integration',
                clientId: 'mp-billing-123',
                clientSecret: 'shhh-secret-key-donot-share',
                redirectUris: ['https://billing.example.com/callback'],
                createdAt: new Date().toISOString(),
            });
        }, 500);
    }, [id]);

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    if (!app) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            <Button variant="ghost" asChild className="pl-0 hover:bg-transparent">
                <Link href="/developer">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Applications
                </Link>
            </Button>

            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold">{app.name}</h2>
                    <p className="text-muted-foreground">App ID: {app.id}</p>
                </div>
                <Button variant="destructive">Delete App</Button>
            </div>

            <Tabs defaultValue="credentials" className="w-full">
                <TabsList>
                    <TabsTrigger value="credentials" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Credentials
                    </TabsTrigger>
                    <TabsTrigger value="webhooks" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Webhooks
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="credentials" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>OAuth2 Credentials</CardTitle>
                            <CardDescription>
                                Use these credentials to authenticate with the Marketplace API.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Client ID</label>
                                <div className="flex gap-2">
                                    <div className="bg-muted px-4 py-2 rounded-md flex-1 font-mono text-sm leading-6">
                                        {app.clientId}
                                    </div>
                                    <Button variant="outline" onClick={() => copyToClipboard(app.clientId, 'id')}>
                                        {copied === 'id' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Client Secret</label>
                                <div className="flex gap-2">
                                    <div className="bg-muted px-4 py-2 rounded-md flex-1 font-mono text-sm leading-6">
                                        {app.clientSecret}
                                    </div>
                                    <Button variant="outline" onClick={() => copyToClipboard(app.clientSecret, 'secret')}>
                                        {copied === 'secret' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-xs text-destructive mt-1 font-medium">
                                    Warning: Never share your client secret. Keep it secure and rotate it if compromised.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="webhooks" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <div>
                                <CardTitle>Webhook Subscriptions</CardTitle>
                                <CardDescription>
                                    Configure URLs to receive real-time notifications about platform events.
                                </CardDescription>
                            </div>
                            <Button size="sm">Add Endpoint</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 border rounded-lg border-dashed">
                                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No webhooks configured for this app yet.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Settings</CardTitle>
                            <CardDescription>Update your application details and configuration.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Settings Form would go here */}
                            <p className="text-muted-foreground italic">Settings module coming soon...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
