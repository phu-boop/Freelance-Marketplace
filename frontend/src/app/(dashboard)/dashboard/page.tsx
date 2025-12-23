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
    if (roles.includes('CLIENT')) {
        return <ClientDashboard user={user} />;
    }

    // Default to Freelancer for now
    return <FreelancerDashboard user={user} />;
}

