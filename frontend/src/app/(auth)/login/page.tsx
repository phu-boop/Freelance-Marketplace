'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Github, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useKeycloak } from '@/components/KeycloakProvider';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const { login } = useKeycloak();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // In this setup, we usually redirect to Keycloak login
        // But we can also use the Keycloak JS API to login with credentials if configured
        login();
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-10 space-y-2">
                    <h1 className="text-4xl font-bold text-white tracking-tight">Welcome back</h1>
                    <p className="text-slate-400">Sign in to your account to continue</p>
                </div>

                <Card className="p-8 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="name@example.com"
                            leftIcon={<Mail className="w-4 h-4" />}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
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

                        <Button
                            type="submit"
                            className="w-full py-4"
                            isLoading={loading}
                            rightIcon={<ArrowRight className="w-5 h-5" />}
                        >
                            Sign In
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="w-full" leftIcon={<Chrome className="w-4 h-4" />}>
                            Google
                        </Button>
                        <Button variant="outline" className="w-full" leftIcon={<Github className="w-4 h-4" />}>
                            Github
                        </Button>
                    </div>

                    <p className="text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Create one
                        </Link>
                    </p>
                </Card>
            </motion.div>
        </div>
    );
}
