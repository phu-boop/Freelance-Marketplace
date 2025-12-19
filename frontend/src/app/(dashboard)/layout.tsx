'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useKeycloak } from '@/components/KeycloakProvider';
import { NotificationBell } from '@/components/NotificationBell';
import { OnboardingModal } from '@/components/OnboardingModal';
import api from '@/lib/api';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { authenticated, userId } = useKeycloak();
    const [showOnboarding, setShowOnboarding] = React.useState(false);

    React.useEffect(() => {
        const checkOnboarding = async () => {
            if (authenticated && userId) {
                try {
                    const response = await api.get(`/users/${userId}`);
                    if (!response.data.firstName) {
                        setShowOnboarding(true);
                    }
                } catch (error) {
                    console.error('Failed to check onboarding status', error);
                }
            }
        };
        checkOnboarding();
    }, [authenticated, userId]);

    return (
        <div className="flex min-h-screen bg-slate-950">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Welcome back!</h2>
                    <div className="flex items-center gap-6">
                        <NotificationBell />
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600" />
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
            {userId && (
                <OnboardingModal
                    isOpen={showOnboarding}
                    userId={userId}
                    onComplete={() => setShowOnboarding(false)}
                />
            )}
        </div>
    );
}
