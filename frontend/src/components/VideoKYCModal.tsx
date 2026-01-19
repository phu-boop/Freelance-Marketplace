'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Camera, StopCircle, RefreshCw, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';

interface VideoKYCModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: string;
}

export const VideoKYCModal = ({ isOpen, onClose, onSuccess, userId }: VideoKYCModalProps) => {
    const [step, setStep] = useState<'intro' | 'recording' | 'review' | 'success'>('intro');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(5);
    const [error, setError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

    useEffect(() => {
        if (!isOpen) {
            stopCamera();
            setStep('intro');
            setRecordedChunks([]);
        }
    }, [isOpen]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setStep('recording');
            startRecording(stream);
        } catch (err) {
            console.error('Camera access denied', err);
            setError('Camera access denied. Please enable camera permissions.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const startRecording = (stream: MediaStream) => {
        setRecordedChunks([]);
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                setRecordedChunks((prev) => [...prev, event.data]);
            }
        };

        mediaRecorder.onstop = () => {
            setStep('review');
        };

        mediaRecorder.start();

        let timer = 5;
        setTimeLeft(timer);
        const interval = setInterval(() => {
            timer -= 1;
            setTimeLeft(timer);
            if (timer <= 0) {
                clearInterval(interval);
                mediaRecorder.stop();
                stopCamera();
            }
        }, 1000);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            // In a real app, we'd upload the video blob. 
            // Here we simulate it by sending a success signal to our new endpoint.
            const blob = new Blob(recordedChunks, { type: 'video/webm' });

            await api.post(`/users/${userId}/kyc/video`, {
                videoBlob: 'simulated-blob-data', // Simulation
                timestamp: new Date().toISOString()
            });

            setStep('success');
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (err: any) {
            console.error('Failed to submit kyc', err);
            setError(err.response?.data?.message || 'Failed to submit verification');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden relative"
            >
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Video Identity Check</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {step === 'intro' && (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center space-y-6"
                            >
                                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                                    <Video className="w-10 h-10 text-blue-500" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium text-white">Liveness Verification</h3>
                                    <p className="text-slate-400 text-sm">
                                        Please look into the camera and follow the instructions. This will take only 5 seconds.
                                    </p>
                                </div>
                                <Button onClick={startCamera} className="w-full bg-blue-600 hover:bg-blue-500 h-12 text-lg">
                                    Start Camera
                                </Button>
                            </motion.div>
                        )}

                        {step === 'recording' && (
                            <motion.div
                                key="recording"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-700">
                                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse">
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                        REC {timeLeft}s
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-32 h-44 border-2 border-dashed border-white/30 rounded-full" />
                                    </div>
                                </div>
                                <p className="text-center text-sm text-slate-300">
                                    Position your face inside the frame and keep still.
                                </p>
                            </motion.div>
                        )}

                        {step === 'review' && (
                            <motion.div
                                key="review"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center space-y-6"
                            >
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium text-white">Video Captured</h3>
                                    <p className="text-slate-400 text-sm">
                                        We've captured your short identity check video. Click confirm to complete verification.
                                    </p>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <Button variant="outline" onClick={() => setStep('intro')} className="flex-1 border-slate-700 text-slate-300">
                                        Try Again
                                    </Button>
                                    <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500">
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Confirm'}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-6 py-4"
                            >
                                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-white">Verified!</h3>
                                    <p className="text-slate-400">
                                        Your identity has been verified successfully.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
