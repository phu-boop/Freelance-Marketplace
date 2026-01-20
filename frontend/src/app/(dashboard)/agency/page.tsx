'use client';

import React from 'react';
import { useKeycloak } from '@/components/KeycloakProvider';
import { AgencyDashboard } from '@/components/dashboard/AgencyDashboard';
import api from '@/lib/api';

export default function AgencyPage() {
    const { userId, authenticated, initialized } = useKeycloak();
    const [user, setUser] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchUser = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.get(`/users/${userId}`);
                setUser(res.data);
            } catch (err) {
                console.error('Failed to fetch user', err);
            } finally {
                setLoading(false);
            }
        };
        if (initialized) fetchUser();
    }, [userId, initialized]);

    if (!initialized || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!authenticated) {
        return (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl m-8">
                <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
                <p className="text-slate-400">Please log in to access your agency dashboard.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-8">
            <AgencyDashboard user={user} />
        </div>
    );
}
