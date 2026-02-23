'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, QrCode, CheckCircle2, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';
import { useToast } from '@/components/ui/use-toast';

interface TwoFactorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function TwoFactorModal({ isOpen, onClose, onSuccess }: TwoFactorModalProps) {
    const { userId } = useKeycloak();
    const { toast } = useToast();
    const [step, setStep] = useState<'INITIAL' | 'SCAN' | 'VERIFY' | 'SUCCESS'>('INITIAL');
    const [loading, setLoading] = useState(false);
    const [qrData, setQrData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
    const [code, setCode] = useState('');

    const startSetup = async () => {
        setLoading(true);
        try {
            const res = await api.post(`/users/${userId}/2fa/setup`);
            setQrData(res.data);
            setStep('SCAN');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to start 2FA setup',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const verifyCode = async () => {
        setLoading(true);
        try {
            await api.post(`/users/${userId}/2fa/verify`, { token: code });
            setStep('SUCCESS');
            setTimeout(() => {
                onSuccess();
                onClose();
                setStep('INITIAL');
                setCode('');
            }, 2000);
        } catch (error) {
            toast({
                title: 'Verification Failed',
                description: 'Invalid code. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const copySecret = () => {
        if (qrData?.secret) {
            navigator.clipboard.writeText(qrData.secret);
            toast({ title: 'Secret copied to clipboard' });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-white p-0 overflow-hidden">
                <div className="p-6">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <ShieldCheck className="w-6 h-6 text-blue-500" />
                            Two-Factor Authentication
                        </DialogTitle>
                    </DialogHeader>

                    <div className="mt-6 min-h-[300px] flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                            {step === 'INITIAL' && (
                                <motion.div
                                    key="initial"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6 text-center"
                                >
                                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <QrCode className="w-10 h-10 text-blue-400" />
                                    </div>
                                    <p className="text-slate-400">
                                        Protect your account by adding an extra layer of security.
                                        We will ask for a verification code upon login.
                                    </p>
                                    <Button onClick={startSetup} isLoading={loading} className="w-full">
                                        Get Started
                                    </Button>
                                </motion.div>
                            )}

                            {step === 'SCAN' && qrData && (
                                <motion.div
                                    key="scan"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6 text-center"
                                >
                                    <p className="text-sm text-slate-400">
                                        Scan this QR code with your authenticator app (e.g. Google Authenticator)
                                    </p>
                                    <div className="bg-white p-4 rounded-xl inline-block mx-auto">
                                        <img src={qrData.qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 mix-blend-multiply" />
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 cursor-pointer hover:text-blue-400" onClick={copySecret}>
                                        <Copy className="w-3 h-3" />
                                        <span>Click to copy secret key</span>
                                    </div>
                                    <Button onClick={() => setStep('VERIFY')} className="w-full">
                                        Next
                                    </Button>
                                </motion.div>
                            )}

                            {step === 'VERIFY' && (
                                <motion.div
                                    key="verify"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6 text-center"
                                >
                                    <p className="text-slate-400">
                                        Enter the 6-digit code from your authenticator app.
                                    </p>
                                    <Input
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="000 000"
                                        className="text-center text-2xl tracking-[0.5em] bg-slate-900 border-slate-700 h-14"
                                        maxLength={6}
                                    />
                                    <div className="flex gap-3">
                                        <Button variant="ghost" onClick={() => setStep('SCAN')} className="flex-1">Back</Button>
                                        <Button onClick={verifyCode} isLoading={loading} className="flex-1">Verify</Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'SUCCESS' && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6 text-center"
                                >
                                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">2FA Enabled!</h3>
                                    <p className="text-slate-400">
                                        Your account is now more secure.
                                    </p>
                                    {/* Will close automatically via timeout */}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
