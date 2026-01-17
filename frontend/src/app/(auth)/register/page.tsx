'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Mail,
    Lock,
    ArrowRight,
    Briefcase,
    User,
    ShieldCheck,
    ChevronLeft,
    CheckCircle2,
    AlertCircle,
    UserCircle,
    Chrome,
    Github,
    Facebook
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useKeycloak } from '@/components/KeycloakProvider';

const registerSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['FREELANCER', 'CLIENT']),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const { login } = useKeycloak();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'FREELANCER',
        },
    });

    const selectedRole = watch('role');

    const onSubmit = async (data: RegisterForm) => {
        setLoading(true);
        setError(null);
        try {
            const { role, ...rest } = data;
            await api.post('/auth/register', {
                ...rest,
                roles: [role],
            });
            setSuccess(true);
            setTimeout(() => router.push('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step < 2) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSocialLogin = (provider: string) => {
        // Save selected role to localStorage so we can pick it up after redirect
        localStorage.setItem('pending_role', selectedRole);
        login({ idpHint: provider });
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                >
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/50">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-white">Verification Link Sent!</h2>
                        <p className="text-slate-400">Please check your email to verify your account. Redirecting you to login...</p>
                    </div>
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
                className="w-full max-w-xl relative z-10"
            >
                <div className="text-center mb-10 space-y-3">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">FreelanceHub</span>
                    </Link>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Create your account</h1>
                    <p className="text-slate-400">Step {step} of 2: {step === 1 ? 'Select your path' : 'Account details'}</p>
                </div>

                <Card className="p-8 md:p-10 border-slate-800/50 shadow-2xl bg-slate-900/50 backdrop-blur-xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setValue('role', 'FREELANCER')}
                                            className={`relative p-6 rounded-3xl border-2 text-left transition-all ${selectedRole === 'FREELANCER'
                                                ? 'bg-blue-600/10 border-blue-500 ring-4 ring-blue-500/10'
                                                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                                }`}
                                        >
                                            <div className="mb-10 w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
                                                <Briefcase className={`w-6 h-6 ${selectedRole === 'FREELANCER' ? 'text-blue-400' : 'text-slate-500'}`} />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-lg text-white">I&apos;m a Freelancer</h3>
                                                <p className="text-xs text-slate-500">I&apos;m looking for work to showcase my skills and earn money.</p>
                                            </div>
                                            {selectedRole === 'FREELANCER' && (
                                                <CheckCircle2 className="absolute top-6 right-6 w-5 h-5 text-blue-500" />
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setValue('role', 'CLIENT')}
                                            className={`relative p-6 rounded-3xl border-2 text-left transition-all ${selectedRole === 'CLIENT'
                                                ? 'bg-indigo-600/10 border-indigo-500 ring-4 ring-indigo-500/10'
                                                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                                }`}
                                        >
                                            <div className="mb-10 w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
                                                <UserCircle className={`w-6 h-6 ${selectedRole === 'CLIENT' ? 'text-indigo-400' : 'text-slate-500'}`} />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-lg text-white">I&apos;m a Client</h3>
                                                <p className="text-xs text-slate-500">I&apos;m looking to hire experts and get my projects delivered.</p>
                                            </div>
                                            {selectedRole === 'CLIENT' && (
                                                <CheckCircle2 className="absolute top-6 right-6 w-5 h-5 text-indigo-500" />
                                            )}
                                        </button>
                                    </div>
                                    <Button type="button" onClick={nextStep} className="w-full py-6 text-lg rounded-2xl" rightIcon={<ArrowRight className="w-5 h-5" />}>
                                        Continue
                                    </Button>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-800"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-slate-900 px-4 text-slate-500">Or join with</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleSocialLogin('google')}
                                            className="h-14 rounded-2xl border-slate-800 hover:bg-slate-800 px-0"
                                            leftIcon={<Chrome className="w-5 h-5 text-red-500" />}
                                        >
                                            Google
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleSocialLogin('github')}
                                            className="h-14 rounded-2xl border-slate-800 hover:bg-slate-800 px-0"
                                            leftIcon={<Github className="w-5 h-5 text-white" />}
                                        >
                                            GitHub
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleSocialLogin('facebook')}
                                            className="h-14 rounded-2xl border-slate-800 hover:bg-slate-800 px-0"
                                            leftIcon={<Facebook className="w-5 h-5 text-blue-500" />}
                                        >
                                            Facebook
                                        </Button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <button type="button" onClick={prevStep} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors">
                                        <ChevronLeft className="w-4 h-4" /> Back
                                    </button>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-400">First Name</label>
                                            <Input
                                                placeholder="John"
                                                {...register('firstName')}
                                                error={errors.firstName?.message}
                                                className="bg-slate-950 border-slate-800 rounded-2xl h-14"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-400">Last Name</label>
                                            <Input
                                                placeholder="Doe"
                                                {...register('lastName')}
                                                error={errors.lastName?.message}
                                                className="bg-slate-950 border-slate-800 rounded-2xl h-14"
                                            />
                                        </div>
                                    </div>

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

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-400">Password</label>
                                        <Input
                                            type="password"
                                            placeholder="Min. 8 characters"
                                            {...register('password')}
                                            error={errors.password?.message}
                                            leftIcon={<Lock className="w-5 h-5 text-slate-600" />}
                                            className="bg-slate-950 border-slate-800 rounded-2xl h-14"
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm">
                                            <AlertCircle className="w-5 h-5" />
                                            {error}
                                        </div>
                                    )}

                                    <Button type="submit" className="w-full py-6 text-lg rounded-2xl" isLoading={loading}>
                                        Create Account
                                    </Button>

                                    <p className="text-center text-xs text-slate-500 leading-relaxed">
                                        By signing up, you agree to our{' '}
                                        <Link href="/terms" className="text-blue-500 hover:underline">Terms of Service</Link> and{' '}
                                        <Link href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link>.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>

                    <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                            Sign in
                        </Link>
                    </div>
                </Card>

                <div className="mt-8 flex justify-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                    <ShieldCheck className="w-6 h-6 text-white" />
                    <User className="w-6 h-6 text-white" />
                </div>
            </motion.div>
        </div>
    );
}
