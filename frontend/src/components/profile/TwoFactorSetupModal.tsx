'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ShieldCheck, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import QRCode from 'qrcode';

interface TwoFactorSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: string;
}

export const TwoFactorSetupModal = ({ isOpen, onClose, onSuccess, userId }: TwoFactorSetupModalProps) => {
    const [step, setStep] = useState<'init' | 'verify' | 'success'>('init');
    const [loading, setLoading] = useState(false);
    const [qrCodeData, setQrCodeData] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setStep('init');
            setVerificationCode('');
            setError(null);
            fetchSetupData();
        }
    }, [isOpen]);

    const fetchSetupData = async () => {
        setLoading(true);
        try {
            const res = await api.post(`/users/${userId}/2fa/setup`);
            // Expecting res.data to contain { secret: string, otpauthUrl: string }
            // If the backend returns just the secret, we might need to construct the otpauth URL manually or generate QR on backend.
            // Assuming backend returns `otpauthUrl` based on previous patterns or standard implied by `qrcode` usage on frontend.
            // Wait, standard practice is helpful. Let's assume standard response.
            // If backend doesn't exist yet, this will fail, but we are in Frontend dev mode.

            // Backend returns { secret, qrCodeUrl }
            if (res.data.qrCodeUrl) {
                setQrCodeData(res.data.qrCodeUrl);
                setSecret(res.data.secret);
            } else if (res.data.otpauthUrl) {
                // Fallback: Generate QR on client
                const url = await QRCode.toDataURL(res.data.otpauthUrl);
                setQrCodeData(url);
                setSecret(res.data.secret);
            }
        } catch (err: any) {
            console.error('Failed to init 2FA', err);
            setError('Failed to initialize 2FA setup. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.post(`/users/${userId}/2fa/verify`, { token: verificationCode });
            setStep('success');
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (err: any) {
            console.error('Verification failed', err);
            setError('Invalid verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copySecret = () => {
        if (secret) {
            navigator.clipboard.writeText(secret);
            // Could add a toast here
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-blue-500" />
                            Setup 2FA
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8">
                        {step === 'init' && (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <p className="text-slate-400 text-sm">
                                        Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                                    </p>
                                </div>

                                <div className="flex justify-center">
                                    {loading && !qrCodeData ? (
                                        <div className="w-48 h-48 flex items-center justify-center bg-slate-950/50 rounded-2xl border border-slate-800">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                        </div>
                                    ) : qrCodeData ? (
                                        <div className="p-4 bg-white rounded-2xl">
                                            <img src={qrCodeData} alt="2FA QR Code" className="w-40 h-40" />
                                        </div>
                                    ) : (
                                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm">
                                            Failed to load QR Code.
                                        </div>
                                    )}
                                </div>

                                {secret && (
                                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3">
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Backup Key</p>
                                            <p className="text-white font-mono text-sm truncate">{secret}</p>
                                        </div>
                                        <button
                                            onClick={copySecret}
                                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                                            title="Copy Secret"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={() => setStep('verify')}
                                    disabled={!qrCodeData}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all"
                                >
                                    Continue to Verify
                                </button>
                            </div>
                        )}

                        {step === 'verify' && (
                            <form onSubmit={handleVerify} className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h3 className="text-white font-bold text-lg">Verify Code</h3>
                                    <p className="text-slate-400 text-sm">
                                        Enter the 6-digit code from your authenticator app to confirm setup.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        maxLength={6}
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="000 000"
                                        className="w-full text-center text-3xl font-mono tracking-[0.5em] py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:outline-none focus:border-blue-500 transition-all placeholder:tracking-normal placeholder:text-slate-700"
                                    />
                                    {error && (
                                        <div className="flex items-center gap-2 justify-center text-red-400 text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep('init')}
                                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || verificationCode.length !== 6}
                                        className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Enable'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {step === 'success' && (
                            <div className="py-8 text-center space-y-4">
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">2FA Enabled!</h3>
                                <p className="text-slate-400">
                                    Your account is now more secure. You will be asked for a code when you log in.
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
