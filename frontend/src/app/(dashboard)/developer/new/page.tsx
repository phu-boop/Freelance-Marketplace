"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function NewAppPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [redirectUris, setRedirectUris] = useState(['']);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddUri = () => setRedirectUris([...redirectUris, '']);
    const handleRemoveUri = (index: number) => {
        const newUris = [...redirectUris];
        newUris.splice(index, 1);
        setRedirectUris(newUris);
    };
    const handleUriChange = (index: number, value: string) => {
        const newUris = [...redirectUris];
        newUris[index] = value;
        setRedirectUris(newUris);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            console.log('Creating app:', { name, redirectUris });
            setIsSubmitting(false);
            router.push('/developer');
        }, 1500);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Button variant="ghost" asChild className="pl-0 hover:bg-transparent">
                <Link href="/developer">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Applications
                </Link>
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Register New Application</CardTitle>
                    <CardDescription>
                        Register your application to obtain credentials for the Marketplace API.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Application Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. My Integration"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Redirect URIs</Label>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddUri}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add URI
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Allowed callback URLs for OAuth2 flow.
                            </p>
                            {redirectUris.map((uri, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        placeholder="https://myapp.com/callback"
                                        value={uri}
                                        onChange={(e) => handleUriChange(index, e.target.value)}
                                        required
                                    />
                                    {redirectUris.length > 1 && (
                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveUri(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-3 border-t bg-muted/20 pt-6">
                        <Button variant="ghost" type="button" onClick={() => router.push('/developer')}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Registering...' : 'Register Application'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
