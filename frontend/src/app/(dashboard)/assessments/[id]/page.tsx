'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, CheckCircle2, XCircle, ChevronRight, Brain, Shield } from 'lucide-react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function AssessmentCenterPage() {
    const { id } = useParams();
    const router = useRouter();
    const [assessment, setAssessment] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [status, setStatus] = useState<'TAKING' | 'SUBMITTING' | 'RESULT'>('TAKING');
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const fetchAssessment = async () => {
            try {
                const res = await api.get(`/vetting/assessments/${id}`);
                setAssessment(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAssessment();
    }, [id]);

    useEffect(() => {
        if (status === 'TAKING' && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && status === 'TAKING') {
            handleSubmit();
        }
    }, [timeLeft, status]);

    const handleAnswer = (optionIndex: number) => {
        setAnswers({ ...answers, [currentStep]: optionIndex });
    };

    const nextStep = () => {
        if (currentStep < (assessment?.questions?.length || 0) - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setStatus('SUBMITTING');
        try {
            const res = await api.post(`/vetting/assessments/${id}/submit`, { answers });
            setResult(res.data);
            setStatus('RESULT');
        } catch (err) {
            console.error(err);
            setStatus('TAKING');
        }
    };

    if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center"><div className="animate-pulse text-blue-500 font-black tracking-widest uppercase">Initializing Assessment...</div></div>;

    if (status === 'RESULT') {
        const passed = result.status === 'COMPLETED';
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <Card className="max-w-xl w-full p-12 bg-slate-900 border-slate-800 text-center space-y-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
                    <div className={cn("w-24 h-24 rounded-full flex items-center justify-center mx-auto", passed ? "bg-emerald-500/10" : "bg-red-500/10")}>
                        {passed ? <CheckCircle2 className="w-12 h-12 text-emerald-500" /> : <XCircle className="w-12 h-12 text-red-500" />}
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
                            {passed ? 'Assessment passed' : 'Assessment failed'}
                        </h1>
                        <p className="text-slate-400 font-medium">
                            {passed ? 'Congratulations! Your expertise has been verified.' : 'Don\'t worry, you can try again after 24 hours.'}
                        </p>
                    </div>
                    <div className="bg-slate-950 rounded-3xl p-8 flex justify-around items-center border border-slate-800">
                        <div className="text-center">
                            <div className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">Your Score</div>
                            <div className={cn("text-4xl font-black tracking-tighter", passed ? "text-emerald-500" : "text-red-500")}>
                                {result.score}%
                            </div>
                        </div>
                        <div className="w-px h-12 bg-slate-800" />
                        <div className="text-center">
                            <div className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">Req. Score</div>
                            <div className="text-4xl font-black text-white tracking-tighter">70%</div>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/settings/expertise')}
                        className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20 uppercase tracking-widest text-xs"
                    >
                        Back to Expertise Center
                    </button>
                </Card>
            </div>
        );
    }

    const currentQuestion = assessment.questions[currentStep];

    return (
        <div className="min-h-screen bg-slate-950 p-6 flex flex-col">
            {/* Header */}
            <div className="max-w-4xl w-full mx-auto flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">{assessment.skillName}</h2>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Skill Verification Assessment</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 text-white font-black text-xl tracking-tighter">
                            <Timer className={cn("w-5 h-5", timeLeft < 60 ? "text-red-500 animate-pulse" : "text-blue-400")} />
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Time Remaining</div>
                    </div>
                    <div className="w-px h-8 bg-slate-800" />
                    <div className="text-right">
                        <div className="text-white font-black text-xl tracking-tighter">
                            {currentStep + 1} <span className="text-slate-600">/ {assessment.questions.length}</span>
                        </div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Question</div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="max-w-4xl w-full mx-auto h-1.5 bg-slate-900 rounded-full mb-12 overflow-hidden">
                <motion.div
                    className="h-full bg-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / assessment.questions.length) * 100}%` }}
                />
            </div>

            {/* Question Card */}
            <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full space-y-8"
                    >
                        <div className="space-y-4">
                            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Difficulty: {currentQuestion.difficulty}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
                                {currentQuestion.question}
                            </h1>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentQuestion.options.map((option: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    className={cn(
                                        "p-6 rounded-3xl text-left border-2 transition-all flex items-center justify-between group",
                                        answers[currentStep] === idx
                                            ? "bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-500/20"
                                            : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                                    )}
                                >
                                    <span className="font-bold text-lg">{option}</span>
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                                        answers[currentStep] === idx ? "border-white bg-white" : "border-slate-700"
                                    )}>
                                        {answers[currentStep] === idx && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="w-full flex justify-end mt-12">
                    <button
                        onClick={nextStep}
                        disabled={answers[currentStep] === undefined}
                        className={cn(
                            "px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 transition-all",
                            answers[currentStep] === undefined
                                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                : "bg-white text-slate-950 hover:bg-blue-50 transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-white/5"
                        )}
                    >
                        {currentStep === assessment.questions.length - 1 ? 'Finish Assessment' : 'Next Question'}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Security Notice */}
            <div className="max-w-4xl w-full mx-auto py-8 border-t border-slate-900 flex items-center gap-3 text-slate-600">
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.1em]">Assessment Session Secured & Monitored. Do not leave this tab.</span>
            </div>
        </div>
    );
}
