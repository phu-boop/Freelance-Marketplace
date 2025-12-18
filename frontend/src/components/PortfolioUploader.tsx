'use client';

import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface PortfolioUploaderProps {
    userId: string;
    onUploadComplete: () => void;
}

export function PortfolioUploader({ userId, onUploadComplete }: PortfolioUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleUpload = async () => {
        if (!file || !title) return;

        setUploading(true);
        try {
            // 1. Upload file to Storage Service
            const formData = new FormData();
            formData.append('file', file);
            const uploadRes = await api.post('http://localhost:3000/storage/upload', formData, { // Direct call to storage service via proxy or gateway
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // In a real app, this should go through API Gateway. 
            // For MVP, we might need to expose Storage Service or proxy it.
            // Let's assume the API Gateway routes /storage to the storage service.

            const imageUrl = uploadRes.data.fileName;

            // 2. Add Portfolio Item to User Service
            await api.post(`/users/${userId}/portfolio`, {
                title,
                imageUrl,
                description: 'Uploaded via Portfolio Uploader'
            });

            onUploadComplete();
            setTitle('');
            setFile(null);
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-semibold text-white">Add to Portfolio</h3>

            <div className="space-y-2">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Project Title"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
            </div>

            <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-700 rounded-xl hover:border-slate-500 transition-colors">
                        <Upload className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-400">{file ? file.name : 'Choose Image'}</span>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                </label>

                <button
                    onClick={handleUpload}
                    disabled={!file || !title || uploading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload'}
                </button>
            </div>
        </div>
    );
}
