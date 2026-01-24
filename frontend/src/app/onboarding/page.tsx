'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useKeycloak } from '@/components/KeycloakProvider';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

// Step Components (will be imported, defined inline mostly for now to keep it consolidated if simple)
import StepWelcome from '@/components/onboarding/StepWelcome';
import StepTitle from '@/components/onboarding/StepTitle';
import StepSkills from '@/components/onboarding/StepSkills';
import StepBio from '@/components/onboarding/StepBio';
import StepCompany from '@/components/onboarding/StepCompany';

export default function OnboardingPage() {
    const { roles, authenticated, userId } = useKeycloak();
    const router = useRouter();
    const { toast } = useToast();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        overview: '',
        skills: [] as string[],
        hourlyRate: 0,
        companyName: '',
        industry: '',
        website: ''
    });


    const isFreelancer = roles.includes('FREELANCER');

    // Define steps based on role
    const steps = isFreelancer
        ? ['WELCOME', 'TITLE', 'SKILLS', 'BIO', 'RATE']
        : ['WELCOME', 'COMPANY'];

    const handleNext = async () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            await handleSubmit();
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.patch(`/users/${userId}`, formData);
            toast({ title: 'Profile Setup Complete!', description: 'Redirecting to your dashboard...' });
            // Force a small delay to show success state
            setTimeout(() => {
                if (roles.includes('CLIENT')) {
                    window.location.href = '/client/dashboard';
                } else if (roles.includes('FREELANCER')) {
                    window.location.href = '/dashboard';
                } else {
                    window.location.href = '/admin';
                }
            }, 1000);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save profile. Please try again.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const updateData = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // Render current step
    const renderStep = () => {
        const currentStepName = steps[step];

        switch (currentStepName) {
            case 'WELCOME':
                return <StepWelcome onNext={handleNext} role={isFreelancer ? 'FREELANCER' : 'CLIENT'} />;
            case 'TITLE':
                return <StepTitle value={formData.title} onChange={(v: string) => updateData('title', v)} onNext={handleNext} onBack={handleBack} />;
            case 'SKILLS':
                return <StepSkills value={formData.skills} onChange={(v: string[]) => updateData('skills', v)} onNext={handleNext} onBack={handleBack} />;
            case 'BIO':
                return <StepBio value={formData.overview} onChange={(v: string) => updateData('overview', v)} onNext={handleNext} onBack={handleBack} />;
            case 'RATE':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white">What is your hourly rate?</h2>
                        <input
                            type="number"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-2xl text-white outline-none focus:border-blue-500"
                            placeholder="$0.00"
                            value={formData.hourlyRate || ''}
                            onChange={(e) => updateData('hourlyRate', parseFloat(e.target.value))}
                        />
                        <div className="flex justify-between pt-6">
                            <Button variant="ghost" onClick={handleBack}>Back</Button>
                            <Button onClick={handleNext} isLoading={loading}>Finish Setup</Button>
                        </div>
                    </div>
                );
            case 'COMPANY':
                return <StepCompany data={formData} onChange={setFormData} onNext={handleSubmit} loading={loading} />;
            default:
                return null;
        }
    };

    if (!authenticated) return null;

    return (
        <div className="w-full">
            <div className="mb-8 flex gap-2">
                {steps.map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full bg-slate-800 ${i <= step ? 'bg-blue-500' : ''}`} />
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {renderStep()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
