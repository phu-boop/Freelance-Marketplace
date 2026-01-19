'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    MessageSquare,
    User,
    Wallet,
    Settings,
    LayoutDashboard,
    Briefcase,
    FileText,
    TrendingUp,
    ShieldCheck,
    Zap,
    X,
    Command as CommandIcon,
    ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useKeycloak } from './KeycloakProvider';

interface Action {
    id: string;
    name: string;
    icon: any;
    section: string;
    shortcut?: string[];
    action: () => void;
    roles?: string[];
}

export const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { roles, logout } = useKeycloak();
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    const isClient = roles?.includes('CLIENT');
    const isFreelancer = roles?.includes('FREELANCER');

    const actions: Action[] = [
        // Navigation
        { id: 'dash', name: 'Dashboard', icon: LayoutDashboard, section: 'Navigation', action: () => router.push('/dashboard') },
        { id: 'msg', name: 'Messages', icon: MessageSquare, section: 'Navigation', action: () => router.push('/messages') },
        { id: 'wallet', name: 'Wallet & Payments', icon: Wallet, section: 'Navigation', action: () => router.push('/wallet') },
        { id: 'prof', name: 'My Profile', icon: User, section: 'Navigation', action: () => router.push('/profile') },
        { id: 'settings', name: 'Settings', icon: Settings, section: 'Navigation', action: () => router.push('/settings') },

        // Freelancer Specific
        { id: 'find-work', name: 'Find Work', icon: Briefcase, section: 'Work', action: () => router.push('/marketplace'), roles: ['FREELANCER'] },
        { id: 'my-proposals', name: 'My Proposals', icon: FileText, section: 'Work', action: () => router.push('/proposals'), roles: ['FREELANCER'] },

        // Client Specific
        { id: 'post-job', name: 'Post a New Job', icon: Zap, section: 'Client', action: () => router.push('/jobs/create'), roles: ['CLIENT'] },
        { id: 'talent', name: 'Find Talent', icon: User, section: 'Client', action: () => router.push('/freelancers'), roles: ['CLIENT'] },

        // Admin / Verification
        { id: 'verify', name: 'Identity Verification', icon: ShieldCheck, section: 'Account', action: () => router.push('/profile?tab=security') },

        // System
        { id: 'logout', name: 'Logout', icon: X, section: 'System', action: () => logout() },
    ].filter(a => !a.roles || a.roles.some(r => roles?.includes(r)));

    const filteredActions = query === ''
        ? actions
        : actions.filter(a => a.name.toLowerCase().includes(query.toLowerCase()) || a.section.toLowerCase().includes(query.toLowerCase()));

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        const handleCustomEvent = () => setIsOpen(true);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('open-command-palette', handleCustomEvent);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('open-command-palette', handleCustomEvent);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen]);

    const handleSelect = (action: Action) => {
        action.action();
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredActions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
        } else if (e.key === 'Enter' && filteredActions[selectedIndex]) {
            handleSelect(filteredActions[selectedIndex]);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative"
                    >
                        <div className="p-4 border-b border-slate-800 flex items-center gap-4">
                            <Search className="w-5 h-5 text-slate-500" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="What do you want to do? (Type 'dash', 'msg', 'work'...)"
                                className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-slate-600"
                            />
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ESC</span>
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-2">
                            {filteredActions.length > 0 ? (
                                <div className="space-y-4 py-2">
                                    {/* Grouped Actions */}
                                    {['Navigation', 'Work', 'Client', 'Account', 'System'].map(section => {
                                        const sectionActions = filteredActions.filter(a => a.section === section);
                                        if (sectionActions.length === 0) return null;

                                        return (
                                            <div key={section} className="space-y-1">
                                                <h3 className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{section}</h3>
                                                {sectionActions.map((action) => {
                                                    const isSelected = filteredActions[selectedIndex]?.id === action.id;
                                                    return (
                                                        <button
                                                            key={action.id}
                                                            onClick={() => handleSelect(action)}
                                                            onMouseEnter={() => setSelectedIndex(filteredActions.indexOf(action))}
                                                            className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all group ${isSelected ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600/20 text-blue-500' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-800 group-hover:text-slate-300'}`}>
                                                                    <action.icon className="w-5 h-5" />
                                                                </div>
                                                                <span className="font-medium">{action.name}</span>
                                                            </div>
                                                            {isSelected && <ArrowRight className="w-4 h-4 animate-in slide-in-from-left-2 duration-200" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                                        <Search className="w-8 h-8 opacity-20" />
                                    </div>
                                    <p>No results found for "<span className="text-white font-medium">{query}</span>"</p>
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-slate-950/50 border-t border-slate-800/50 flex items-center justify-between px-6">
                            <div className="flex items-center gap-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <span className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-500">↑↓</span> Navigate
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-500">↵</span> Select
                                </div>
                            </div>
                            <div className="text-[10px] font-medium text-slate-700 italic flex items-center gap-1.5">
                                <CommandIcon className="w-3 h-3" /> Spotlight Search
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
