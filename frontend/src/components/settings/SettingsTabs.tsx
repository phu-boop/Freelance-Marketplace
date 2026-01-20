'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
    { name: 'Profile', href: '/settings/profile' },
    { name: 'Security', href: '/settings/security' },
    { name: 'Identity', href: '/settings/verification' },
    { name: 'Expertise', href: '/settings/expertise' },
    { name: 'Tax & Compliance', href: '/settings/tax' },
    { name: 'Notifications', href: '/settings/notifications' },
    { name: 'Privacy', href: '/settings/privacy' },
];

export default function SettingsTabs() {
    const pathname = usePathname();

    return (
        <div className="flex border-b border-slate-800 mb-8 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={`px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${isActive
                            ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-500/5'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                            }`}
                    >
                        {tab.name}
                    </Link>
                );
            })}
        </div>
    );
}
