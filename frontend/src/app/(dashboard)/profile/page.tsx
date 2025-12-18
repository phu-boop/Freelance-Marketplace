'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User as UserIcon,
    Mail,
    Globe,
    Github,
    Twitter,
    Linkedin,
    MapPin,
    Calendar,
    Edit3,
    Plus,
    ExternalLink,
    Star,
    Award,
    MessageSquare,
    Loader2
} from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';

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

export default function ProfilePage() {
    const { userId } = useKeycloak();
    const [user, setUser] = useState<UserData | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about');

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
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!user) {
        return <div className="text-center text-slate-400">User not found</div>;
    }
    return (
        <div className="max-w-5xl mx-auto space-y-8">
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
                <div className="absolute -bottom-12 right-8 pb-4">
                    <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20">
                        <Edit3 className="w-4 h-4" /> Edit Profile
                    </button>
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
                        {/* Left Column: Info & Socials */}
                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                                <h3 className="font-semibold text-white">About</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {user.overview || 'No overview provided yet.'}
                                </p>
                                <div className="space-y-3 pt-4 border-t border-slate-800">
                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                        <MapPin className="w-4 h-4" /> San Francisco, CA
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                        <Mail className="w-4 h-4" /> {user.email}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                        <Calendar className="w-4 h-4" /> Joined {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                                <h3 className="font-semibold text-white">Social Profiles</h3>
                                <div className="space-y-3">
                                    {[
                                        { icon: Github, label: 'GitHub', username: 'johndoe', color: 'hover:text-white' },
                                        { icon: Linkedin, label: 'LinkedIn', username: 'john-doe', color: 'hover:text-blue-400' },
                                        { icon: Twitter, label: 'Twitter', username: '@johndoe', color: 'hover:text-sky-400' },
                                        { icon: Globe, label: 'Website', username: 'johndoe.dev', color: 'hover:text-emerald-400' },
                                    ].map((social) => (
                                        <a
                                            key={social.label}
                                            href="#"
                                            className={"flex items-center justify-between group p-2 rounded-lg hover:bg-slate-800 transition-all " + social.color}
                                        >
                                            <div className="flex items-center gap-3">
                                                <social.icon className="w-4 h-4 text-slate-500 group-hover:text-inherit transition-colors" />
                                                <span className="text-sm text-slate-400 group-hover:text-inherit transition-colors">{social.label}</span>
                                            </div>
                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Skills & Experience */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-white">Skills & Expertise</h3>
                                    <button className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-all">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {user.skills?.length > 0 ? user.skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="px-4 py-1.5 rounded-xl bg-slate-800 text-sm text-slate-300 border border-slate-700 hover:border-blue-500/50 transition-all cursor-default"
                                        >
                                            {skill}
                                        </span>
                                    )) : (
                                        <p className="text-sm text-slate-500">No skills added yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-white">Experience</h3>
                                    <button className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-all">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-8">
                                    {[
                                        {
                                            role: 'Senior Full Stack Developer',
                                            company: 'TechFlow Inc.',
                                            period: '2022 - Present',
                                            desc: 'Leading the development of a high-traffic SaaS platform using Next.js and microservices.'
                                        },
                                        {
                                            role: 'Frontend Developer',
                                            company: 'WebSolutions',
                                            period: '2020 - 2022',
                                            desc: 'Built responsive and interactive user interfaces for various client projects.'
                                        }
                                    ].map((exp, idx) => (
                                        <div key={idx} className="relative pl-8 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-blue-500 before:rounded-full after:absolute after:left-[3px] after:top-6 after:bottom-[-32px] after:w-[2px] after:bg-slate-800 last:after:hidden">
                                            <div className="text-sm font-bold text-white">{exp.role}</div>
                                            <div className="text-xs text-blue-400 font-medium mt-0.5">{exp.company} • {exp.period}</div>
                                            <p className="text-sm text-slate-400 mt-2 leading-relaxed">{exp.desc}</p>
                                        </div>
                                    ))}
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
                                        <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                                                <UserIcon className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <div className="text-xs font-medium text-slate-400">
                                                Reviewer ID: {review.reviewer_id.substring(0, 8)}...
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                                <MessageSquare className="w-12 h-12 text-slate-700 mx-auto" />
                                <div className="space-y-1">
                                    <p className="text-white font-bold">No reviews yet</p>
                                    <p className="text-slate-500 text-sm">Completed contracts will appear here.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
