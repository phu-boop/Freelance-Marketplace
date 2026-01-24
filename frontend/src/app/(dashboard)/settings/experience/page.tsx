'use client';

import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import { ExperienceList } from '@/components/profile/ExperienceList';
import { EducationList } from '@/components/profile/EducationList';
import { Card } from '@/components/ui/card';
import { Loader2, Layers, BookOpen } from 'lucide-react';

export default function ExperienceSettingsPage() {
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
        <div className="space-y-12">
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-6 mb-8">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                        <Layers className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Work Experience</h2>
                        <p className="text-sm text-slate-400">Manage your career history and past roles.</p>
                    </div>
                </div>
                <ExperienceList initialData={userData?.experience || []} />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-6 mb-8">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                        <BookOpen className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Educational Background</h2>
                        <p className="text-sm text-slate-400">List your degrees, certifications and academic achievements.</p>
                    </div>
                </div>
                <EducationList initialData={userData?.education || []} />
            </div>
        </div>
    );
}
