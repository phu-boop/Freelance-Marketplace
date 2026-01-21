'use client';

import React from 'react';
import { ClientSidebar } from '@/components/ClientSidebar';
import { NotificationBell } from '@/components/NotificationBell';
import Link from 'next/link';
import { PlusCircle, Search as SearchIcon } from 'lucide-react';
import { UniversalSearch } from '@/components/UniversalSearch';
import { UserMenu } from '@/components/UserMenu';
import { useCurrency } from '@/components/CurrencyProvider';
import { AccessDenied } from '@/components/AccessDenied';
import { useKeycloak } from '@/components/KeycloakProvider';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { currency, setCurrency } = useCurrency();
    const { authenticated, roles } = useKeycloak();

    const isClient = roles.includes('CLIENT');

    if (authenticated && !isClient) {
        return <AccessDenied requiredRole="CLIENT" />;
    }

    return (
        <div className="flex min-h-screen bg-slate-950">
            <ClientSidebar />
            <main className="flex-1 overflow-y-auto">
                <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between gap-8">
                    <div className="flex items-center gap-8 flex-1">
                        <Link href="/client/dashboard" className="text-lg font-bold text-white whitespace-nowrap hidden lg:block">Client Portal</Link>

                        <div className="hidden xl:flex items-center gap-4">
                            <Link
                                href="/marketplace/create"
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold hover:bg-indigo-600/20 transition-all"
                            >
                                <PlusCircle className="w-3.5 h-3.5" />
                                Post a Job
                            </Link>
                        </div>

                        <UniversalSearch placeholder="Search freelancers, proposals, or messages..." />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2">
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-bold text-indigo-400 focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="VND">VND (₫)</option>
                                <option value="BRL">BRL (R$)</option>
                            </select>
                        </div>
                        <NotificationBell />
                        <UserMenu />
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
