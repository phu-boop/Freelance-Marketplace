'use client';

import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import { PortfolioList } from '@/components/profile/PortfolioList';
import { Loader2, Image as ImageIcon } from 'lucide-react';

export default function PortfolioSettingsPage() {
    const { userId } = useKeycloak();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;
            try {
                const res = await api.get(`/users/${userId}`);
                setUserData(res.data);
            } catch (err) {
                console.error('Failed to fetch profile', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-6 mb-8">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                    <ImageIcon className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Project Portfolio</h2>
                    <p className="text-sm text-slate-400">Showcase your best work samples and projects to potential clients.</p>
                </div>
            </div>
            <PortfolioList initialData={userData?.portfolio || []} />
        </div>
    );
}
