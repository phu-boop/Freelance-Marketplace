'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Briefcase,
    MessageSquare,
    Bell,
    User,
    Settings,
    LogOut,
    PlusCircle,
    FileText
} from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';
import { cn } from '@/lib/utils';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/client/dashboard' },
    { icon: Briefcase, label: 'My Jobs', href: '/client/jobs' },
    { icon: PlusCircle, label: 'Post a Job', href: '/marketplace/create' },
    { icon: FileText, label: 'Contracts', href: '/client/contracts' },
    { icon: MessageSquare, label: 'Messages', href: '/messages' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Settings, label: 'Settings', href: '/settings/profile' },
];

export function ClientSidebar() {
    const pathname = usePathname();
    const { logout } = useKeycloak();

    return (
        <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen sticky top-0">
            <div className="p-6">
                <Link href="/client/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">Client Portal</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-nowrap whitespace-nowrap overflow-hidden",
                                isActive
                                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
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
