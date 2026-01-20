'use client';

import React from 'react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import { FreelancerDashboard } from '@/components/dashboard/FreelancerDashboard';
import { ClientDashboard } from '@/components/dashboard/ClientDashboard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

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

    if (loading) return <DashboardSkeleton />;

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
    return <DashboardSkeleton />;
}


