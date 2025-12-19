'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Scale, AlertCircle, CheckCircle2, Briefcase, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RulesPage() {
    const sections = [
        {
            icon: <Shield className="w-6 h-6 text-blue-400" />,
            title: "Account Security",
            rules: [
                "One account per user. Multiple accounts are strictly prohibited.",
                "Accurate and truthful profile information is mandatory.",
                "Identity verification (KYC) may be required for high-value contracts.",
                "Sharing account credentials with others is a violation of terms."
            ]
        },
        {
            icon: <Scale className="w-6 h-6 text-purple-400" />,
            title: "Professional Conduct",
            rules: [
                "All communications must remain professional and respectful.",
                "Harassment, hate speech, or discrimination will result in immediate banning.",
                "Spamming clients or freelancers with unsolicited offers is prohibited.",
                "Plagiarism or misrepresentation of work is strictly forbidden."
            ]
        },
        {
            icon: <AlertCircle className="w-6 h-6 text-yellow-400" />,
            title: "Payment & Contracts",
            rules: [
                "All payments must be processed through the FreelanceHub platform.",
                "Circumventing the platform to avoid fees is a major violation.",
                "Milestones must be clearly defined before starting fixed-price work.",
                "Disputes will be mediated by our support team based on contract terms."
            ]
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
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">Rules & Regulations</h1>
                        <p className="text-slate-400 text-lg">
                            Our community thrives on trust and professionalism. Please follow these guidelines to ensure a safe experience for everyone.
                        </p>
                    </motion.div>

                    <div className="space-y-12">
                        {sections.map((section, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 rounded-3xl bg-slate-900 border border-slate-800"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 rounded-2xl bg-slate-800">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-2xl font-bold">{section.title}</h2>
                                </div>
                                <ul className="grid gap-4">
                                    {section.rules.map((rule, rIdx) => (
                                        <li key={rIdx} className="flex gap-4 text-slate-400 leading-relaxed">
                                            <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>

                    {/* Enforcement Note */}
                    <div className="mt-16 p-8 rounded-3xl bg-red-500/5 border border-red-500/20">
                        <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" /> Enforcement
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Violations of these rules may result in temporary suspension or permanent banning of your account.
                            We reserve the right to withhold funds in cases of proven fraud or platform circumvention.
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
