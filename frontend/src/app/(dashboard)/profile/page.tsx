'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';
import ProfileHero from '@/components/ProfileHero';
import StatsCards from '@/components/StatsCards';
import ProfileChart from '@/components/ProfileChart';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
    const { userId, roles } = useKeycloak();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const isFreelancer = roles.includes('FREELANCER');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) return;
            try {
                const res = await api.get(`/users/${userId}`);
                setUser(res.data);
            } catch (error) {
                console.error('Failed to fetch profile', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto space-y-8">
                <Skeleton className="h-64 w-full rounded-3xl bg-slate-800" />
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl bg-slate-800" />)}
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <ProfileHero user={user} isOwnProfile={true} />

            {/* Stats Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Performance & Analytics</h2>
                <StatsCards stats={user.stats} isFreelancer={isFreelancer} />
            </div>

            {/* Charts & Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ProfileChart data={[]} /> {/* Pass real historical data if available */}
                </div>

                <div className="space-y-8">
                    {/* Completion Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Profile Completeness</h3>
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-400 bg-blue-500/10">
                                        {user.completionPercentage}% Complete
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-800">
                                <div style={{ width: `${user.completionPercentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"></div>
                            </div>
                        </div>
                        {user.completionPercentage < 100 ? (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-400">Add portfolio items and certifications to reach 100%.</p>
                                <Link href="/settings/profile">
                                    <Button variant="outline" size="sm" className="w-full text-blue-400 border-blue-500/20 hover:bg-blue-500/10">
                                        Complete Profile
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                                <CheckCircle className="w-4 h-4" />
                                Your profile is fully complete!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
