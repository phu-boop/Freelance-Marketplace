'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useKeycloak } from '@/components/KeycloakProvider';
import { redirect } from 'next/navigation';
import { NotificationBell } from '@/components/NotificationBell';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { authenticated } = useKeycloak();

    // Simple client-side protection
    // In a real app, you'd handle this with middleware or a more robust solution
    React.useEffect(() => {
        if (!authenticated) {
            // redirect('/'); // Commented out for now to allow development without constant login
        }
    }, [authenticated]);

    return (
        <div className="flex min-h-screen bg-slate-950">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Welcome back!</h2>
                    <div className="flex items-center gap-6">
                        <NotificationBell />
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600" />
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
