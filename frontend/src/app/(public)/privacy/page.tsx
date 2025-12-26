'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, Database, Share2, Bell, ShieldCheck, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
    const sections = [
        {
            icon: <Database className="w-6 h-6 text-indigo-400" />,
            title: "1. Information We Collect",
            content: "We collect information you provide directly to us (name, email, profile details) and information generated through platform use (contracts, payment history, communication logs). We also collect device and usage data automatically via cookies."
        },
        {
            icon: <Eye className="w-6 h-6 text-indigo-400" />,
            title: "2. How We Use Information",
            content: "Your data is used to provide, maintain, and improve our services, facilitate payments, verify identities, and communicate with you about your account and platform updates. We also use data for security and fraud prevention."
        },
        {
            icon: <Share2 className="w-6 h-6 text-indigo-400" />,
            title: "3. Information Sharing",
            content: "We do not sell your personal data. We share information with third-party service providers (payment processors, identity verification services) only as necessary to provide our services. We may also share data if required by law."
        },
        {
            icon: <Lock className="w-6 h-6 text-indigo-400" />,
            title: "4. Data Security",
            content: "We use industry-standard encryption and security measures (SSL, secure database clusters) to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security."
        },
        {
            icon: <Bell className="w-6 h-6 text-indigo-400" />,
            title: "5. Your Rights",
            content: "You have the right to access, correct, or delete your personal information at any time through your account settings. You can also opt-out of marketing communications or request a portable copy of your data."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 font-sans">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <Lock className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                                FreelanceHub
                            </span>
                        </Link>
                        <Link href="/" className="text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-4 max-w-4xl mx-auto space-y-12">
                <div className="space-y-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-4xl md:text-5xl font-extrabold tracking-tight"
                    >
                        Privacy <span className="text-indigo-500">Policy</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 text-lg"
                    >
                        Your privacy is our <span className="text-indigo-400 font-semibold">top priority</span>.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-8 md:p-12 rounded-3xl bg-slate-900 border border-slate-800 space-y-12 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <ShieldCheck className="w-64 h-64 text-indigo-400" />
                    </div>

                    <div className="prose prose-invert max-w-none relative z-10">
                        <p className="text-slate-300 leading-relaxed text-lg">
                            At FreelanceHub, we are committed to protecting your personal information and your right to privacy. This privacy policy explains how we collect, use, and safeguard your data when you visit our platform.
                        </p>
                    </div>

                    <div className="space-y-10 relative z-10">
                        {sections.map((section, idx) => (
                            <div key={idx} className="space-y-4 group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{section.title}</h2>
                                </div>
                                <p className="text-slate-400 leading-relaxed pl-16">
                                    {section.content}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="pt-10 border-t border-slate-800 text-center space-y-6">
                        <p className="text-sm text-slate-500">
                            By using FreelanceHub, you acknowledge that you have read and understood this Privacy Policy.
                            We may update this policy from time to time, so please check back periodically.
                        </p>
                        <div className="flex justify-center gap-4">
                            <span className="px-4 py-2 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400 uppercase tracking-widest font-bold">GDPR Compliant</span>
                            <span className="px-4 py-2 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400 uppercase tracking-widest font-bold">CCPA Ready</span>
                        </div>
                    </div>
                </motion.div>

                <div className="text-center text-slate-600 text-xs uppercase tracking-tighter">
                    Last updated: December 22, 2025 • FreelanceHub Trust Center
                </div>
            </main>
        </div>
    );
}
