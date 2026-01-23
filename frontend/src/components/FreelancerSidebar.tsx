'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Briefcase,
    FileText,
    MessageSquare,
    Bell,
    User,
    Settings,
    Users,
    GraduationCap,
    Building,
    Search,
    BarChart2,
    LogOut
} from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';
import { cn } from '@/lib/utils';

const freelancerMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Search, label: 'Find Jobs', href: '/marketplace' },
    { icon: FileText, label: 'My Proposals', href: '/proposals' },
    { icon: Briefcase, label: 'My Projects', href: '/contracts' },
    { icon: Building, label: 'My Agencies', href: '/agency' }, // List of agencies they belong to
    { icon: Users, label: 'Talent Clouds', href: '/clouds' },
    { icon: BarChart2, label: 'Reports', href: '/analytics' },
    { icon: GraduationCap, label: 'Academy', href: '/community/academy' },
    { icon: MessageSquare, label: 'Forum', href: '/community/forum' },
    { icon: MessageSquare, label: 'Messages', href: '/messages' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Settings, label: 'Settings', href: '/settings/profile' },
];

export function FreelancerSidebar() {
    const pathname = usePathname();
    const { logout } = useKeycloak();

    return (
        <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen sticky top-0">
            <div className="p-6">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">FreelanceHub</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar pb-4">
                {freelancerMenuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-nowrap whitespace-nowrap overflow-hidden",
                                isActive
                                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
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
