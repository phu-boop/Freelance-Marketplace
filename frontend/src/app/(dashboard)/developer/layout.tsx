import React from 'react';

export default function DeveloperLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="container mx-auto py-8">
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Developer Portal</h1>
                    <p className="text-muted-foreground mt-2">
                        Build and manage your integrations with the Marketplace.
                    </p>
                </div>
                <div className="border-t pt-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
