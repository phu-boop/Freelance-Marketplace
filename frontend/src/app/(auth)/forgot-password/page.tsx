'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Mail,
    ArrowRight,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordForm>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordForm) => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/auth/forgot-password', data);
            setSuccess(true);
        } catch (err: any) {
            // For security, we might want to show success even if email not found
            // but for dev experience we'll show the error if it's not a generic one
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md text-center space-y-8"
                >
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/50">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl font-bold text-white">Check your email</h2>
                        <p className="text-slate-400">
                            We&apos;ve sent a password reset link to your email address.
                            Please follow the instructions to reset your password.
                        </p>
                    </div>
                    <Link href="/">
                        <Button variant="outline" className="w-full h-12 rounded-2xl border-slate-800 hover:bg-slate-800">
                            Back to Home
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-black">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">FreelanceHub</span>
                    </Link>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Forgot password?</h1>
                    <p className="mt-3 text-slate-400">No worries, we&apos;ll send you reset instructions.</p>
                </div>

                <Card className="p-8 md:p-10 border-slate-800/50 shadow-2xl bg-slate-900/50 backdrop-blur-xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-400">Email Address</label>
                            <Input
                                placeholder="name@company.com"
                                {...register('email')}
                                error={errors.email?.message}
                                leftIcon={<Mail className="w-5 h-5 text-slate-600" />}
                                className="bg-slate-950 border-slate-800 rounded-2xl h-14"
                            />
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full py-6 text-lg rounded-2xl" isLoading={loading} rightIcon={<ArrowRight className="w-5 h-5" />}>
                            Reset Password
                        </Button>

                        <div className="text-center pt-2">
                            <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors">
                                <ChevronLeft className="w-4 h-4" /> Back to Login
                            </Link>
                        </div>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}
