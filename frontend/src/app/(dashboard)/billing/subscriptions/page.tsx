'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Check,
    Star,
    Zap,
    Shield,
    Crown,
    Building2,
    Loader2
} from 'lucide-react';
import api from '@/lib/api';

export default function SubscriptionPlans() {
    const [currentPlan, setCurrentPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState<string | null>(null);

    useEffect(() => {
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payments/subscriptions/me');
            setCurrentPlan(res.data); // { planId: 'FREELANCER_PLUS', ... } or null
        } catch (err) {
            console.error('Failed to fetch subscription', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async (planId: string, price: number) => {
        setUpgrading(planId);
        try {
            await api.post('/payments/subscriptions', { planId, price });
            await fetchSubscription();
            alert(`Successfully upgraded to ${planId.replace('_', ' ')}!`);
        } catch (err: any) {
            console.error('Upgrade failed', err);
            alert(err.response?.data?.message || 'Upgrade failed');
        } finally {
            setUpgrading(null);
        }
    };

    const plans = [
        {
            id: 'FREELANCER_BASIC',
            name: 'Freelancer Basic',
            price: 0,
            role: 'FREELANCER',
            icon: Star,
            features: [
                '10 free Connects/month',
                'Hourly payment protection',
                'Fixed-price payments',
                'Limited reports'
            ]
        },
        {
            id: 'FREELANCER_PLUS',
            name: 'Freelancer Plus',
            price: 14.99,
            role: 'FREELANCER',
            popular: true,
            icon: Zap,
            features: [
                '80 Connects/month',
                'View competitor bids',
                'Keep earnings confidential',
                'Custom profile URL',
                'High-value job access'
            ]
        },
        {
            id: 'CLIENT_BASIC',
            name: 'Client Basic',
            price: 0,
            role: 'CLIENT',
            icon: Shield,
            features: [
                'Post unlimited jobs',
                'Access to freelancer talent',
                'Secure payments',
                'Standard support'
            ]
        },
        {
            id: 'CLIENT_ENTERPRISE',
            name: 'Client Enterprise',
            price: 29.99,
            role: 'CLIENT',
            popular: true,
            icon: Building2,
            features: [
                'Dedicated account manager',
                'Consolidated billing',
                'Custom contract terms',
                'Advanced reporting',
                'Premium talent sourcing'
            ]
        }
    ];

    // Simple role check mock - in real app would verify user role
    const userRole = 'FREELANCER';
    const filteredPlans = plans.filter(p => p.role === userRole);

    return (
        <div className="min-h-screen bg-slate-950 p-8 space-y-8">
            <header className="text-center max-w-2xl mx-auto mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
                    <Crown className="w-4 h-4" /> Upgrade your experience
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
                    Unlock Potential with Premium Plans
                </h1>
                <p className="text-slate-400 text-lg">
                    Choose the plan that fits your needs. Upgrade anytime as you grow.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:max-w-4xl mx-auto gap-8">
                {filteredPlans.map((plan) => {
                    const isCurrent = currentPlan?.planId === plan.id || (!currentPlan && plan.price === 0);
                    return (
                        <motion.div
                            key={plan.id}
                            whileHover={{ y: -10 }}
                            className={`relative bg-slate-900 border ${plan.popular ? 'border-blue-500 shadow-xl shadow-blue-500/10' : 'border-slate-800'} rounded-3xl p-8 flex flex-col`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl rounded-tr-2xl">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="flex items-center gap-4 mb-6">
                                <div className={`p-4 rounded-2xl ${plan.popular ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                                    <plan.icon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-white">${plan.price}</span>
                                        <span className="text-slate-500">/month</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3 text-slate-300">
                                        <Check className={`w-5 h-5 shrink-0 ${plan.popular ? 'text-blue-500' : 'text-slate-500'}`} />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => plan.price > 0 ? handleUpgrade(plan.id, plan.price) : null}
                                disabled={isCurrent || upgrading !== null}
                                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isCurrent
                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        : plan.popular
                                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                                            : 'bg-white text-slate-900 hover:bg-slate-200'
                                    }`}
                            >
                                {upgrading === plan.id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : isCurrent ? (
                                    'Current Plan'
                                ) : (
                                    plan.price > 0 ? 'Upgrade Now' : 'Downgrade'
                                )}
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
