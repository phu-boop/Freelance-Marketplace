'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Briefcase,
    UserCircle,
    CheckCircle2,
    ArrowRight,
    ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';

export default function OnboardingPage() {
    const { logout, updateToken } = useKeycloak();
    const [selectedRole, setSelectedRole] = useState<'FREELANCER' | 'CLIENT'>('FREELANCER');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleComplete = async () => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/auth/social-onboarding', { role: selectedRole });

            // Force refresh token to get new roles in JWT
            try {
                // Use a negative value or high value to force a refresh
                await updateToken(-1);
            } catch (e) {
                console.warn('Failed to refresh token, redirecting anyway');
            }

            // Redirect after successful role assignment
            if (selectedRole === 'CLIENT') {
                window.location.href = '/client/dashboard';
            } else {
                window.location.href = '/dashboard';
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to complete onboarding. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-black">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl relative z-10"
            >
                <div className="text-center mb-10 space-y-3">
                    <div className="inline-flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">FreelanceHub</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Complete your profile</h1>
                    <p className="text-slate-400">Welcome! Please select how you want to use the platform.</p>
                </div>

                <Card className="p-8 md:p-10 border-slate-800/50 shadow-2xl bg-slate-900/50 backdrop-blur-xl">
                    <div className="space-y-8">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setSelectedRole('FREELANCER')}
                                className={`relative p-6 rounded-3xl border-2 text-left transition-all ${selectedRole === 'FREELANCER'
                                    ? 'bg-blue-600/10 border-blue-500 ring-4 ring-blue-500/10'
                                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                    }`}
                            >
                                <div className="mb-10 w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
                                    <Briefcase className={`w-6 h-6 ${selectedRole === 'FREELANCER' ? 'text-blue-400' : 'text-slate-500'}`} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg text-white">I'm a Freelancer</h3>
                                    <p className="text-xs text-slate-500">I'm looking for work to showcase my skills and earn money.</p>
                                </div>
                                {selectedRole === 'FREELANCER' && (
                                    <CheckCircle2 className="absolute top-6 right-6 w-5 h-5 text-blue-500" />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedRole('CLIENT')}
                                className={`relative p-6 rounded-3xl border-2 text-left transition-all ${selectedRole === 'CLIENT'
                                    ? 'bg-indigo-600/10 border-indigo-500 ring-4 ring-indigo-500/10'
                                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                    }`}
                            >
                                <div className="mb-10 w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
                                    <UserCircle className={`w-6 h-6 ${selectedRole === 'CLIENT' ? 'text-indigo-400' : 'text-slate-500'}`} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg text-white">I'm a Client</h3>
                                    <p className="text-xs text-slate-500">I'm looking to hire experts and get my projects delivered.</p>
                                </div>
                                {selectedRole === 'CLIENT' && (
                                    <CheckCircle2 className="absolute top-6 right-6 w-5 h-5 text-indigo-500" />
                                )}
                            </button>
                        </div>

                        <Button
                            onClick={handleComplete}
                            className="w-full py-6 text-lg rounded-2xl"
                            isLoading={loading}
                            rightIcon={<ArrowRight className="w-5 h-5" />}
                        >
                            Complete Setup
                        </Button>

                        <div className="text-center">
                            <button
                                onClick={() => logout()}
                                className="text-sm text-slate-500 hover:text-white transition-colors"
                            >
                                Not you? Sign out
                            </button>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
