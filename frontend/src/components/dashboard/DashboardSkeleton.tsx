'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content Skeleton */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-800">
                            <Skeleton className="h-6 w-48" />
                        </div>
                        <div className="p-6 space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <Skeleton className="h-6 w-1/3" />
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                    </div>
                                    <div className="flex gap-4">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-8 w-32 rounded-lg" />
                                        <Skeleton className="h-8 w-32 rounded-lg" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Skeleton */}
                <div className="space-y-8">
                    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-6">
                        <Skeleton className="h-6 w-full" />
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex gap-3">
                                    <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-3 w-3/4" />
                                        <Skeleton className="h-2 w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Skeleton className="h-48 rounded-3xl" />
                </div>
            </div>
        </div>
    );
}
