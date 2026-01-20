'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Command,
    Home,
    User,
    Briefcase,
    Settings,
    LogOut,
    CreditCard,
    Moon,
    Sun,
    X
} from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';

interface CommandItem {
    id: string;
    label: string;
    icon: any;
    action: () => void;
    group: 'Navigation' | 'Actions' | 'General';
}

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const router = useRouter();
    const { logout } = useKeycloak();

    // Commands
    const commands: CommandItem[] = [
        { id: 'nav-home', label: 'Go to Dashboard', icon: Home, group: 'Navigation', action: () => router.push('/dashboard') },
        { id: 'nav-jobs', label: 'Find Jobs', icon: Briefcase, group: 'Navigation', action: () => router.push('/jobs') },
        { id: 'nav-profile', label: 'View Profile', icon: User, group: 'Navigation', action: () => router.push('/profile/me') },
        { id: 'nav-settings', label: 'Settings', icon: Settings, group: 'Navigation', action: () => router.push('/settings') },
        { id: 'nav-billing', label: 'Billing & Payments', icon: CreditCard, group: 'Navigation', action: () => router.push('/billing') },
        { id: 'act-theme', label: 'Toggle Theme', icon: Moon, group: 'Actions', action: () => console.log('Toggle Theme') }, // Placeholder for theme
        { id: 'act-logout', label: 'Log Out', icon: LogOut, group: 'Actions', action: () => logout() },
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase())
    );

    // Toggle Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Navigation Listener while open
    useEffect(() => {
        if (!isOpen) return;

        const handleNav = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    filteredCommands[selectedIndex].action();
                    setIsOpen(false);
                    setQuery('');
                }
            }
        };

        window.addEventListener('keydown', handleNav);
        return () => window.removeEventListener('keydown', handleNav);
    }, [isOpen, filteredCommands, selectedIndex]);

    // Reset selection on query change
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Palette */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden glass"
                    >
                        {/* Search Input */}
                        <div className="flex items-center px-4 py-3 border-b border-slate-700/50">
                            <Search className="w-5 h-5 text-slate-400 mr-3" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Type a command or search..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-transparent text-lg text-white placeholder-slate-500 focus:outline-none"
                            />
                            <div className="flex items-center gap-2">
                                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-slate-700 bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-400">
                                    ESC
                                </kbd>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="max-h-[300px] overflow-y-auto py-2 custom-scrollbar">
                            {filteredCommands.length > 0 ? (
                                <>
                                    {['Navigation', 'Actions'].map(group => {
                                        const groupItems = filteredCommands.filter(c => c.group === group);
                                        if (groupItems.length === 0) return null;

                                        return (
                                            <div key={group} className="mb-2">
                                                <div className="px-4 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    {group}
                                                </div>
                                                {groupItems.map((item) => {
                                                    const globalIndex = filteredCommands.indexOf(item);
                                                    const isSelected = globalIndex === selectedIndex;

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            onClick={() => {
                                                                item.action();
                                                                setIsOpen(false);
                                                            }}
                                                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                            className={`mx-2 px-3 py-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <item.icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                                                                <span className="font-medium">{item.label}</span>
                                                            </div>
                                                            {isSelected && <span className="text-white/50 text-xs">Enter</span>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </>
                            ) : (
                                <div className="py-8 text-center text-slate-500">
                                    <p>No results found.</p>
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-2 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                            <div>
                                <span className="font-medium text-indigo-400">ProTip:</span> You can search for jobs directly here.
                            </div>
                            <div className="flex gap-2">
                                <span>Navigate</span> <span className="text-slate-600">↑↓</span>
                                <span>Select</span> <span className="text-slate-600">↵</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
