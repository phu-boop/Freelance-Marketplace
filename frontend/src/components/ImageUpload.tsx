'use client';

import React, { useState, useRef } from 'react';
import { Camera, Loader2, X, Check } from 'lucide-react';
import { Button } from './ui/button';
import api from '@/lib/api';
import { useToast } from './ui/use-toast';

interface ImageUploadProps {
    currentImage?: string;
    onUploadSuccess: (url: string) => void;
    className?: string;
    children?: React.ReactNode;
    type?: "avatar" | "coverImage";
}

export default function ImageUpload({ currentImage, onUploadSuccess, className, children, type }: ImageUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                toast({ title: 'File too large', description: 'Maximum size is 5MB', variant: 'destructive' });
                return;
            }
            if (!selectedFile.type.startsWith('image/')) {
                toast({ title: 'Invalid file type', description: 'Please upload an image', variant: 'destructive' });
                return;
            }
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/storage/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Get public URL
            const urlRes = await api.get(`/storage/url/${res.data.fileName}`);
            onUploadSuccess(urlRes.data.url);

            toast({ title: 'Success', description: 'Image updated successfully' });
            setFile(null);
            setPreview(null);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to upload image';
            toast({ title: 'Upload Failed', description: errorMsg, variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };

    const cancelPreview = () => {
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={`relative ${className}`}>
            {children ? (
                <div onClick={triggerFileSelect} className="w-full h-full cursor-pointer">{children}</div>
            ) : (
                type === 'avatar' ? (
                    <div className="group relative w-32 h-32 rounded-3xl overflow-hidden bg-slate-800 border-4 border-slate-950 shadow-xl">
                        <img
                            src={preview || currentImage || '/default-avatar.png'}
                            className="w-full h-full object-cover"
                            alt="Avatar"
                        />

                        <button
                            onClick={triggerFileSelect}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-medium"
                        >
                            <Camera className="w-6 h-6 mb-1" />
                            Change avatar
                        </button>

                        {uploading && (
                            <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="group relative w-full h-full rounded-3xl overflow-hidden bg-slate-800 border-4 border-slate-950 shadow-xl">
                        <img
                            src={preview || currentImage || '/default-avatar.png'}
                            className="w-full h-full object-cover"
                            alt="Avatar"
                        />

                        <button
                            onClick={triggerFileSelect}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-medium"
                        >
                            <Camera className="w-6 h-6 mb-1" />
                            Change
                        </button>

                        {uploading && (
                            <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                            </div>
                        )}
                    </div>
                )
            )}
            <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
            />

            {preview && !uploading && (
                <div className={`absolute z-20 flex gap-2 ${children ? 'top-full mt-2 left-0' : '-bottom-4 left-1/2 -translate-x-1/2'} ${type === "coverImage" ? 'bottom-5' : ''}`}>
                    <Button size="sm" variant="destructive" className="h-8 w-8 p-0 rounded-full" onClick={cancelPreview}>
                        <X className="w-4 h-4" />
                    </Button>
                    <Button size="sm" className="h-8 w-8 p-0 rounded-full bg-green-600 hover:bg-green-500 shadow-lg shadow-green-600/20" onClick={handleUpload}>
                        <Check className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {preview && uploading && (
                <div className={`absolute z-20 ${children ? 'top-full mt-2 left-0' : '-bottom-4 left-1/2 -translate-x-1/2'}`}>
                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center shadow-xl">
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    </div>
                </div>
            )}
        </div>
    );
}
