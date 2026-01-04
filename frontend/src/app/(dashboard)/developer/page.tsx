"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Plus, Settings, Code, Zap } from 'lucide-react';

interface App {
    id: string;
    name: string;
    clientId: string;
    createdAt: string;
}

export default function DeveloperPage() {
    const [apps, setApps] = useState<App[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate fetch for now since backend is not running
        setTimeout(() => {
            setApps([
                { id: '1', name: 'Billing Integration', clientId: 'mp-billing-123', createdAt: new Date().toISOString() },
                { id: '2', name: 'Slack Notifications', clientId: 'mp-slack-456', createdAt: new Date().toISOString() },
            ]);
            setIsLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">My Applications</h2>
                <Button asChild>
                    <Link href="/developer/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New App
                    </Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="h-24 bg-muted/50" />
                            <CardContent className="h-32" />
                        </Card>
                    ))}
                </div>
            ) : apps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {apps.map((app) => (
                        <Card key={app.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Code className="h-6 w-6 text-primary" />
                                    </div>
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/developer/apps/${app.id}`}>
                                            <Settings className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                                <CardTitle className="mt-4">{app.name}</CardTitle>
                                <CardDescription>Created on {new Date(app.createdAt).toLocaleDateString()}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm space-y-1">
                                    <p className="text-muted-foreground">Client ID:</p>
                                    <code className="bg-muted px-2 py-1 rounded block truncate">{app.clientId}</code>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/developer/apps/${app.id}`}>
                                        Manage App
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                    <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                    <CardTitle>No applications found</CardTitle>
                    <CardDescription className="max-w-sm mt-2">
                        Register your first application to start using the Marketplace API.
                    </CardDescription>
                    <Button className="mt-6" asChild>
                        <Link href="/developer/new">Create Your First App</Link>
                    </Button>
                </Card>
            )}
        </div>
    );
}
