'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarClose, SidebarOpen, PanelRightClose, PanelRightOpen, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WorkspaceLayoutProps {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    toolbar?: React.ReactNode;
    title: string;
    onBack?: () => void;
}

export default function WorkspaceLayout({
    children,
    sidebar,
    toolbar,
    title,
    onBack
}: WorkspaceLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const router = useRouter();

    const handleBack = () => {
        if (onBack) onBack();
        else router.back();
    };

    return (
        <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header / Toolbar */}
                <header className="h-14 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBack}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="font-semibold text-white truncate">{title}</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {toolbar}
                        {sidebar && (
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className={`p-2 rounded-lg transition-colors ${isSidebarOpen ? 'bg-indigo-600/20 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'}`}
                                title="Toggle Context Sidebar"
                            >
                                {isSidebarOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto relative custom-scrollbar bg-[url('/grid.svg')] bg-fixed">
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 pointer-events-none" />
                    <div className="relative z-0 min-h-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* Context Sidebar (Right) */}
            <AnimatePresence initial={false}>
                {sidebar && isSidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="border-l border-slate-800 bg-slate-900 flex flex-col shrink-0 overflow-hidden"
                    >
                        <div className="w-[320px] h-full flex flex-col overflow-y-auto custom-scrollbar">
                            {sidebar}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </div>
    );
}
