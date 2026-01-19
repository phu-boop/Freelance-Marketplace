'use client';

import React, { useState } from 'react';
import { useKeycloak } from '@/components/KeycloakProvider';
import {
    LogOut,
    User,
    ChevronDown,
    Settings,
    Briefcase,
    LayoutDashboard,
    ArrowLeftRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const UserMenu = () => {
    const { username, logout, roles } = useKeycloak();
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const isAdmin = roles.includes('ADMIN');
    const isClient = roles.includes('CLIENT');
    const isFreelancer = roles.includes('FREELANCER');

    // Determine current mode based on pathname
    const isClientMode = pathname.startsWith('/client');
    const isAdminMode = pathname.startsWith('/admin');

    const toggleMenu = () => setIsOpen(!isOpen);

    const menuVariants = {
        hidden: { opacity: 0, y: 10, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 10, scale: 0.95 }
    };

    return (
        <div className="relative">
            <button
                onClick={toggleMenu}
                className="flex items-center gap-3 p-1.5 pl-2 hover:bg-slate-800 rounded-xl transition-all group border border-transparent hover:border-slate-700"
            >
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-white leading-none">{username || 'User'}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">
                        {isAdminMode ? 'System Admin' : isClientMode ? 'Client' : 'Freelancer'}
                    </p>
                </div>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${isAdminMode ? 'from-red-600 to-orange-500' : isClientMode ? 'from-indigo-600 to-purple-500' : 'from-blue-600 to-cyan-500'} flex items-center justify-center text-xs font-bold text-white shadow-lg`}>
                    {(username || 'U').slice(0, 2).toUpperCase()}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 group-hover:text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={menuVariants}
                            className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-20 overflow-hidden"
                        >
                            <div className="p-4 bg-slate-800/30 border-b border-slate-800">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Signed in as</p>
                                <p className="text-sm font-bold text-white truncate">{username}</p>
                            </div>

                            <div className="p-2">
                                <Link
                                    href="/profile"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    My Profile
                                </Link>
                                <Link
                                    href="/settings/profile"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </Link>
                            </div>

                            {/* Role Switcher Section */}
                            {(isClient || isFreelancer) && !isAdminMode && (
                                <div className="p-2 border-t border-slate-800">
                                    <p className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Switch Mode</p>
                                    {isClientMode ? (
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setIsOpen(false)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors"
                                        >
                                            <ArrowLeftRight className="w-4 h-4" />
                                            Switch to Selling
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/client/dashboard"
                                            onClick={() => setIsOpen(false)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-colors"
                                        >
                                            <ArrowLeftRight className="w-4 h-4" />
                                            Switch to Buying
                                        </Link>
                                    )}
                                </div>
                            )}

                            {isAdmin && !isAdminMode && (
                                <div className="p-2 border-t border-slate-800">
                                    <Link
                                        href="/admin"
                                        onClick={() => setIsOpen(false)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        Admin Panel
                                    </Link>
                                </div>
                            )}

                            <div className="p-2 border-t border-slate-800">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        logout();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Log Out
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
