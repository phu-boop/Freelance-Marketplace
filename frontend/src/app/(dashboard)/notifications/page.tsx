'use client';

import React from 'react';
import { Bell, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function NotificationsPage() {
    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Bell className="w-8 h-8 text-blue-500" />
                        Notifications
                    </h1>
                    <p className="text-slate-400 mt-2">Manage and view your platform notifications.</p>
                </div>
            </div>

            <Card className="p-12 border-dashed border-slate-800 bg-slate-900/20">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center">
                        <Bell className="w-8 h-8 text-slate-600" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-white">No notifications yet</h3>
                        <p className="text-slate-500 max-w-xs mx-auto">
                            We'll notify you here when you have new messages, job updates, or platform news.
                        </p>
                    </div>
                </div>
            </Card>

            <div className="flex gap-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                <Info className="w-5 h-5 text-blue-400 shrink-0" />
                <p className="text-sm text-blue-400/80">
                    Integration with the notification-service is coming soon. You can manage your email notification preferences in
                    <a href="/settings/notifications" className="ml-1 text-blue-400 font-bold hover:underline">Settings</a>.
                </p>
            </div>
        </div>
    );
}
