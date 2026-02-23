'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Briefcase, Building } from 'lucide-react';

interface StepWelcomeProps {
    onNext: () => void;
    role: 'FREELANCER' | 'CLIENT';
}

export default function StepWelcome({ onNext, role }: StepWelcomeProps) {
    const isFreelancer = role === 'FREELANCER';

    return (
        <div className="text-center space-y-6">
            <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center ${isFreelancer ? 'bg-blue-500/10' : 'bg-green-500/10'}`}>
                {isFreelancer ? (
                    <Sparkles className="w-12 h-12 text-blue-400" />
                ) : (
                    <Building className="w-12 h-12 text-green-400" />
                )}
            </div>

            <h1 className="text-4xl font-bold text-white">
                Welcome to FreelanceHub!
            </h1>

            <p className="text-lg text-slate-400 max-w-lg mx-auto">
                {isFreelancer
                    ? "Let's set up your profile so you can start finding amazing jobs. It will only take a few minutes."
                    : "Let's set up your company profile so you can hire the best talent."
                }
            </p>

            <div className="pt-6">
                <Button size="lg" onClick={onNext} className="w-full md:w-auto px-12">
                    Get Started
                </Button>
            </div>
        </div>
    );
}
