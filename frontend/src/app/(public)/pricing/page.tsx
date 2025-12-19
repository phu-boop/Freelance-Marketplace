'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Briefcase, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
    const plans = [
        {
            name: "Freelancer Basic",
            price: "Free",
            description: "Perfect for getting started",
            features: [
                "10 Connects per month",
                "Unlimited proposals",
                "Standard support",
                "Basic profile visibility"
            ],
            cta: "Get Started",
            highlighted: false
        },
        {
            name: "Freelancer Plus",
            price: "$14.99",
            period: "/mo",
            description: "Stand out from the crowd",
            features: [
                "80 Connects per month",
                "View competitor bids",
                "Custom profile URL",
                "Priority support",
                "Extended portfolio storage"
            ],
            cta: "Go Plus",
            highlighted: true
        },
        {
            name: "Client Enterprise",
            price: "Custom",
            description: "For large organizations",
            features: [
                "Dedicated account manager",
                "Custom onboarding",
                "Advanced reporting",
                "API access",
                "Consolidated billing"
            ],
            cta: "Contact Sales",
            highlighted: false
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                                FreelanceHub
                            </span>
                        </Link>
                        <Link href="/" className="text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">Simple, Transparent Pricing</h1>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-16">
                            Choose the plan that's right for you. No hidden fees, cancel anytime.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`p-8 rounded-3xl border ${plan.highlighted
                                        ? 'bg-blue-600/10 border-blue-500 shadow-xl shadow-blue-500/10'
                                        : 'bg-slate-900 border-slate-800'
                                    } text-left relative overflow-hidden`}
                            >
                                {plan.highlighted && (
                                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    {plan.period && <span className="text-slate-500">{plan.period}</span>}
                                </div>
                                <p className="text-slate-400 text-sm mb-8">{plan.description}</p>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-center gap-3 text-sm text-slate-300">
                                            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                <Check className="w-3 h-3 text-blue-400" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button className={`w-full py-3 rounded-xl font-bold transition-all ${plan.highlighted
                                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                                    }`}>
                                    {plan.cta}
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Platform Fees Note */}
                    <div className="mt-20 p-8 rounded-3xl bg-slate-900/50 border border-slate-800 max-w-3xl mx-auto">
                        <h4 className="text-lg font-bold mb-4">Platform Service Fees</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            FreelanceHub charges a sliding service fee based on your lifetime billings with each client:
                            <br /><br />
                            • 20% for the first $500 billed with a client
                            <br />
                            • 10% for lifetime billings between $500.01 and $10,000
                            <br />
                            • 5% for lifetime billings over $10,000
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
                    © 2025 FreelanceHub. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
