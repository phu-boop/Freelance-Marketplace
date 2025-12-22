'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Zap,
    ShieldCheck,
    CreditCard,
    DollarSign,
    Scale,
    HelpCircle,
    ArrowRight,
    Lock,
    Briefcase
} from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                                FreelanceHub
                            </span>
                        </Link>
                        <div className="hidden md:flex items-center gap-8">
                            <Link href="/jobs" className="text-sm text-slate-400 hover:text-white transition-colors">Find Jobs</Link>
                            <Link href="/freelancers" className="text-sm text-slate-400 hover:text-white transition-colors">Find Talent</Link>
                            <Link href="/pricing" className="text-sm text-blue-400 font-medium font-medium transition-colors">Pricing</Link>
                        </div>
                        <Link href="/register" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20">
                {/* Hero Section */}
                <div className="max-w-7xl mx-auto px-4 text-center space-y-6 mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest"
                    >
                        <Zap className="w-3 h-3" /> transparent pricing
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-extrabold tracking-tight"
                    >
                        Simple, fair <span className="text-blue-500">platform fees</span>.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 max-w-2xl mx-auto text-lg"
                    >
                        We built FreelanceHub to be the most cost-effective platform for talent and clients.
                        No hidden charges, just straightforward value.
                    </motion.p>
                </div>

                {/* Pricing Grid */}
                <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
                    {/* For Freelancers */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-8 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Briefcase className="w-24 h-24 text-blue-400" />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">For Freelancers</h2>
                            <p className="text-slate-400 text-sm">Keep more of what you earn with our industry-leading low service fees.</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-extrabold text-white">10%</span>
                                <span className="text-slate-400 font-medium">flat fee</span>
                            </div>
                            <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Per project completed</p>
                        </div>

                        <ul className="space-y-4 pt-4">
                            {[
                                "No monthly subscription required",
                                "50 free connects every month",
                                "Secure escrow protection",
                                "Unlimited portfolio uploads",
                                "Fast, direct withdrawals",
                                "24/7 dedicated support"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all border border-slate-700">
                            Join as Freelancer
                        </button>
                    </motion.div>

                    {/* For Clients */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-8 rounded-3xl bg-blue-600 space-y-8 relative overflow-hidden shadow-2xl shadow-blue-600/20"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-20">
                            <Zap className="w-24 h-24 text-white" />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-white">For Clients</h2>
                            <p className="text-blue-100 text-sm">Hire top talent and manage projects with minimal overhead.</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-extrabold text-white">3%</span>
                                <span className="text-blue-100 font-medium">payment fee</span>
                            </div>
                            <p className="text-xs text-blue-100 font-semibold uppercase tracking-wider">Per payment transaction</p>
                        </div>

                        <ul className="space-y-4 pt-4">
                            {[
                                "Free to post unlimited jobs",
                                "Only pay when you hire talent",
                                "Advanced talent matching",
                                "Project management suite",
                                "Custom contracts & NDAs",
                                "Dispute mediation services"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-blue-50 text-sm">
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg">
                            Hire Top Talent
                        </button>
                    </motion.div>
                </div>

                {/* Features Highlights */}
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold">Secure Escrow</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Your funds are only released when you approve the work. Both parties are protected by our advanced payment system.
                        </p>
                    </div>
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Scale className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold">Fair Mediation</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Should any disagreements arise, our professional dispute resolution team is here to ensure a fair outcome for all.
                        </p>
                    </div>
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold">Safe Payments</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            We support global payment methods including VNPay and Credit Cards, all protected by industry-standard encryption.
                        </p>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-4xl mx-auto px-4 space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
                        <p className="text-slate-400">Everything you need to know about our fees and payments.</p>
                    </div>

                    <div className="grid gap-6">
                        {[
                            {
                                q: "Are there any hidden monthly costs?",
                                a: "No. Unlike other platforms, we don't charge monthly membership fees just to search for jobs or hire talent. You only pay when work is actually happening."
                            },
                            {
                                q: "How do I get paid as a freelancer?",
                                a: "Once a milestone or project is approved by the client, the funds are released from escrow and added to your balance. You can then withdraw via your preferred method."
                            },
                            {
                                q: "What is inclusive in the 3% client fee?",
                                a: "The 3% fee covers payment processing, secure escrow management, and access to our platform support and dispute resolution services."
                            },
                            {
                                q: "Is the 10% freelancer fee negotiable?",
                                a: "We maintain a flat 10% fee to keep our operations sustainable while offering the most competitive rates in the market for freelancers."
                            }
                        ].map((faq, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                                <div className="flex items-start gap-4">
                                    <HelpCircle className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-white">{faq.q}</h4>
                                        <p className="text-slate-400 text-sm mt-2 leading-relaxed">{faq.a}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-12 text-center">
                        <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600">
                            <Link
                                href="/register"
                                className="px-10 py-4 bg-slate-950 hover:bg-transparent rounded-xl font-bold flex items-center gap-3 transition-all"
                            >
                                Start Working Today <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
