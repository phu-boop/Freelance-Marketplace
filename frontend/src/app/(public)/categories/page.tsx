'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Code,
    Palette,
    BarChart,
    Globe,
    Video,
    PenTool,
    Database,
    Smartphone,
    Briefcase,
    ArrowLeft,
    Loader2,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface Category {
    id: string;
    name: string;
    description: string;
    slug: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/common/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Failed to fetch categories', error);
                // Fallback mock data
                setCategories([
                    { id: '1', name: 'Development & IT', slug: 'dev-it', description: 'Software, web, and mobile development.' },
                    { id: '2', name: 'Design & Creative', slug: 'design', description: 'Graphic, UI/UX, and brand design.' },
                    { id: '3', name: 'Sales & Marketing', slug: 'marketing', description: 'SEO, social media, and digital marketing.' },
                    { id: '4', name: 'Writing & Translation', slug: 'writing', description: 'Content writing, editing, and translation.' },
                    { id: '5', name: 'Admin & Customer Support', slug: 'admin', description: 'Virtual assistants and customer service.' },
                    { id: '6', name: 'Finance & Accounting', slug: 'finance', description: 'Bookkeeping, tax, and financial planning.' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const getIcon = (slug: string) => {
        switch (slug) {
            case 'dev-it': return <Code className="w-6 h-6" />;
            case 'design': return <Palette className="w-6 h-6" />;
            case 'marketing': return <BarChart className="w-6 h-6" />;
            case 'writing': return <PenTool className="w-6 h-6" />;
            case 'admin': return <Database className="w-6 h-6" />;
            case 'finance': return <Globe className="w-6 h-6" />;
            default: return <Briefcase className="w-6 h-6" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                                FreelanceHub
                            </span>
                        </Link>
                        <Link href="/" className="text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Explore Categories</h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-16">
                        Find the right expertise for your project across hundreds of specialized categories.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categories.map((category, idx) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Link
                                    href={`/jobs?category=${category.slug}`}
                                    className="block p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all text-left group"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                            {getIcon(category.slug)}
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-all" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{category.name}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        {category.description}
                                    </p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
                    © 2025 FreelanceHub. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
