'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface StepBioProps {
    value: string;
    onChange: (val: string) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function StepBio({ value, onChange, onNext, onBack }: StepBioProps) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">
                Tell us about yourself.
            </h2>
            <p className="text-slate-400">
                Write a professional overview. This is the first thing clients will see on your profile.
            </p>

            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="I am a passionate developer with 5 years of experience..."
                className="w-full bg-slate-900 border-slate-700 rounded-xl p-4 min-h-[200px] text-white focus:outline-none focus:border-blue-500 resize-none"
            />
            <div className="text-right text-xs text-slate-500">
                Min 50 characters. Current: {value.length}
            </div>

            <div className="flex justify-between pt-6">
                <Button variant="ghost" onClick={onBack}>Back</Button>
                <Button onClick={onNext} disabled={value.length < 50}>Next</Button>
            </div>
        </div>
    );
}
