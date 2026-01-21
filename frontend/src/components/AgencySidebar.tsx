'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Wallet,
    Briefcase,
    FileText,
    MessageSquare,
    Settings,
    LogOut,
    ArrowLeft
} from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';
import { cn } from '@/lib/utils';

export function AgencySidebar() {
    const pathname = usePathname();
    const params = useParams();
    const { logout } = useKeycloak();

    // We assume the URL structure is /agency/[agencyId]/...
    // If we are on /agency root (list of agencies), we might not have ID yet, but this sidebar is for WHEN we are managing a specific agency.
    // If no agencyId, we fallback or show a generic "Select Agency" view?
    // Actually, usually we route /agency/[id] for the dashboard.
    const agencyId = params?.agencyId as string;

    const agencyMenuItems = [
        { icon: LayoutDashboard, label: 'Agency Overview', href: `/agency/${agencyId}` },
        { icon: Wallet, label: 'Financials', href: `/agency/${agencyId}/financials` },
        { icon: Users, label: 'My Team', href: `/agency/${agencyId}/team` }, // Future
        { icon: Briefcase, label: 'Find Work', href: '/marketplace' }, // Should this context switch to finding work?
        { icon: FileText, label: 'Proposals', href: '/proposals' }, // Agency proposals
        { icon: MessageSquare, label: 'Messages', href: '/messages' },
        { icon: Settings, label: 'Settings', href: `/agency/${agencyId}/settings` },
    ];

    if (!agencyId) {
        // Fallback if we are just at /agency list, actually we might use Freelancer sidebar there or a simple list.
        // For now, let's assume this component is used when we are "In Agency Mode".
        // But if we are in `/agency` (the list), we might want to return something else or handle it.
        // Let's safe guard.
        return null;
    }

    return (
        <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen sticky top-0">
            <div className="p-6">
                <Link href="/agency" className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500 hover:text-white transition-colors">
                    <ArrowLeft className="w-3 h-3" />
                    Back to Agencies
                </Link>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">Agency Portal</span>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {agencyMenuItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== `/agency/${agencyId}` && pathname.startsWith(item.href));
                    // Strict check for dashboard home to avoid highlighting on subpages if we didn't want to, but starstWith is usually safer for sub-sections.
                    // Actually for dashboard `/agency/[id]`, everything starts with it. So strict equality for dashboard is better unless we want it always active.
                    const isExactObj = item.href === `/agency/${agencyId}`;
                    const activeState = isExactObj ? pathname === item.href : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-nowrap whitespace-nowrap overflow-hidden",
                                activeState
                                    ? "bg-purple-600/10 text-purple-400 border border-purple-500/20"
                                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                            )}
                        >
                            <item.icon className="w-5 h-5 shrink-0" />
                            <span className="truncate">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
