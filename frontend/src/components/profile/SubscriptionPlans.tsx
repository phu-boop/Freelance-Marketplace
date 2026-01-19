'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ShieldCheck, Rocket, Briefcase } from 'lucide-react';
import axios from 'axios';
import { useKeycloak } from '@/components/KeycloakProvider';

const PLANS = [
    {
        id: 'FREELANCER_BASIC',
        name: 'Basic',
        price: 0,
        description: 'Perfect for getting started',
        features: ['10 Monthly Connects', 'Standard Profile', 'Limited Proposals'],
        icon: <Briefcase className="w-5 h-5 text-slate-400" />
    },
    {
        id: 'FREELANCER_PLUS',
        name: 'Freelancer Plus',
        price: 14.99,
        description: 'The pro advantage',
        features: ['80 Monthly Connects', 'View Competitor Bids', 'Hidden Profile Status', 'Custom Profile URL'],
        icon: <Rocket className="w-5 h-5 text-blue-500" />,
        popular: true
    },
    {
        id: 'CLIENT_ENTERPRISE',
        name: 'Enterprise',
        price: 49.99,
        description: 'For growing teams',
        features: ['Advanced Reporting', 'Custom Contracts', 'Dedicated Account Manager', 'Verified Client Badge'],
        icon: <ShieldCheck className="w-5 h-5 text-purple-500" />
    }
];

export default function SubscriptionPlans() {
    const { token, roles, userId } = useKeycloak();
    const [loading, setLoading] = useState<string | null>(null);

    const handleSubscribe = async (planId: string, price: number) => {
        if (price === 0) return;
        setLoading(planId);
        try {
            await axios.post('/api/payments/subscriptions', { planId, price }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            window.location.reload(); // Refresh to update roles/status
        } catch (error) {
            console.error("Subscription failed:", error);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto py-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Upgrade Your Success</h1>
                <p className="text-xl text-slate-400">Choose the plan that fits your growth ambitions.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 px-4">
                {PLANS.map((plan) => (
                    <Card
                        key={plan.id}
                        className={`bg-slate-900 border-slate-800 flex flex-col relative transition-all hover:scale-[1.02] ${plan.popular ? 'border-blue-500 shadow-2xl shadow-blue-500/10' : ''}`}
                    >
                        {plan.popular && (
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-lg shadow-blue-500/40">
                                Most Popular
                            </span>
                        )}
                        <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                                {plan.icon}
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{plan.name === 'Basic' ? 'Free' : 'Pro'}</span>
                            </div>
                            <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
                            <CardDescription className="text-slate-400 min-h-[40px]">{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <div className="mb-6">
                                <span className="text-4xl font-black text-white">${plan.price}</span>
                                <span className="text-slate-500 ml-2">/month</span>
                            </div>
                            <ul className="space-y-3">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className={`w-full font-bold h-12 ${plan.popular ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-800 hover:bg-slate-700'} text-white shadow-xl`}
                                disabled={plan.price === 0 || !!loading}
                                onClick={() => handleSubscribe(plan.id, plan.price)}
                            >
                                {loading === plan.id ? 'Processing...' : plan.price === 0 ? 'Current Plan' : 'Get Started'}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <p className="text-center text-xs text-slate-500 max-w-sm mx-auto">
                Subscriptions are billed monthly. You can cancel anytime. No hidden fees.
            </p>
        </div>
    );
}
