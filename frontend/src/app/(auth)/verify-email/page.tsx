'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    ShieldCheck,
    ArrowRight,
    PartyPopper
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKeycloak } from '@/components/KeycloakProvider';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
    const { authenticated, roles } = useKeycloak();
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (authenticated) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        const target = roles.includes('ADMIN')
                            ? '/admin'
                            : roles.includes('CLIENT')
                                ? '/client/dashboard'
                                : '/dashboard';
                        router.push(target);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [authenticated, roles, router]);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-black">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg text-center relative z-10"
            >
                <div className="mb-10">
                    <div className="inline-flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">FreelanceHub</span>
                    </div>
                </div>

                <div className="space-y-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                        className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/50 shadow-[0_0_50px_-12px_rgba(34,197,94,0.5)]"
                    >
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </motion.div>

                    <div className="space-y-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-4xl font-extrabold text-white tracking-tight"
                        >
                            Email Verified! <PartyPopper className="inline-block w-8 h-8 text-yellow-500 ml-2" />
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-lg text-slate-400"
                        >
                            Thank you for verifying your email address. Your account is now fully secured and ready to go.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="pt-4"
                    >
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
                            <p className="text-sm text-slate-500 mb-4">
                                Redirecting you to your dashboard in <span className="text-blue-400 font-bold">{countdown}</span> seconds...
                            </p>
                            <Link href="/">
                                <Button className="w-full py-6 text-lg rounded-2xl" rightIcon={<ArrowRight className="w-5 h-5" />}>
                                    Go to Dashboard Now
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                <div className="mt-12 flex justify-center gap-6 opacity-20">
                    <div className="w-12 h-1 text-slate-800 rounded-full" />
                    <div className="w-12 h-1 bg-blue-600 rounded-full" />
                    <div className="w-12 h-1 text-slate-800 rounded-full" />
                </div>
            </motion.div>
        </div>
    );
}
