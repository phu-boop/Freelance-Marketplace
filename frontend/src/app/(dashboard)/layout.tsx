'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useKeycloak } from '@/components/KeycloakProvider';
import { NotificationBell } from '@/components/NotificationBell';
import { OnboardingModal } from '@/components/OnboardingModal';
import api from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrency } from '@/components/CurrencyProvider';
import { Smartphone, Globe } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { authenticated, userId } = useKeycloak();
    const { currency, setCurrency } = useCurrency();
    const [showOnboarding, setShowOnboarding] = React.useState(false);
    const router = useRouter();
    const pathname = usePathname();

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

        const checkProfile = async () => {
            if (authenticated && userId && !pathname.includes('/wizard')) {
                try {
                    const response = await api.get(`/users/profile/draft/${userId}`).catch(() => ({ data: null }));
                    if (!response.data || !response.data.isComplete) {
                        // For now we don't force redirect, just check
                    }
                } catch (error) {
                    console.error('Failed to check profile status', error);
                }
            }
        };

        checkOnboarding();
        checkProfile();
    }, [authenticated, userId, pathname]);

    return (
        <div className="flex min-h-screen bg-slate-950">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Welcome back!</h2>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2">
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-bold text-blue-400 focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="VND">VND (₫)</option>
                                <option value="BRL">BRL (R$)</option>
                            </select>
                        </div>
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
