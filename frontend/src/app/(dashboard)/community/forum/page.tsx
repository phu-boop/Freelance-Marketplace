'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Users,
    TrendingUp,
    Search,
    Plus,
    Filter,
    Award,
    Clock,
    ChevronRight,
    ArrowUpCircle,
    Lock,
    Loader2
} from 'lucide-react';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    isExclusive: boolean;
    requiredBadge: string;
}

interface Post {
    id: string;
    title: string;
    authorId: string;
    categoryId: string;
    tags: string[];
    upvotes: number;
    viewCount: number;
    createdAt: string;
    category: Category;
    _count: { comments: number };
}

export default function ForumPage() {
    const { userId } = useKeycloak();
    const [categories, setCategories] = useState<Category[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', categoryId: '', tags: [] as string[] });

    useEffect(() => {
        fetchData();
    }, [selectedCategory]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catsRes, postsRes] = await Promise.all([
                api.get('/community/forum/categories'),
                api.get(`/community/forum/posts${selectedCategory ? `?categoryId=${selectedCategory}` : ''}`)
            ]);
            setCategories(catsRes.data);
            setPosts(postsRes.data);
        } catch (error) {
            console.error('Failed to fetch forum data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/community/forum/posts', newPost);
            setIsCreating(false);
            setNewPost({ title: '', content: '', categoryId: '', tags: [] });
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create post');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 lg:p-12">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-500">
                                <Users className="w-8 h-8" />
                            </div>
                            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Community Forum</h1>
                        </div>
                        <p className="text-slate-400 font-medium max-w-xl">
                            Connect with top-rated freelancers, share industry insights, and grow your professional network.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 px-6 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-2xl transition-all shadow-lg shadow-amber-500/20 uppercase tracking-widest text-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Start Discussion
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar / Categories */}
                    <aside className="lg:col-span-1 space-y-6">
                        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-[2rem] space-y-4">
                            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Filter className="w-3 h-3" />
                                Categories
                            </h2>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-between ${!selectedCategory ? 'bg-amber-500 text-black' : 'text-slate-400 hover:bg-slate-800'}`}
                                >
                                    All Topics
                                    <ChevronRight className="w-4 h-4 opacity-50" />
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-between group ${selectedCategory === cat.id ? 'bg-amber-500 text-black' : 'text-slate-400 hover:bg-slate-800'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {cat.isExclusive && <Lock className="w-3 h-3 text-amber-600" />}
                                            {cat.name}
                                        </div>
                                        <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Exclusive Promo */}
                        <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] text-white space-y-4 shadow-xl shadow-indigo-500/10">
                            <Award className="w-10 h-10 text-white/50" />
                            <h3 className="text-xl font-black uppercase tracking-tight">Top Rated Exclusive</h3>
                            <p className="text-sm text-white/80 leading-relaxed font-medium">
                                Level up your profile to access premium sub-forums and exclusive AMA sessions.
                            </p>
                        </div>
                    </aside>

                    {/* Main Feed */}
                    <main className="lg:col-span-3 space-y-6">
                        {/* Search & Stats */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search discussions, tags, or expertise..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-white font-medium focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                                <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading Discussions...</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {posts.map(post => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-6 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-[2rem] transition-all group cursor-pointer"
                                    >
                                        <div className="flex gap-6">
                                            {/* Vote Column */}
                                            <div className="flex flex-col items-center gap-1 text-slate-500">
                                                <ArrowUpCircle className="w-6 h-6 hover:text-amber-500 transition-colors" />
                                                <span className="font-black text-sm">{post.upvotes}</span>
                                            </div>

                                            {/* Content Column */}
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                        {post.category.name}
                                                    </span>
                                                    <span className="text-slate-600 text-xs flex items-center gap-1 font-bold">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(post.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors leading-tight">
                                                    {post.title}
                                                </h3>
                                                <div className="flex items-center justify-between pt-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700" />
                                                        <span className="text-xs font-bold text-slate-400">Contributor: {post.authorId.slice(0, 8)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-slate-500">
                                                        <div className="flex items-center gap-1.5 font-bold text-xs">
                                                            <MessageSquare className="w-4 h-4" />
                                                            {post._count.comments}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 font-bold text-xs">
                                                            <TrendingUp className="w-4 h-4" />
                                                            {post.viewCount} views
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {posts.length === 0 && (
                                    <div className="py-24 text-center space-y-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-[3rem]">
                                        <MessageSquare className="w-16 h-16 text-slate-800 mx-auto" />
                                        <h3 className="text-xl font-bold text-slate-600">No discussions found in this category.</h3>
                                        <p className="text-slate-700 font-medium">Be the first to start a conversation!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Create Post Modal (Simplified for this phase implementation) */}
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl p-8 space-y-6"
                        >
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">New Discussion</h2>
                            <form onSubmit={handleCreatePost} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">Title</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="What's on your mind?"
                                        value={newPost.title}
                                        onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-medium outline-none focus:border-amber-500 transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">Category</label>
                                        <select
                                            required
                                            value={newPost.categoryId}
                                            onChange={e => setNewPost({ ...newPost, categoryId: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-medium outline-none focus:border-amber-500 appearance-none transition-colors"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">Tags (CSV)</label>
                                        <input
                                            type="text"
                                            placeholder="tips, success, hiring"
                                            onChange={e => setNewPost({ ...newPost, tags: e.target.value.split(',').map(t => t.trim()) })}
                                            className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-medium outline-none focus:border-amber-500 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">Content</label>
                                    <textarea
                                        required
                                        placeholder="Share your thoughts..."
                                        value={newPost.content}
                                        onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-medium outline-none focus:border-amber-500 min-h-[150px] transition-colors"
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-2xl transition-all uppercase tracking-widest text-xs"
                                    >
                                        Post Discussion
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
