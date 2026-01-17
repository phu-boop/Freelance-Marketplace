'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Briefcase,
    DollarSign,
    MapPin,
    Clock,
    Plus,
    X,
    Tags,
    Loader2,
    CheckCircle2,
    Upload
} from 'lucide-react';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';

export default function PostJobPage() {
    const { userId } = useKeycloak();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: '',
        categoryId: '',
        location: 'Remote',
        type: 'FIXED_PRICE',
        skills: [] as string[],
        currentSkill: '',
        preferredCommunicationStyle: 'Proactive',
        attachments: [] as string[]
    });

    const [uploading, setUploading] = useState(false);

    React.useEffect(() => {
        api.get('/jobs/categories').then(res => setCategories(res.data)).catch(console.error);
    }, []);

    const handleAddSkill = () => {
        if (formData.currentSkill && !formData.skills.includes(formData.currentSkill)) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, prev.currentSkill],
                currentSkill: ''
            }));
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const uploadData = new FormData();
            uploadData.append('file', file);
            // Assuming direct access or proxy
            const res = await api.post('/storage/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({
                ...prev,
                attachments: [...prev.attachments, res.data.fileName]
            }));
        } catch (err) {
            console.error('Upload failed', err);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/jobs', {
                title: formData.title,
                description: formData.description,
                budget: parseFloat(formData.budget),
                client_id: userId,
                categoryId: formData.categoryId || null,
                location: formData.location,
                type: formData.type,
                preferredCommunicationStyle: formData.preferredCommunicationStyle,
                skills: formData.skills,
                attachments: formData.attachments
            });
            setSuccess(true);
            setTimeout(() => {
                router.push('/my-jobs');
            }, 2000);
        } catch (err) {
            console.error('Failed to post job', err);
            setError('Failed to post job. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Helper to render hierarchical options
    const renderCategoryOptions = (parentId: string | null = null, level = 0): React.ReactNode[] => {
        return categories
            .filter(cat => cat.parentId === parentId)
            .flatMap(cat => [
                <option key={cat.id} value={cat.id}>
                    {'\u00A0'.repeat(level * 4)}{level > 0 ? '└ ' : ''}{cat.name}
                </option>,
                ...renderCategoryOptions(cat.id, level + 1)
            ]);
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center"
                >
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white">Job Posted Successfully!</h2>
                <p className="text-slate-400">Redirecting to your jobs...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">Post a New Job</h1>
                <p className="text-slate-400">Find the perfect talent for your project.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Job Title</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Senior React Developer"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Category</label>
                            <div className="relative">
                                <Tags className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <select
                                    required
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none"
                                >
                                    <option value="">Select a category</option>
                                    {renderCategoryOptions()}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Budget ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="number"
                                    required
                                    placeholder="e.g. 5000"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Job Type</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none"
                                >
                                    <option value="FIXED_PRICE">Fixed Price</option>
                                    <option value="HOURLY">Hourly</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Preferred Communication Style</label>
                        <div className="relative">
                            <Tags className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <select
                                value={formData.preferredCommunicationStyle}
                                onChange={(e) => setFormData({ ...formData, preferredCommunicationStyle: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none"
                            >
                                <option value="Proactive">Proactive (Daily updates, asks questions)</option>
                                <option value="Formal">Formal (Professional milestones, reporting)</option>
                                <option value="Concise">Concise (Result-oriented, minimal chatter)</option>
                                <option value="Casual">Casual (Friendly, easy-going)</option>
                                <option value="Instructional">Instructional (Follows detailed specs closely)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                required
                                placeholder="e.g. Remote, New York, NY"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-300">Description</label>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!formData.description) return alert('Please enter a description first');
                                    setLoading(true);
                                    try {
                                        const res = await api.post('/jobs/ai/scope', {
                                            description: formData.description,
                                            budget: parseFloat(formData.budget) || undefined
                                        });
                                        setAiSuggestions(res.data);
                                    } catch (err) {
                                        console.error('AI Suggestion failed', err);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="text-xs font-semibold bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-all flex items-center gap-2"
                            >
                                <Loader2 className={`w-3 h-3 ${loading ? 'animate-spin' : 'hidden'}`} />
                                ✨ AI Scoping Assistant
                            </button>
                        </div>
                        <textarea
                            required
                            rows={6}
                            placeholder="Describe the project requirements, responsibilities, and what you're looking for..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                        />

                        {aiSuggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-3"
                            >
                                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">AI Suggested Milestones</h4>
                                <div className="grid gap-2">
                                    {aiSuggestions.map((m: any, i: number) => (
                                        <div key={i} className="text-sm p-3 rounded-lg bg-slate-950/50 border border-slate-800/50 flex justify-between items-center">
                                            <div>
                                                <div className="font-medium text-white">{m.title}</div>
                                                <div className="text-xs text-slate-500">{m.description}</div>
                                            </div>
                                            <div className="text-blue-400 font-bold">{m.percentage}%</div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-500 italic text-center">These milestones can be used when creating the contract or drafting the offer.</p>
                            </motion.div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Attachments</label>
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center gap-2 transition-colors">
                                <Upload className="w-4 h-4" />
                                {uploading ? 'Uploading...' : 'Upload File'}
                                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {formData.attachments.map((file, i) => (
                                    <span key={i} className="text-sm text-slate-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                                        {file}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Required Skills</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add a skill (e.g. React)"
                                value={formData.currentSkill}
                                onChange={(e) => setFormData({ ...formData, currentSkill: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                            <button
                                type="button"
                                onClick={handleAddSkill}
                                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {formData.skills.map((skill) => (
                                <span key={skill} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm border border-blue-500/20 flex items-center gap-2">
                                    {skill}
                                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-white">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Post Job'}
                    </button>
                </div>
            </form>
        </div>
    );
}
