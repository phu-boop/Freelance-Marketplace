'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, MessageSquare, User, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { label: 'Home', icon: Home, href: '/dashboard' },
        { label: 'Search', icon: Search, href: '/jobs' },
        { label: 'Messages', icon: MessageSquare, href: '/messages' },
        { label: 'Profile', icon: User, href: '/profile/me' },
        { label: 'Menu', icon: Menu, href: '/menu' }, // Fallback for other items
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-t border-slate-800 pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors"
                        >
                            <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-500'}`}>
                                <item.icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
                            </div>
                            <span className={`mt-0.5 text-[10px] ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="mobileNavIndicator"
                                    className="absolute top-0 w-8 h-0.5 bg-indigo-500 rounded-full"
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
