'use client';

import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationBell() {
    const { notifications } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all relative"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-slate-950">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                                <h4 className="font-bold text-white">Notifications</h4>
                                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500 text-sm">
                                        No new notifications
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={"p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-all cursor-pointer " + (!n.isRead ? "bg-blue-500/5" : "")}
                                        >
                                            <div className="text-sm font-medium text-white">{n.title}</div>
                                            <div className="text-xs text-slate-400 mt-1">{n.message}</div>
                                            <div className="text-[10px] text-slate-600 mt-2">{new Date(n.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-3 bg-slate-950/50 text-center">
                                <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                                    Mark all as read
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
