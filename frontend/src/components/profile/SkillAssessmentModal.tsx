'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, XCircle, BrainCircuit, Sparkles, ArrowRight, ClipboardCheck } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { SkillResultStats } from './SkillResultStats';

interface Question {
    question: string;
    type: string;
}

interface Assessment {
    id: string;
    skillName: string;
    questions: Question[];
    status: string;
    score?: number;
}

interface SkillAssessmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    skillName: string;
    onComplete?: () => void;
}

export const SkillAssessmentModal: React.FC<SkillAssessmentModalProps> = ({
    isOpen,
    onClose,
    userId,
    skillName,
    onComplete
}) => {
    const [step, setStep] = useState<'intro' | 'loading' | 'quiz' | 'evaluating' | 'result'>('intro');
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [result, setResult] = useState<{ score: number; feedback: string } | null>(null);

    const startAssessment = async () => {
        setStep('loading');
        try {
            const res = await api.post(`/users/${userId}/assessments`, { skillName });
            setAssessment(res.data);
            setStep('quiz');
        } catch (error) {
            toast.error('Failed to generate assessment. Try again later.');
            setStep('intro');
        }
    };

    const handleSubmit = async () => {
        if (!assessment) return;
        setStep('evaluating');
        try {
            const res = await api.post(`/users/assessments/${assessment.id}/submit`, { answers: Object.values(answers) });
            setResult({ score: res.data.score, feedback: res.data.feedback });
            setStep('result');
            if (onComplete) onComplete();
        } catch (error) {
            toast.error('Failed to submit assessment.');
            setStep('quiz');
        }
    };

    const handleClose = () => {
        setStep('intro');
        setAssessment(null);
        setAnswers({});
        setResult(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-xl bg-slate-950 border-slate-800 text-white shadow-2xl overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-black italic uppercase tracking-tighter">
                        <BrainCircuit className="w-6 h-6 text-purple-500" />
                        AI Skill Verification: <span className="text-purple-500">{skillName}</span>
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Prove your expertise and earn a verified badge.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 min-h-[300px]">
                    {step === 'intro' && (
                        <div className="space-y-6 text-center">
                            <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mx-auto border border-purple-500/20">
                                <Sparkles className="w-10 h-10 text-purple-500" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-lg font-bold">Ready to be verified?</h4>
                                <p className="text-sm text-slate-400 max-w-sm mx-auto">
                                    Our AI will generate 5 technical questions to test your knowledge in {skillName}.
                                    A score of 80% or higher is required for the <span className="text-white font-bold">SKILL VERIFIED</span> badge.
                                </p>
                            </div>
                            <Button onClick={startAssessment} className="w-full bg-purple-600 hover:bg-purple-500 h-12 text-lg font-black uppercase italic">
                                Start Assessment <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    )}

                    {step === 'loading' && (
                        <div className="flex flex-col items-center justify-center space-y-4 py-12">
                            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                            <p className="text-slate-400 animate-pulse font-medium">Gemini is curating questions for you...</p>
                        </div>
                    )}

                    {step === 'quiz' && assessment && (
                        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                            {assessment.questions.map((q, idx) => (
                                <div key={idx} className="space-y-3 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                                    <p className="text-sm font-bold text-slate-200">
                                        <span className="text-purple-500 mr-2">Q{idx + 1}.</span> {q.question}
                                    </p>
                                    <textarea
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all text-sm resize-none"
                                        rows={2}
                                        placeholder="Type your answer here..."
                                        value={answers[idx] || ''}
                                        onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                                    />
                                </div>
                            ))}
                            <Button
                                onClick={handleSubmit}
                                disabled={Object.keys(answers).length < assessment.questions.length}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 h-12 font-black uppercase italic mt-4"
                            >
                                Submit Answers <ClipboardCheck className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    )}

                    {step === 'evaluating' && (
                        <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
                            <div className="relative">
                                <BrainCircuit className="w-16 h-16 text-emerald-500 animate-pulse" />
                                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-bold text-white">Evaluating your answers...</p>
                                <p className="text-sm text-slate-500 italic">Gemini is grading your technical depth.</p>
                            </div>
                        </div>
                    )}

                    {step === 'result' && result && (
                        <div className="space-y-6">
                            <SkillResultStats score={result.score} feedback={result.feedback} />
                            <div className="flex flex-col gap-2">
                                {result.score >= 80 ? (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-sm font-medium">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Congratulations! The Skill Verified badge has been added to your profile.
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                                        <XCircle className="w-4 h-4" />
                                        You need at least 80% to earn the badge. Brush up and try again!
                                    </div>
                                )}
                                <Button onClick={handleClose} variant="outline" className="w-full">
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
