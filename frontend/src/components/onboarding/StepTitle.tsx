'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StepTitleProps {
    value: string;
    onChange: (val: string) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function StepTitle({ value, onChange, onNext, onBack }: StepTitleProps) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">
                What is your professional title?
            </h2>
            <p className="text-slate-400">
                This helps clients matches you with the right jobs.
            </p>

            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="e.g. Senior Full Stack Developer"
                className="bg-slate-900 border-slate-700 text-lg p-6 h-auto"
                autoFocus
            />

            <div className="flex justify-between pt-6">
                <Button variant="ghost" onClick={onBack}>Back</Button>
                <Button onClick={onNext} disabled={!value.trim()}>Next</Button>
            </div>
        </div>
    );
}
