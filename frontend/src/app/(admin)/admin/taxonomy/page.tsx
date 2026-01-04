'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Tags,
    Briefcase,
    Trash2,
    Loader2,
    CheckCircle2,
    Edit2,
    X,
    Check,
    AlertCircle
} from 'lucide-react';
import api from '@/lib/api';

interface Item {
    id: string;
    name: string;
    parentId?: string | null;
    children?: Item[];
}

export default function AdminTaxonomyPage() {
    const [categories, setCategories] = useState<Item[]>([]);
    const [skills, setSkills] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState('');
    const [parentCategoryId, setParentCategoryId] = useState<string>('');
    const [newSkill, setNewSkill] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Edit State
    const [editingCategory, setEditingCategory] = useState<{ id: string; name: string; parentId?: string | null } | null>(null);
    const [editingSkill, setEditingSkill] = useState<{ id: string; name: string } | null>(null);

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
            await api.post('/jobs/categories', {
                name: newCategory,
                parentId: parentCategoryId || null
            });
            setNewCategory('');
            setParentCategoryId('');
            await fetchData();
            await fetchData();
            setError(null);
        } catch (err: any) {
            console.error('Failed to add category', err);
            setError(err.response?.data?.message || 'Failed to add category');
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
            await fetchData();
            setError(null);
        } catch (err: any) {
            console.error('Failed to add skill', err);
            setError(err.response?.data?.message || 'Failed to add skill');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Delete this category?')) return;
        try {
            await api.delete(`/jobs/categories/${id}`);
            fetchData();
        } catch (error) {
            console.error('Failed to delete category', error);
        }
    };

    const handleDeleteSkill = async (id: string) => {
        if (!confirm('Delete this skill?')) return;
        try {
            await api.delete(`/jobs/skills/${id}`);
            fetchData();
        } catch (error) {
            console.error('Failed to delete skill', error);
        }
    };

    const handleUpdateCategory = async () => {
        if (!editingCategory || !editingCategory.name.trim()) return;
        try {
            await api.patch(`/jobs/categories/${editingCategory.id}`, {
                name: editingCategory.name,
                parentId: editingCategory.parentId
            });
            setEditingCategory(null);
            setError(null);
            fetchData();
        } catch (err: any) {
            console.error('Failed to update category', err);
            setError(err.response?.data?.message || 'Failed to update category');
        }
    };

    const handleUpdateSkill = async () => {
        if (!editingSkill || !editingSkill.name.trim()) return;
        try {
            await api.patch(`/jobs/skills/${editingSkill.id}`, {
                name: editingSkill.name
            });
            setEditingSkill(null);
            setError(null);
            fetchData();
        } catch (err: any) {
            console.error('Failed to update skill', err);
            setError(err.response?.data?.message || 'Failed to update skill');
        }
    };

    // Helper to render hierarchical categories
    const renderCategories = (parentId: string | null = null, level = 0) => {
        return categories
            .filter(cat => cat.parentId === parentId)
            .map(cat => (
                <React.Fragment key={cat.id}>
                    <div
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/50 group hover:border-blue-500/30 transition-all"
                        style={{ marginLeft: `${level * 24}px` }}
                    >
                        <div className="flex items-center gap-2 flex-1">
                            {level > 0 && <span className="text-slate-600">└─</span>}
                            {editingCategory?.id === cat.id ? (
                                <div className="flex items-center gap-2 flex-1">
                                    <input
                                        type="text"
                                        value={editingCategory.name}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                        className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                                        autoFocus
                                    />
                                    <button onClick={handleUpdateCategory} className="p-1 text-green-500 hover:text-green-400">
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setEditingCategory(null)} className="p-1 text-slate-500 hover:text-slate-400">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <span className="text-slate-300">{cat.name}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setEditingCategory(cat)}
                                className="p-2 text-slate-600 hover:text-blue-400 transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    {renderCategories(cat.id, level + 1)}
                </React.Fragment>
            ));
    };

    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold text-white">Taxonomy Management</h1>
                <p className="text-slate-400">Manage job categories and required skills.</p>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

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

                        <form onSubmit={handleAddCategory} className="space-y-3">
                            <div className="flex gap-2">
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
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-bold flex items-center gap-2 transition-all min-w-[100px] justify-center"
                                >
                                    {actionLoading === 'category' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Add
                                </button>
                            </div>

                            <select
                                value={parentCategoryId}
                                onChange={(e) => setParentCategoryId(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 focus:outline-none focus:border-blue-500/50 transition-all text-sm"
                            >
                                <option value="">No Parent (Top Level)</option>
                                {categories
                                    .filter(c => !c.parentId) // Only top-level as parents for simplicity, or allow any? 
                                    // For now allow any but avoid deep recursion in UI simple select
                                    .map(cat => (
                                        <option key={cat.id} value={cat.id}>Parent: {cat.name}</option>
                                    ))
                                }
                            </select>
                        </form>

                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {categories.length === 0 ? (
                                <p className="text-center py-8 text-slate-500">No categories found.</p>
                            ) : (
                                renderCategories()
                            )}
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
                                    {editingSkill?.id === skill.id ? (
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="text"
                                                value={editingSkill.name}
                                                onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                                                className="w-24 px-1 py-0.5 bg-slate-900 border border-slate-700 rounded text-white text-xs focus:outline-none focus:border-purple-500"
                                                autoFocus
                                            />
                                            <button onClick={handleUpdateSkill} className="text-green-500 hover:text-green-400">
                                                <Check className="w-3 h-3" />
                                            </button>
                                            <button onClick={() => setEditingSkill(null)} className="text-slate-500 hover:text-slate-400">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-sm text-slate-300">{skill.name}</span>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditingSkill(skill)}
                                                    className="text-slate-600 hover:text-purple-400 transition-colors"
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSkill(skill.id)}
                                                    className="text-slate-600 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
