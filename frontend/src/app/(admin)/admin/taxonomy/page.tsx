'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Tags,
    Briefcase,
    Trash2,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import api from '@/lib/api';

interface Item {
    id: string;
    name: string;
}

export default function AdminTaxonomyPage() {
    const [categories, setCategories] = useState<Item[]>([]);
    const [skills, setSkills] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState('');
    const [newSkill, setNewSkill] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const [catRes, skillRes] = await Promise.all([
                api.get('/jobs/categories'),
                api.get('/jobs/skills')
            ]);
            setCategories(catRes.data);
            setSkills(skillRes.data);
        } catch (error) {
            console.error('Failed to fetch taxonomy data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        setActionLoading('category');
        try {
            await api.post('/jobs/categories', { name: newCategory });
            setNewCategory('');
            await fetchData();
        } catch (error) {
            console.error('Failed to add category', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleAddSkill = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSkill.trim()) return;
        setActionLoading('skill');
        try {
            await api.post('/jobs/skills', { name: newSkill });
            setNewSkill('');
            await fetchData();
        } catch (error) {
            console.error('Failed to add skill', error);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold text-white">Taxonomy Management</h1>
                <p className="text-slate-400">Manage job categories and required skills.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Categories Section */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                <Tags className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Job Categories</h3>
                        </div>

                        <form onSubmit={handleAddCategory} className="flex gap-2">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="New category name..."
                                className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={actionLoading === 'category' || !newCategory.trim()}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-bold flex items-center gap-2 transition-all"
                            >
                                {actionLoading === 'category' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Add
                            </button>
                        </form>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {categories.map((cat) => (
                                <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/50 group hover:border-blue-500/30 transition-all">
                                    <span className="text-slate-300">{cat.name}</span>
                                    <button className="p-2 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Skills Section */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Required Skills</h3>
                        </div>

                        <form onSubmit={handleAddSkill} className="flex gap-2">
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="New skill name..."
                                className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={actionLoading === 'skill' || !newSkill.trim()}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white rounded-xl font-bold flex items-center gap-2 transition-all"
                            >
                                {actionLoading === 'skill' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Add
                            </button>
                        </form>

                        <div className="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {skills.map((skill) => (
                                <div key={skill.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 group hover:border-purple-500/30 transition-all">
                                    <span className="text-sm text-slate-300">{skill.name}</span>
                                    <button className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
