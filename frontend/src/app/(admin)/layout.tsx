'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useKeycloak } from '@/components/KeycloakProvider';
import { AccessDenied } from '@/components/AccessDenied';
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

import { UniversalSearch } from '@/components/UniversalSearch';
import { UserMenu } from '@/components/UserMenu';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { authenticated, username, logout, roles } = useKeycloak();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const isAdmin = roles.includes('ADMIN');

    if (authenticated && !isAdmin) {
        return <AccessDenied requiredRole="ADMIN" />;
    }

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-200">
            <AdminSidebar />

            <main className="flex-1 flex flex-col min-h-screen">
                <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between gap-8">
                    <div className="flex items-center gap-8 flex-1">
                        <h2 className="text-lg font-bold text-white whitespace-nowrap hidden lg:block">System Administration</h2>
                        <UniversalSearch placeholder="Search system records, logs or users..." />
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

                        <UserMenu />
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
