'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md text-center space-y-8"
                >
                    <div className="mx-auto w-20 h-20 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-blue-500" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl font-bold text-white tracking-tight">Check your email</h2>
                        <p className="text-slate-400 leading-relaxed text-lg">
                            We've sent a password reset link to <span className="text-white font-medium">{email}</span>.
                        </p>
                    </div>
                    <Button variant="outline" className="w-full h-12 rounded-xl" onClick={() => (window.location.href = '/login')}>
                        Back to Login
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Sign In
                </Link>

                <div className="text-left mb-10 space-y-2">
                    <h1 className="text-4xl font-bold text-white tracking-tight">Reset password</h1>
                    <p className="text-slate-400">Enter your email and we'll send you a recovery link.</p>
                </div>

                <Card className="p-8 space-y-6">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, x: 0 }}
                            animate={{
                                opacity: 1,
                                height: 'auto',
                                x: [0, -4, 4, -4, 4, 0],
                            }}
                            transition={{
                                opacity: { duration: 0.2 },
                                height: { duration: 0.2 },
                                x: { duration: 0.4, ease: "easeInOut", times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
                            }}
                            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm"
                        >
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{error}</p>
                        </motion.div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="name@example.com"
                            leftIcon={<Mail className="w-4 h-4" />}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Button
                            type="submit"
                            className="w-full py-6 text-lg rounded-2xl"
                            isLoading={loading}
                            rightIcon={<ArrowRight className="w-5 h-5" />}
                        >
                            Send Reset Link
                        </Button>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}
