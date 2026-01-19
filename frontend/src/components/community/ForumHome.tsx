'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ThumbsUp, Eye, Tag, Plus, Loader2, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface ForumPost {
    id: string;
    title: string;
    content: string;
    authorId: string;
    upvotes: number;
    viewCount: number;
    tags: string[];
    createdAt: string;
    category: { name: string; slug: string };
    _count: { comments: number };
}

export default function ForumHome() {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/community/api/forum/posts');
            setPosts(res.data);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 py-10 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Community Forum</h1>
                    <p className="text-slate-400 text-lg">Connect, share knowledge, and grow with experts.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 px-8 flex items-center gap-2 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20">
                    <Plus className="w-5 h-5" />
                    New Discussion
                </Button>
            </div>

            <div className="grid gap-6">
                {posts.map((post) => (
                    <Card key={post.id} className="bg-slate-900 border-slate-800 transition-all hover:border-slate-700 group cursor-pointer overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:to-blue-500/5 transition-all duration-500" />
                        <CardHeader className="relative z-10 pb-2">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 uppercase tracking-widest border border-blue-500/20">
                                    {post.category.name}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                            <CardTitle className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                {post.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 space-y-4">
                            <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
                                {post.content}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {post.tags.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-800/50 px-2 py-1 rounded-md border border-slate-800 group-hover:border-slate-700">
                                        <Tag className="w-3 h-3" />
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <ThumbsUp className="w-4 h-4" />
                                        <span className="text-xs font-bold">{post.upvotes}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <MessageSquare className="w-4 h-4" />
                                        <span className="text-xs font-bold">{post._count.comments}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Eye className="w-4 h-4" />
                                        <span className="text-xs font-bold">{post.viewCount}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-blue-500 font-bold text-xs group-hover:translate-x-1 transition-transform">
                                    Read Discussion
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {posts.length === 0 && (
                <div className="text-center py-20 space-y-4 bg-slate-900/50 rounded-3xl border border-slate-800/50 border-dashed">
                    <MessageSquare className="w-12 h-12 text-slate-700 mx-auto" />
                    <p className="text-slate-500 font-medium">No discussions found in this community yet.</p>
                    <Button variant="outline" className="border-slate-800 text-slate-400 hover:bg-slate-800">Start the First Topic</Button>
                </div>
            )}
        </div>
    );
}
