'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Camera, CheckCircle2, AlertCircle, RefreshCcw, Loader2, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

interface IdentityVerificationProps {
    onComplete?: () => void;
}

export default function IdentityVerification({ onComplete }: IdentityVerificationProps) {
    const [step, setStep] = useState<'intro' | 'scanning' | 'completing' | 'success' | 'error'>('intro');
    const [livenessStep, setLivenessStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    const livenessChecks = [
        "Please look directly at the camera",
        "Slowly turn your head to the left",
        "Slowly turn your head to the right",
        "Nodes once to confirm"
    ];

    useEffect(() => {
        if (step === 'scanning') {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        if (livenessStep < livenessChecks.length - 1) {
                            setLivenessStep(s => s + 1);
                            return 0;
                        } else {
                            clearInterval(interval);
                            completeScannig();
                            return 100;
                        }
                    }
                    return prev + 2;
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [step, livenessStep]);

    const startCamera = async () => {
        setLoading(true);
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setStep('scanning');
        } catch (err) {
            console.error('Camera access denied', err);
            setError('Camera access is required for identity verification.');
            setStep('error');
        } finally {
            setLoading(false);
        }
    };

    const completeScannig = async () => {
        setStep('completing');
        try {
            // Simulate processing and backend update
            await new Promise(resolve => setTimeout(resolve, 2000));
            await api.post('/users/kyc/video', { success: true });
            setStep('success');
            if (onComplete) onComplete();
        } catch (err) {
            setError('Verification failed. Please try again.');
            setStep('error');
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };

    useEffect(() => {
        return () => stopCamera();
    }, []);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-w-md w-full mx-auto">
            <div className="p-8 text-center">
                <AnimatePresence mode="wait">
                    {step === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                                <Shield className="w-10 h-10 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Identity Verification</h3>
                                <p className="text-slate-400 mt-2">
                                    To ensure platform safety, we need to verify your identity using a quick liveness test.
                                </p>
                            </div>
                            <div className="space-y-3 pt-4">
                                <div className="flex items-center gap-3 text-sm text-slate-300 text-left bg-slate-800/50 p-3 rounded-xl">
                                    <Camera className="w-5 h-5 text-blue-400 shrink-0" />
                                    <span>Requires camera access for a 30-second video check.</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-300 text-left bg-slate-800/50 p-3 rounded-xl">
                                    <Shield className="w-5 h-5 text-green-400 shrink-0" />
                                    <span>Your data is encrypted and handled securely.</span>
                                </div>
                            </div>
                            <button
                                onClick={startCamera}
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Start Verification"}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    )}

                    {step === 'scanning' && (
                        <motion.div
                            key="scanning"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <div className="relative aspect-square max-w-[280px] mx-auto rounded-full overflow-hidden border-4 border-blue-500/30">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover grayscale brightness-110"
                                />
                                <div className="absolute inset-0 border-[20px] border-slate-900 pointer-events-none rounded-full" />

                                {/* Scanning Overlay */}
                                <motion.div
                                    className="absolute inset-0 bg-blue-500/10"
                                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />

                                {/* Progress Ring */}
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle
                                        cx="50%"
                                        cy="50%"
                                        r="48%"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="transparent"
                                        className="text-blue-500"
                                        strokeDasharray={`${progress * 3.14 * 2.8} 1000`}
                                    />
                                </svg>
                            </div>

                            <div className="space-y-2">
                                <p className="text-blue-400 font-bold uppercase tracking-widest text-xs">Step {livenessStep + 1} of {livenessChecks.length}</p>
                                <h4 className="text-xl font-bold text-white h-8">{livenessChecks[livenessStep]}</h4>
                            </div>

                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <motion.div
                                    className="bg-blue-500 h-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((livenessStep * 100) + progress) / livenessChecks.length}%` }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 'completing' && (
                        <motion.div
                            key="completing"
                            className="py-12 space-y-6"
                        >
                            <div className="relative w-24 h-24 mx-auto">
                                <Loader2 className="w-full h-full text-blue-500 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Shield className="w-8 h-8 text-blue-400" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Analyzing Liveness...</h3>
                                <p className="text-slate-400 mt-2">Connecting to our secure verification AI</p>
                            </div>
                        </motion.div>
                    )}

                    {step === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="py-8 space-y-6"
                        >
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-12 h-12 text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Identity Verified</h3>
                                <p className="text-slate-400 mt-2">
                                    Thank you! Your identity has been successfully verified. A "Verified" badge has been added to your profile.
                                </p>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
                            >
                                Back to Profile
                            </button>
                        </motion.div>
                    )}

                    {step === 'error' && (
                        <motion.div
                            key="error"
                            className="py-8 space-y-6"
                        >
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                                <AlertCircle className="w-12 h-12 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Verification Error</h3>
                                <p className="text-red-400/80 mt-2">{error}</p>
                            </div>
                            <button
                                onClick={() => setStep('intro')}
                                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCcw className="w-5 h-5" />
                                Try Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
