'use client';

import React from 'react';
import Link from 'next/link';

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <header className="h-16 border-b border-slate-800 px-8 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-white">
                    FreelanceHub
                </Link>
                <div className="text-sm text-slate-400">
                    Step-by-step Setup
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-2xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
