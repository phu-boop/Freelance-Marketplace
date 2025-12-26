'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Camera, X, Check, Loader2, Upload } from 'lucide-react';
import { getCroppedImg } from '@/lib/cropImage';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface AvatarUploadProps {
    currentAvatar?: string;
    onUpload: (blob: Blob) => Promise<void>;
}

export function AvatarUpload({ currentAvatar, onUpload }: AvatarUploadProps) {
    const [image, setImage] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [showCropper, setShowCropper] = useState(false);

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImage(reader.result as string);
                setShowCropper(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!image || !croppedAreaPixels) return;

        setUploading(true);
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            if (croppedImage) {
                await onUpload(croppedImage);
                setShowCropper(false);
                setImage(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-800 border-4 border-slate-900 shadow-xl relative">
                {currentAvatar ? (
                    <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-8 h-8 text-slate-500" />
                    </div>
                )}

                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Upload className="w-6 h-6 text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                </label>
            </div>

            <AnimatePresence>
                {showCropper && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                        >
                            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">Crop your avatar</h3>
                                <button onClick={() => setShowCropper(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="relative h-80 bg-black">
                                <Cropper
                                    image={image!}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    cropShape="round"
                                    showGrid={false}
                                />
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>Zoom</span>
                                        <span>{Math.round(zoom * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        value={zoom}
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        aria-labelledby="Zoom"
                                        onChange={(e: any) => setZoom(e.target.value)}
                                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowCropper(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleUpload}
                                        disabled={uploading}
                                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white gap-2"
                                    >
                                        {uploading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Check className="w-4 h-4" />
                                        )}
                                        {uploading ? 'Uploading...' : 'Done'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
