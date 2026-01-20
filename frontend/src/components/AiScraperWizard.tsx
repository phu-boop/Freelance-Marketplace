"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Sparkles,
    X,
    Loader2,
    CheckCircle2,
    ClipboardText,
    Wand2,
    ArrowRight,
    FileText
} from "lucide-react"
import api from "@/lib/api"

interface AiScraperWizardProps {
    onComplete: (data: {
        title: string;
        description: string;
        skills: string[];
        milestones: any[];
        suggestedBudget?: string;
    }) => void;
    onClose: () => void;
}

export default function AiScraperWizard({ onComplete, onClose }: AiScraperWizardProps) {
    const [step, setStep] = useState(1);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleScrape = async () => {
        if (!content) return;
        setLoading(true);
        try {
            const res = await api.post("/jobs/ai/scrape", { content });
            const budgetRes = await api.post("/jobs/ai/estimate-budget", { description: res.data.description });

            setResult({
                ...res.data,
                budgetInfo: budgetRes.data
            });
            setStep(2);
        } catch (err) {
            console.error("Scraping failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        onComplete({
            title: result.title,
            description: result.description,
            skills: result.skills,
            milestones: result.milestones,
            suggestedBudget: result.budgetInfo?.suggestedRange?.replace(/[^0-9]/g, '').slice(0, 4) // Simplified extract
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Sparkles className="text-blue-400 w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">AI Project Scraper</h2>
                            <p className="text-xs text-slate-400">Generate a professional job post from raw notes or docs.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Paste your project notes or requirements</label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="e.g. We need a full-stack dev for a crypto dashboard. Must know NextJS, Tailwind and have experience with Web3.js. Project includes design, integration and deployment..."
                                        className="w-full h-48 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none text-sm leading-relaxed"
                                    />
                                </div>

                                <div className="flex justify-between items-center text-xs text-slate-500 italic">
                                    <span>Supported content: PRDs, messy notes, emails, repo Readme text.</span>
                                </div>

                                <button
                                    onClick={handleScrape}
                                    disabled={!content || loading}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Document...</>
                                    ) : (
                                        <><Wand2 className="w-5 h-5" /> Magic Scrape & Format</>
                                    )}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                                    <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                                    <p className="text-sm text-emerald-200/80 font-medium">AI successfully structured your project!</p>
                                </div>

                                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="space-y-1">
                                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">Suggested Title</div>
                                        <div className="text-lg font-bold text-white">{result.title}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">Complexity & Budget</div>
                                        <div className="flex gap-2">
                                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs">
                                                {result.budgetInfo?.complexity} Complexity
                                            </span>
                                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-xs">
                                                Range: {result.budgetInfo?.suggestedRange}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">Key Skills Detected</div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {result.skills.map((s: string) => (
                                                <span key={s} className="px-2 py-1 bg-slate-800 text-slate-300 rounded-md text-[10px]">{s}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">Milestone Roadmap</div>
                                        <div className="space-y-2">
                                            {result.milestones.map((m: any, i: number) => (
                                                <div key={i} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center text-xs">
                                                    <div className="font-medium text-slate-200">{m.title}</div>
                                                    <div className="text-blue-400 font-bold">{m.percentage}%</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all"
                                    >
                                        Back to Edit
                                    </button>
                                    <button
                                        onClick={handleApply}
                                        className="py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 font-mono tracking-tighter"
                                    >
                                        APPLY TO JOB FORM <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
