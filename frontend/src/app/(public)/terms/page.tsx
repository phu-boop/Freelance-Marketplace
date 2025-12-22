'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Scale, Gavel, UserCheck, CreditCard, HelpCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
    const sections = [
        {
            icon: <UserCheck className="w-6 h-6 text-blue-400" />,
            title: "1. Account Registration",
            content: "To access certain features of FreelanceHub, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete."
        },
        {
            icon: <CreditCard className="w-6 h-6 text-blue-400" />,
            title: "2. Payments & Fees",
            content: "Freelancers agree to pay a 10% service fee on all earnings. Clients agree to pay a 3% processing fee on all payments. All payments are handled securely through our escrow system. Funds are only released upon client approval of milestones."
        },
        {
            icon: <Gavel className="w-6 h-6 text-blue-400" />,
            title: "3. Dispute Resolution",
            content: "In the event of a dispute between a Client and a Freelancer, FreelanceHub provides a mediation service. Our team will review the contract, communication, and work submitted to reach a fair resolution. The decision of our mediation team is final."
        },
        {
            icon: <Shield className="w-6 h-6 text-blue-400" />,
            title: "4. User Conduct",
            content: "Users must interact professionally and respectfully. Any form of harassment, fraud, or attempt to circumvent the platform's payment system is strictly prohibited and may result in immediate account termination."
        },
        {
            icon: <Scale className="w-6 h-6 text-blue-400" />,
            title: "5. Intellectual Property",
            content: "Once a milestone is paid in full, the ownership of the work delivered is transferred to the Client, unless otherwise specified in a custom contract between the parties. Freelancers retain the right to showcase work in their portfolios."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 font-sans">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Scale className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-extrabold tracking-tight"
                    >
                        Terms of <span className="text-blue-500">Service</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 text-lg"
                    >
                        Last updated: December 22, 2025
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-8 md:p-12 rounded-3xl bg-slate-900 border border-slate-800 space-y-12"
                >
                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-300 leading-relaxed">
                            Welcome to FreelanceHub. By using our platform, you agree to comply with and be bound by the following terms and conditions. Please read these terms carefully before using our services.
                        </p>
                    </div>

                    <div className="space-y-10">
                        {sections.map((section, idx) => (
                            <div key={idx} className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-xl font-bold text-white">{section.title}</h2>
                                </div>
                                <p className="text-slate-400 leading-relaxed pl-16">
                                    {section.content}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="pt-10 border-t border-slate-800 flex flex-col items-center gap-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                            <HelpCircle className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-white">Have questions about our terms?</h3>
                            <p className="text-sm text-slate-500 max-w-md">
                                If you need clarification on any of our policies, please reach out to our legal department at <span className="text-blue-400">legal@freelancehub.com</span>
                            </p>
                        </div>
                    </div>
                </motion.div>

                <div className="text-center text-slate-500 text-sm">
                    &copy; 2025 FreelanceHub Inc. All rights reserved.
                </div>
            </main>
        </div>
    );
}
