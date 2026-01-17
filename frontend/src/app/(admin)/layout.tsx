'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useKeycloak } from '@/components/KeycloakProvider';
import {
    Search,
    Bell,
    Settings,
    LogOut,
    User,
    ChevronDown,
    ExternalLink,
    Search as SearchIcon,
    Moon,
    Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { authenticated, username, logout } = useKeycloak();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-200">
            <AdminSidebar />

            <main className="flex-1 flex flex-col min-h-screen">
                <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-8 flex-1">
                        <h2 className="text-lg font-bold text-white whitespace-nowrap hidden lg:block">System Administration</h2>

                        {/* Integrated Search */}
                        <div className="max-w-md w-full relative group">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search system records, logs or users..."
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Action Buttons */}
                        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <Moon className="w-5 h-5" />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors relative"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-slate-950" />
                            </button>

                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-20 overflow-hidden"
                                        >
                                            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                                                <h3 className="font-bold text-white">Notifications</h3>
                                                <span className="text-[10px] bg-blue-600/10 text-blue-500 px-2 py-0.5 rounded uppercase font-bold">3 New</span>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {[
                                                    { title: 'New Dispute', desc: 'Contract #1234 has been disputed by client.', time: '2m ago', type: 'alert' },
                                                    { title: 'System Batch Complete', desc: 'Monthly payment batch processed successfully.', time: '1h ago', type: 'info' },
                                                    { title: 'New KYC Request', desc: 'User "JaneDoe" submitted documents for review.', time: '3h ago', type: 'info' },
                                                ].map((n, i) => (
                                                    <div key={i} className="p-4 hover:bg-slate-800/50 transition-colors border-b border-slate-800/50 cursor-pointer">
                                                        <p className="text-sm font-bold text-white">{n.title}</p>
                                                        <p className="text-xs text-slate-400 mt-1">{n.desc}</p>
                                                        <p className="text-[10px] text-slate-500 mt-2 font-mono">{n.time}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <button className="w-full py-3 text-xs font-bold text-blue-500 hover:bg-blue-500/5 transition-colors">
                                                View All Notifications
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <Link href="/admin/settings" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <Settings className="w-5 h-5" />
                        </Link>

                        <div className="w-px h-6 bg-slate-800 mx-2" />

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-3 p-1.5 pl-2 hover:bg-slate-800 rounded-xl transition-all group"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold text-white leading-none">{username || 'Admin'}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">System Root</p>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                                    {(username || 'AD').slice(0, 2).toUpperCase()}
                                </div>
                                <ChevronDown className={`w-4 h-4 text-slate-500 group-hover:text-white transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isUserMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-20 overflow-hidden"
                                        >
                                            <div className="p-4 bg-slate-800/50 border-b border-slate-800">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Administrator</p>
                                                <p className="text-sm font-bold text-white truncate">{username}</p>
                                            </div>
                                            <div className="p-2">
                                                <Link
                                                    href="/admin/settings"
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                                                >
                                                    <User className="w-4 h-4" />
                                                    My Profile
                                                </Link>
                                                <Link
                                                    href="/"
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    View Website
                                                </Link>
                                            </div>
                                            <div className="p-2 border-t border-slate-800">
                                                <button
                                                    onClick={logout}
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
                    </div>
                </header>

                <div className="flex-1 p-8">
                    {children}
                </div>

                <footer className="p-8 border-t border-slate-900 text-center">
                    <p className="text-xs text-slate-600 font-medium">© 2026 Freelance Marketplace Admin Engine. All rights reserved.</p>
                </footer>
            </main>
        </div>
    );
}
