'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface StepSkillsProps {
    value: string[];
    onChange: (val: string[]) => void;
    onNext: () => void;
    onBack: () => void;
}

const COMMON_SKILLS = ['React', 'Node.js', 'Typescript', 'Python', 'Go', 'Design', 'Writing', 'Marketing'];

export default function StepSkills({ value, onChange, onNext, onBack }: StepSkillsProps) {
    const [input, setInput] = useState('');

    const addSkill = (skill: string) => {
        if (!value.includes(skill)) {
            onChange([...value, skill]);
        }
        setInput('');
    };

    const removeSkill = (skill: string) => {
        onChange(value.filter(s => s !== skill));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">
                What are your main skills?
            </h2>
            <p className="text-slate-400">
                Add up to 15 skills to show your expertise.
            </p>

            <div className="flex gap-2">
                <input
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Type a skill (e.g. React)"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && input.trim()) {
                            addSkill(input.trim());
                        }
                    }}
                />
                <Button onClick={() => input.trim() && addSkill(input.trim())} disabled={!input.trim()}>
                    <Plus className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex flex-wrap gap-2">
                {value.map(skill => (
                    <div key={skill} className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                        <span>{skill}</span>
                        <button onClick={() => removeSkill(skill)} className="hover:text-white">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-500 mb-2">Suggested:</p>
                <div className="flex flex-wrap gap-2">
                    {COMMON_SKILLS.filter(s => !value.includes(s)).map(skill => (
                        <button
                            key={skill}
                            onClick={() => addSkill(skill)}
                            className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-sm hover:bg-slate-700 hover:text-white transition-colors"
                        >
                            + {skill}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-between pt-6">
                <Button variant="ghost" onClick={onBack}>Back</Button>
                <Button onClick={onNext} disabled={value.length === 0}>Next</Button>
            </div>
        </div>
    );
}
