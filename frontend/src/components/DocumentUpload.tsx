'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface DocumentUploadProps {
    onUploadComplete: (url: string) => void;
    label?: string;
    accept?: string;
    maxSizeMB?: number;
    initialUrl?: string | null;
}

export function DocumentUpload({
    onUploadComplete,
    label = "Upload Document",
    accept = "image/*,application/pdf",
    maxSizeMB = 5,
    initialUrl
}: DocumentUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            if (selectedFile.size > maxSizeMB * 1024 * 1024) {
                setError(`File size must be less than ${maxSizeMB}MB`);
                return;
            }

            setFile(selectedFile);
            setError(null);

            // Create preview if it's an image
            if (selectedFile.type.startsWith('image/')) {
                const url = URL.createObjectURL(selectedFile);
                setPreviewUrl(url);
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setMsg(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // 1. Upload file
            const uploadRes = await api.post('/storage/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const fileName = uploadRes.data.fileName;

            // 2. Get Public URL
            const urlRes = await api.get(`/storage/url/${fileName}`);
            const publicUrl = urlRes.data.url;

            setMsg({ type: 'success', text: 'Document uploaded successfully' });
            onUploadComplete(publicUrl);
        } catch (err) {
            console.error(err);
            setMsg({ type: 'error', text: 'Failed to upload document' });
        } finally {
            setUploading(false);
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreviewUrl(null);
        setError(null);
        setMsg(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                    }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        // Reuse the file select logic potentially
                    }
                }}
            >
                {previewUrl ? (
                    <div className="relative inline-block group">
                        <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg shadow-lg" />
                        <button
                            onClick={clearFile}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : file ? (
                    <div className="flex flex-col items-center gap-2">
                        <FileText className="w-12 h-12 text-blue-500" />
                        <p className="font-medium text-white">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button
                            onClick={clearFile}
                            className="text-xs text-red-400 hover:text-red-300 mt-2"
                        >
                            Remove file
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="w-10 h-10 text-slate-500" />
                        <p className="font-medium text-slate-300">{label}</p>
                        <p className="text-xs text-slate-500">Supported files: JPEG, PNG, PDF (Max {maxSizeMB}MB)</p>
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept={accept}
                    onChange={handleFileSelect}
                />
            </div>

            {error && (
                <p className="text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                </p>
            )}

            {msg && (
                <p className={`text-sm flex items-center gap-2 ${msg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {msg.text}
                </p>
            )}

            {file && !msg && (
                <Button
                    onClick={handleUpload}
                    className="w-full bg-blue-600 hover:bg-blue-500"
                    disabled={uploading}
                >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {uploading ? 'Uploading...' : 'Confirm Upload'}
                </Button>
            )}
        </div>
    );
}
