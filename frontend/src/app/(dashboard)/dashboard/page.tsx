'use client';

import React from 'react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import { FreelancerDashboard } from '@/components/dashboard/FreelancerDashboard';
import { ClientDashboard } from '@/components/dashboard/ClientDashboard';

export default function DashboardPage() {
    const { userId, roles } = useKeycloak();
    const [user, setUser] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;
            try {
                const res = await api.get(`/users/${userId}`);
                setUser(res.data);
            } catch (err) {
                console.error('Failed to fetch user', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Role-based rendering
    if (roles.includes('ADMIN')) {
        // Redirect to admin dashboard if needed, or render Admin view
        window.location.href = '/admin';
        return null;
    }

    if (roles.includes('CLIENT')) {
        return <ClientDashboard user={user} />;
    }

    if (roles.includes('FREELANCER')) {
        return <FreelancerDashboard user={user} />;
    }

    // Still determining role or restricted
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="w-12 h-12 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-slate-400">Loading your workspace...</p>
        </div>
    );
}


