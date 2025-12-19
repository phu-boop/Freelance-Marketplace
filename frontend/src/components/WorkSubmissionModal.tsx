'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, FileText, Link as LinkIcon } from 'lucide-react';
import api from '@/lib/api';

interface WorkSubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    contractId: string;
    milestoneId: string;
}

export default function WorkSubmissionModal({
    isOpen,
    onClose,
    onSuccess,
    contractId,
    milestoneId
}: WorkSubmissionModalProps) {
    const [content, setContent] = useState('');
    const [attachments, setAttachments] = useState<string[]>([]);
    const [newAttachment, setNewAttachment] = useState('');
    const [type, setType] = useState<'PROGRESS_REPORT' | 'FINAL_RESULT'>('PROGRESS_REPORT');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/contracts/${contractId}/submit`, {
                milestoneId,
                content,
                attachments,
                type
            });
            onSuccess();
            onClose();
            setContent('');
            setAttachments([]);
        } catch (error) {
            console.error('Failed to submit work', error);
        } finally {
            setLoading(false);
        }
    };

    const addAttachment = () => {
        if (newAttachment && !attachments.includes(newAttachment)) {
            setAttachments([...attachments, newAttachment]);
            setNewAttachment('');
        }
    };

    const removeAttachment = (url: string) => {
        setAttachments(attachments.filter(a => a !== url));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Submit Work</h2>
                            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400">Submission Type</label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setType('PROGRESS_REPORT')}
                                        className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${type === 'PROGRESS_REPORT'
                                                ? 'bg-blue-600 border-blue-500 text-white'
                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                            }`}
                                    >
                                        Progress Report
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType('FINAL_RESULT')}
                                        className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${type === 'FINAL_RESULT'
                                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                            }`}
                                    >
                                        Final Result
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400">Description / Message</label>
                                <textarea
                                    required
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                                    placeholder="Describe the work you've completed..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400">Attachments (URLs)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={newAttachment}
                                        onChange={(e) => setNewAttachment(e.target.value)}
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        placeholder="https://..."
                                    />
                                    <button
                                        type="button"
                                        onClick={addAttachment}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold border border-slate-700 transition-all"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {attachments.map((url) => (
                                        <div key={url} className="flex items-center gap-2 px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300">
                                            <LinkIcon className="w-3 h-3" />
                                            <span className="truncate max-w-[150px]">{url}</span>
                                            <button onClick={() => removeAttachment(url)} className="text-slate-500 hover:text-red-400">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                    Submit Work
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
