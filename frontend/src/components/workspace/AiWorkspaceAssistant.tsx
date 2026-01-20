'use client';

import React, { useState } from 'react';
import { Sparkles, FileText, MessageSquare, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

interface AiWorkspaceAssistantProps {
    contractId: string;
    content: string;
    onApplySuggestion: (newContent: string) => void;
}

export default function AiWorkspaceAssistant({ contractId, content, onApplySuggestion }: AiWorkspaceAssistantProps) {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [toneResult, setToneResult] = useState<any>(null);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const res = await api.post(`/contracts/${contractId}/workspace/ai/analyze`, { content });
            setAnalysis(res.data);
            setToneResult(null);
        } catch (err) {
            console.error('AI Analysis failed', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckTone = async () => {
        setLoading(true);
        try {
            const res = await api.post(`/contracts/${contractId}/workspace/ai/check-tone`, { content });
            setToneResult(res.data);
            setAnalysis(null);
        } catch (err) {
            console.error('Tone check failed', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 h-full flex flex-col gap-4">
            <div className="flex items-center gap-2 text-white font-bold">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>AI Workspace Co-pilot</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={handleAnalyze}
                    disabled={loading || !content}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-xl text-xs text-white font-medium transition-all"
                >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3 text-blue-400" />}
                    Analyze Specs
                </button>
                <button
                    onClick={handleCheckTone}
                    disabled={loading || !content}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-xl text-xs text-white font-medium transition-all"
                >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3 text-emerald-400" />}
                    Check Tone
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                {analysis && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Summary</h4>
                            <p className="text-xs text-slate-300 leading-relaxed">{analysis.summary}</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Suggested Specs</h4>
                            {analysis.suggestedSpecs.map((spec: string, i: number) => (
                                <div key={i} className="group relative p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs text-slate-300 hover:border-blue-500/50 transition-all cursor-pointer">
                                    {spec}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {toneResult && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                        <div className={`p-3 rounded-xl border flex gap-3 ${toneResult.toneRating === 'UNPROFESSIONAL' ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
                            }`}>
                            {toneResult.toneRating === 'UNPROFESSIONAL' ? (
                                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                            ) : (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            )}
                            <div>
                                <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${toneResult.toneRating === 'UNPROFESSIONAL' ? 'text-red-400' : 'text-emerald-400'
                                    }`}>
                                    Tone: {toneResult.toneRating}
                                </h4>
                                <p className="text-xs text-slate-300">
                                    {toneResult.isProfessional ? 'The tone looks great!' : 'Some parts could be improved.'}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Suggestions</h4>
                            {toneResult.suggestions.map((s: string, i: number) => (
                                <div key={i} className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs text-slate-400 italic">
                                    "{s}"
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!analysis && !toneResult && !loading && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 opacity-50">
                        <Sparkles className="w-8 h-8 text-slate-700" />
                        <p className="text-xs text-slate-500">
                            Select an AI tool above to analyze your workspace content
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
