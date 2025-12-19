'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, Check, ArrowRight, Loader2, Globe, Phone, Award, Building2 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { cn } from '@/lib/utils';

interface OnboardingModalProps {
    isOpen: boolean;
    userId: string;
    onComplete: () => void;
}

export const OnboardingModal = ({ isOpen, userId, onComplete }: OnboardingModalProps) => {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<'FREELANCER' | 'CLIENT' | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        country: '',
        title: '',
        hourlyRate: '',
        skills: [] as string[],
        companyName: '',
        industry: '',
    });

    const handleComplete = async () => {
        setLoading(true);
        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                country: formData.country,
                roles: [role],
                ...(role === 'FREELANCER' ? {
                    title: formData.title,
                    hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : 0,
                    skills: formData.skills.filter(s => s !== '')
                } : {
                    companyName: formData.companyName,
                    industry: formData.industry
                })
            };
            await api.patch(`/users/${userId}/onboarding`, payload);
            onComplete();
        } catch (error) {
            console.error('Failed to complete onboarding', error);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    if (!isOpen) return null;

    const stepVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden relative"
                >
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                        <motion.div
                            className="h-full bg-blue-600"
                            initial={{ width: '0%' }}
                            animate={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>

                    <div className="p-10">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    variants={stepVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="space-y-8"
                                >
                                    <div className="text-center space-y-3">
                                        <h2 className="text-4xl font-bold text-white tracking-tight">Welcome to <span className="text-gradient">FreelanceHub</span></h2>
                                        <p className="text-slate-400 text-lg">How would you like to use the platform?</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <Card
                                            onClick={() => setRole('FREELANCER')}
                                            className={cn(
                                                "cursor-pointer p-8 relative overflow-hidden group",
                                                role === 'FREELANCER' ? "border-blue-500 bg-blue-500/5" : "border-slate-800"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all",
                                                role === 'FREELANCER' ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
                                            )}>
                                                <User className="w-7 h-7" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">I'm a Freelancer</h3>
                                            <p className="text-slate-500 text-sm leading-relaxed">I want to showcase my skills and find exciting projects to work on.</p>
                                            {role === 'FREELANCER' && (
                                                <motion.div layoutId="check" className="absolute top-6 right-6 text-blue-500">
                                                    <Check className="w-6 h-6" />
                                                </motion.div>
                                            )}
                                        </Card>

                                        <Card
                                            onClick={() => setRole('CLIENT')}
                                            className={cn(
                                                "cursor-pointer p-8 relative overflow-hidden group",
                                                role === 'CLIENT' ? "border-indigo-500 bg-indigo-500/5" : "border-slate-800"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all",
                                                role === 'CLIENT' ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
                                            )}>
                                                <Briefcase className="w-7 h-7" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">I'm a Client</h3>
                                            <p className="text-slate-500 text-sm leading-relaxed">I want to post jobs and find the best talent for my business.</p>
                                            {role === 'CLIENT' && (
                                                <motion.div layoutId="check" className="absolute top-6 right-6 text-indigo-500">
                                                    <Check className="w-6 h-6" />
                                                </motion.div>
                                            )}
                                        </Card>
                                    </div>

                                    <Button
                                        disabled={!role}
                                        onClick={nextStep}
                                        className="w-full py-5 text-lg"
                                        rightIcon={<ArrowRight className="w-5 h-5" />}
                                    >
                                        Get Started
                                    </Button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    variants={stepVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="space-y-8"
                                >
                                    <div className="text-center space-y-3">
                                        <h2 className="text-4xl font-bold text-white tracking-tight">Basic Information</h2>
                                        <p className="text-slate-400 text-lg">Let's start with the essentials.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <Input
                                                label="First Name"
                                                placeholder="John"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            />
                                            <Input
                                                label="Last Name"
                                                placeholder="Doe"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            />
                                        </div>
                                        <Input
                                            label="Phone Number"
                                            placeholder="+1 (555) 000-0000"
                                            leftIcon={<Phone className="w-4 h-4" />}
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                        <Input
                                            label="Country"
                                            placeholder="United States"
                                            leftIcon={<Globe className="w-4 h-4" />}
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={prevStep} className="flex-1">Back</Button>
                                        <Button
                                            disabled={!formData.firstName || !formData.lastName || !formData.country}
                                            onClick={nextStep}
                                            className="flex-[2]"
                                        >
                                            Continue
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    variants={stepVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="space-y-8"
                                >
                                    <div className="text-center space-y-3">
                                        <h2 className="text-4xl font-bold text-white tracking-tight">
                                            {role === 'FREELANCER' ? 'Professional Details' : 'Company Details'}
                                        </h2>
                                        <p className="text-slate-400 text-lg">Help others know what you do.</p>
                                    </div>

                                    <div className="space-y-6">
                                        {role === 'FREELANCER' ? (
                                            <>
                                                <Input
                                                    label="Professional Title"
                                                    placeholder="Full Stack Developer"
                                                    leftIcon={<Award className="w-4 h-4" />}
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                />
                                                <Input
                                                    label="Hourly Rate ($)"
                                                    type="number"
                                                    placeholder="50"
                                                    value={formData.hourlyRate}
                                                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                                />
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-400 ml-1">Skills (comma separated)</label>
                                                    <Input
                                                        placeholder="React, Node.js, TypeScript"
                                                        onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Input
                                                    label="Company Name"
                                                    placeholder="TechFlow Inc."
                                                    leftIcon={<Building2 className="w-4 h-4" />}
                                                    value={formData.companyName}
                                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                />
                                                <Input
                                                    label="Industry"
                                                    placeholder="Software Development"
                                                    value={formData.industry}
                                                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                                />
                                            </>
                                        )}
                                    </div>

                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={prevStep} className="flex-1">Back</Button>
                                        <Button
                                            isLoading={loading}
                                            onClick={handleComplete}
                                            className="flex-[2]"
                                        >
                                            Complete Setup
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

