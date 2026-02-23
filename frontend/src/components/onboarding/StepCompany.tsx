'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StepCompanyProps {
    data: any;
    onChange: (data: any) => void;
    onNext: () => void;
    loading?: boolean;
}

export default function StepCompany({ data, onChange, onNext, loading }: StepCompanyProps) {
    const update = (key: string, val: string) => {
        onChange({ ...data, [key]: val });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">
                Tell us about your company.
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Company Name *</label>
                    <Input value={data.companyName} onChange={(e) => update('companyName', e.target.value)} placeholder="Acme Inc." />
                </div>

                <div>
                    <label className="block text-sm text-slate-400 mb-1">Website</label>
                    <Input value={data.website} onChange={(e) => update('website', e.target.value)} placeholder="https://acme.inc" />
                </div>

                <div>
                    <label className="block text-sm text-slate-400 mb-1">Industry *</label>
                    <Input value={data.industry} onChange={(e) => update('industry', e.target.value)} placeholder="e.g. Technology, Healthcare" />
                </div>
            </div>

            <div className="flex justify-end pt-6">
                <Button onClick={onNext} disabled={!data.companyName || !data.industry} isLoading={loading}>
                    Finish Setup
                </Button>
            </div>
        </div>
    );
}
