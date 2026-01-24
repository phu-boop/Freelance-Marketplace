'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    User,
    Shield,
    Bell,
    CreditCard,
    Building,
    FileText,
    Lock,
    Briefcase,
    Layers,
    Image as ImageIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useKeycloak } from '@/components/KeycloakProvider';

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { roles } = useKeycloak();
    const isClient = roles.includes('CLIENT');

    const tabs = [
        { label: 'Profile', href: '/settings/profile', icon: User },
        { label: 'Expertise', href: '/settings/expertise', icon: Briefcase },
        { label: 'Work & Education', href: '/settings/experience', icon: Layers },
        { label: 'Portfolio', href: '/settings/portfolio', icon: ImageIcon },
        { label: 'Security', href: '/settings/security', icon: Shield },
        { label: 'Identity', href: '/settings/verification', icon: FileText },
        { label: 'Notifications', href: '/settings/notifications', icon: Bell },
        { label: 'Tax', href: '/settings/tax', icon: CreditCard },
    ];

    if (isClient) {
        tabs.push({ label: 'Company', href: '/settings/company', icon: Building });
    }

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex flex-col mb-10">
                <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Account Settings</h1>
                <p className="text-slate-400">Manage your account preferences, security, and professional profile.</p>
            </div>

            <div className="flex border-b border-slate-800 mb-10 overflow-x-auto no-scrollbar gap-2">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href || (tab.href !== '/settings/profile' && pathname.startsWith(tab.href));
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "flex items-center gap-2.5 px-6 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 relative",
                                isActive
                                    ? "border-blue-500 text-blue-400 bg-blue-500/5 shadow-[inset_0_-20px_20px_-20px_rgba(59,130,246,0.1)]"
                                    : "border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700"
                            )}
                        >
                            <tab.icon className={cn("w-4 h-4", isActive ? "animate-pulse" : "")} />
                            {tab.label}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 border-b-2 border-blue-500"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={pathname}
            >
                {children}
            </motion.div>
        </div>
    );
}
