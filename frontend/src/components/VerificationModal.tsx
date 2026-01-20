
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, UploadCloud, FileCheck, Camera, FileText } from 'lucide-react';
import api from '@/lib/api';
import IdentityVerification from './IdentityVerification';

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: string;
}

export function VerificationModal({ isOpen, onClose, onSuccess, userId }: VerificationModalProps) {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [method, setMethod] = useState<'document' | 'video'>('document');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.size > 5 * 1024 * 1024) {
            alert('File must be smaller than 5MB');
            return;
        }

        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleSubmit = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await api.post('/storage/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { fileName } = uploadRes.data;
            const urlRes = await api.get(`/storage/url/${fileName}`);
            const { url } = urlRes.data;

            await api.post(`/users/${userId}/kyc/document`, {
                idDocument: url
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to submit KYC document', error);
            alert('Failed to submit verification document. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Verify Identity</h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="flex bg-slate-800/50 p-1 rounded-xl">
                            <button
                                onClick={() => setMethod('document')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${method === 'document' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <FileText className="w-4 h-4" />
                                Document
                            </button>
                            <button
                                onClick={() => setMethod('video')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${method === 'video' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <Camera className="w-4 h-4" />
                                Video KYC
                            </button>
                        </div>

                        {method === 'document' ? (
                            <div className="space-y-6">
                                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
                                    Please upload a clear copy of your government-issued ID (Passport, Driver's License, or National ID).
                                    Your information is securely stored and only used for verification.
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-medium text-slate-400">Upload ID Document</label>
                                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 hover:bg-slate-800/50 transition-all text-center cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        {file ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <FileCheck className="w-10 h-10 text-emerald-500" />
                                                <span className="text-sm font-medium text-emerald-500">{file.name}</span>
                                                <span className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <UploadCloud className="w-10 h-10 text-slate-500" />
                                                <span className="text-sm text-slate-400">Click to upload or drag and drop</span>
                                                <span className="text-xs text-slate-600">JPG, PNG, PDF up to 5MB</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || !file}
                                        className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Verification'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="pb-4">
                                <IdentityVerification onComplete={() => {
                                    onSuccess();
                                    setTimeout(onClose, 2000);
                                }} />
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
