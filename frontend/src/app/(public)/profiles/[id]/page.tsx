'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User as UserIcon,
    Mail,
    Globe,
    Github,
    Twitter,
    Linkedin,
    MapPin,
    Calendar,
    Star,
    Award,
    MessageSquare,
    Loader2,
    Briefcase,
    ArrowLeft,
    ExternalLink,
    Share2,
    Check,
    Copy
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';

interface Review {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    reviewer_id: string;
}

interface UserData {
    id: string;
    firstName: string;
    lastName: string;
    title: string;
    overview: string;
    email: string;
    rating: number;
    reviewCount: number;
    jobSuccessScore: number;
    skills: string[];
    createdAt: string;
}

export default function PublicProfilePage() {
    const params = useParams();
    const userId = params.id as string;
    const { authenticated, login } = useKeycloak();
    const [user, setUser] = useState<UserData | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about');
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!userId) return;
            try {
                const [userRes, reviewsRes] = await Promise.all([
                    api.get(`/users/${userId}`),
                    api.get(`/reviews/reviewee/${userId}`)
                ]);
                setUser(userRes.data);
                setReviews(reviewsRes.data);
            } catch (error) {
                console.error('Failed to fetch profile data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
                <p className="text-slate-400">User not found</p>
                <Link href="/" className="text-blue-500 hover:underline">Back to Home</Link>
            </div>
        );
    }

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

            <main className="pt-32 pb-20 px-4 max-w-5xl mx-auto space-y-8">
                {/* Profile Header */}
                <div className="relative">
                    <div className="h-48 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl" />
                    <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                        <div className="w-32 h-32 rounded-3xl bg-slate-900 border-4 border-slate-950 p-1">
                            <div className="w-full h-full rounded-2xl bg-slate-800 flex items-center justify-center overflow-hidden">
                                <UserIcon className="w-16 h-16 text-slate-400" />
                            </div>
                        </div>
                        <div className="pb-4 space-y-2">
                            <h1 className="text-3xl font-bold text-white">{user.firstName} {user.lastName}</h1>
                            <div className="flex items-center gap-4">
                                <p className="text-slate-400 flex items-center gap-2">
                                    {user.title || 'Freelancer'}
                                </p>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-sm font-bold border border-yellow-500/20">
                                    <Star className="w-4 h-4 fill-yellow-500" />
                                    {Number(user.rating).toFixed(1)}
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm font-bold border border-blue-500/20">
                                    <Award className="w-4 h-4" />
                                    {user.jobSuccessScore}% JSS
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -bottom-12 right-8 pb-4 flex items-center gap-3">
                        <div className="relative">
                            <button
                                onClick={() => setShowShareMenu(!showShareMenu)}
                                className="p-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
                                title="Share profile"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>

                            <AnimatePresence>
                                {showShareMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full mb-4 right-0 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
                                    >
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(window.location.href);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                            {copied ? 'Copied!' : 'Copy Link'}
                                        </button>
                                        <button
                                            onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
                                        >
                                            <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                                            LinkedIn
                                        </button>
                                        <button
                                            onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
                                        >
                                            <Twitter className="w-4 h-4 text-white" />
                                            X (Twitter)
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {!authenticated ? (
                            <button
                                onClick={() => login()}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20"
                            >
                                Sign in to Hire
                            </button>
                        ) : (
                            <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20">
                                Hire {user.firstName}
                            </button>
                        )}
                    </div>
                </div>

                <div className="pt-12 flex gap-8 border-b border-slate-800">
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'about' ? 'text-blue-500' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        About
                        {activeTab === 'about' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'reviews' ? 'text-blue-500' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Reviews ({user.reviewCount})
                        {activeTab === 'reviews' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {activeTab === 'about' ? (
                        <>
                            <div className="space-y-6">
                                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                                    <h3 className="font-semibold text-white">Overview</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        {user.overview || 'No overview provided yet.'}
                                    </p>
                                    <div className="space-y-3 pt-4 border-t border-slate-800">
                                        <div className="flex items-center gap-3 text-sm text-slate-400">
                                            <MapPin className="w-4 h-4" /> San Francisco, CA
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-400">
                                            <Calendar className="w-4 h-4" /> Joined {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-2 space-y-6">
                                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                                    <h3 className="font-semibold text-white">Skills & Expertise</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {user.skills?.length > 0 ? user.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-4 py-1.5 rounded-xl bg-slate-800 text-sm text-slate-300 border border-slate-700"
                                            >
                                                {skill}
                                            </span>
                                        )) : (
                                            <p className="text-sm text-slate-500">No skills listed.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="lg:col-span-3 space-y-6">
                            {reviews.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star
                                                            key={s}
                                                            className={`w-4 h-4 ${s <= review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-slate-700'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-slate-500">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-slate-300 text-sm italic">
                                                "{review.comment || 'No comment provided.'}"
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                                    <MessageSquare className="w-12 h-12 text-slate-700 mx-auto" />
                                    <p className="text-slate-500 text-sm">No reviews yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
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
