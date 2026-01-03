'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Github, Chrome, Facebook, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login: redirectLogin, setTokens } = useKeycloak();

    // LOGIN state
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // 2FA state
    const [step, setStep] = useState<'LOGIN' | '2FA'>('LOGIN');
    const [tempToken, setTempToken] = useState<string | null>(null);
    const [twoFactorCode, setTwoFactorCode] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Standard OIDC Redirect Flow is the "Enterprise" way
            // We use loginHint to pass the email if the user already typed it
            redirectLogin({ loginHint: formData.email });
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to initiate login');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-10 space-y-2">
                    <h1 className="text-4xl font-bold text-white tracking-tight">
                        {step === 'LOGIN' ? 'Welcome back' : 'Two-Factor Auth'}
                    </h1>
                    <p className="text-slate-400">
                        {step === 'LOGIN' ? 'Sign in to your account to continue' : 'Enter the code from your authenticator app'}
                    </p>
                </div>

                <Card className="p-8 space-y-6 bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, height: 0, x: 0 }}
                                animate={{
                                    opacity: 1,
                                    height: 'auto',
                                    x: [0, -4, 4, -4, 4, 0],
                                }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm mb-4"
                            >
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p>{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {step === 'LOGIN' ? (
                                <motion.div
                                    key="login-form"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-4"
                                >
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        placeholder="name@example.com"
                                        leftIcon={<Mail className="w-4 h-4" />}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        autoFocus
                                    />
                                    <div className="space-y-1">
                                        <Input
                                            label="Password"
                                            type="password"
                                            placeholder="••••••••"
                                            leftIcon={<Lock className="w-4 h-4" />}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                        />
                                        <div className="flex justify-end">
                                            <Link href="/forgot-password" shallow className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                                Forgot password?
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="2fa-form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="flex justify-center mb-6">
                                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center animate-pulse">
                                            <ShieldCheck className="w-8 h-8 text-blue-500" />
                                        </div>
                                    </div>
                                    <Input
                                        label="Authentication Code"
                                        type="text"
                                        placeholder="000 000"
                                        value={twoFactorCode}
                                        onChange={(e) => setTwoFactorCode(e.target.value)}
                                        className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                                        maxLength={6}
                                        required
                                        autoFocus
                                    />
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => { setStep('LOGIN'); setTwoFactorCode(''); setError(null); }}
                                            className="text-sm text-slate-500 hover:text-white transition-colors"
                                        >
                                            Back to login
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button
                            type="submit"
                            className="w-full py-4 mt-2"
                            isLoading={loading}
                            rightIcon={step === 'LOGIN' ? <ArrowRight className="w-5 h-5" /> : undefined}
                        >
                            {step === 'LOGIN' ? 'Sign In' : 'Verify Code'}
                        </Button>
                    </form>

                    {step === 'LOGIN' && (
                        <>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-800"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <Button
                                    variant="outline"
                                    className="w-full border-slate-800 hover:bg-slate-800 px-0"
                                    onClick={() => redirectLogin({ idpHint: 'google' })}
                                    leftIcon={<Chrome className="w-4 h-4 text-red-500" />}
                                >
                                    Google
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full border-slate-800 hover:bg-slate-800 px-0"
                                    onClick={() => redirectLogin({ idpHint: 'github' })}
                                    leftIcon={<Github className="w-4 h-4 text-white" />}
                                >
                                    Github
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full border-slate-800 hover:bg-slate-800 px-0"
                                    onClick={() => redirectLogin({ idpHint: 'facebook' })}
                                    leftIcon={<Facebook className="w-4 h-4 text-blue-500" />}
                                >
                                    Facebook
                                </Button>
                            </div>

                            <p className="text-center text-sm text-slate-500">
                                Don't have an account?{' '}
                                <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                    Create one
                                </Link>
                            </p>
                        </>
                    )}
                </Card>
            </motion.div>
        </div>
    );
}
