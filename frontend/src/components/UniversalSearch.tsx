'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface UniversalSearchProps {
    placeholder?: string;
    className?: string;
}

export const UniversalSearch: React.FC<UniversalSearchProps> = ({
    placeholder = "Search projects, talent, or messages...",
    className = "max-w-md w-full"
}) => {
    const handleOpen = () => {
        window.dispatchEvent(new CustomEvent('open-command-palette'));
    };

    return (
        <div
            onClick={handleOpen}
            className={`${className} relative group cursor-pointer`}
        >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-500 transition-colors" />
            <div
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm transition-all text-slate-500 flex items-center"
            >
                {placeholder}
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-500 bg-slate-800 rounded border border-slate-700">⌘</kbd>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-500 bg-slate-800 rounded border border-slate-700">K</kbd>
            </div>
        </div>
    );
};
