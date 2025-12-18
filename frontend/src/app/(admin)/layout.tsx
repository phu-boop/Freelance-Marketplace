'use client';

import React from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useKeycloak } from '@/components/KeycloakProvider';
import { redirect } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { authenticated } = useKeycloak();

    // In a real app, you would also check for 'admin' role here
    React.useEffect(() => {
        if (!authenticated) {
            // redirect('/'); 
        }
    }, [authenticated]);

    return (
        <div className="flex min-h-screen bg-slate-950">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto">
                <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">System Administration</h2>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white">
                            AD
                        </div>
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
