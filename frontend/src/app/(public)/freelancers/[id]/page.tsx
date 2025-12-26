'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    User,
    MapPin,
    Star,
    CheckCircle2,
    Loader2,
    ChevronLeft,
    Briefcase,
    DollarSign,
    Calendar,
    Award,
    Mail,
    Globe,
    ExternalLink,
    GraduationCap,
    Clock,
    Share2,
    MoreHorizontal,
    ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';

interface Education {
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate?: string;
    description?: string;
}

interface Experience {
    id: string;
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
}

interface PortfolioItem {
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    projectUrl?: string;
    skills: string[];
}

interface Review {
    id: string;
    reviewer_id: string;
    ratingOverall: number;
    comment: string;
    createdAt: string;
    job_id: string;
}

interface Freelancer {
    id: string;
    firstName: string;
    lastName: string;
    title: string;
    overview: string;
    avatarUrl: string;
    hourlyRate: number;
    rating: number;
    reviewCount: number;
    jobSuccessScore: number;
    skills: string[];
    isAvailable: boolean;
    country: string;
    isPaymentVerified?: boolean;
    isIdentityVerified?: boolean;
    education: Education[];
    experience: Experience[];
    portfolio: PortfolioItem[];
}

export default function FreelancerProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const { authenticated } = useKeycloak();
    const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const [profileRes, reviewsRes] = await Promise.all([
                    api.get(`/users/${id}`),
                    api.get(`/reviews?reviewee_id=${id}`)
                ]);
                setFreelancer(profileRes.data);
                setReviews(reviewsRes.data || []);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch freelancer profile', err);
                setError('Profile not found.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProfileData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-400 animate-pulse">Loading talent profile...</p>
            </div>
        );
    }

    if (error || !freelancer) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <User className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
                <p className="text-slate-400 mb-8">{error || "The user you are looking for does not exist."}</p>
                <Link href="/freelancers" className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white hover:bg-slate-800 transition-all flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Browse Talent
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Award className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                                FreelanceHub
                            </span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-slate-900 rounded-xl text-slate-400 transition-all">
                                <Share2 className="w-5 h-5" />
                            </button>
                            <button onClick={() => router.back()} className="text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-4 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Profile Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-8 rounded-3xl bg-slate-900 border border-slate-800 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Available Now</span>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="relative group">
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden bg-slate-800 ring-4 ring-slate-800/50">
                                        <img
                                            src={freelancer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${freelancer.id}`}
                                            alt={freelancer.firstName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {freelancer.jobSuccessScore >= 90 && (
                                        <div className="absolute -bottom-3 -right-3 bg-blue-600 p-2 rounded-xl shadow-xl shadow-blue-600/40 border-2 border-slate-900">
                                            <Award className="w-6 h-6 text-white" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="space-y-1">
                                        <h1 className="text-3xl font-bold text-white">
                                            {freelancer.firstName} {freelancer.lastName}
                                        </h1>
                                        <p className="text-xl text-blue-400 font-medium">{freelancer.title || "Elite Freelancer"}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-6 text-sm">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <MapPin className="w-4 h-4 text-blue-400" />
                                            {freelancer.country || "Remote"}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock className="w-4 h-4 text-blue-400" />
                                            Local Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Globe className="w-4 h-4 text-blue-400" />
                                            Fluent in English
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 pt-2">
                                        {freelancer.skills?.map((skill) => (
                                            <span key={skill} className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* About Section */}
                        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                            <h2 className="text-xl font-bold text-white">About Talent</h2>
                            <div className="prose prose-invert max-w-none text-slate-400 leading-relaxed whitespace-pre-wrap">
                                {freelancer.overview || "Professional development and design services. Focused on high-quality delivery and client satisfaction."}
                            </div>
                        </div>

                        {/* Experience Section */}
                        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                            <h2 className="text-xl font-bold text-white">Work History</h2>
                            {freelancer.experience?.length > 0 ? (
                                <div className="space-y-8">
                                    {freelancer.experience.map((exp, idx) => (
                                        <div key={exp.id} className="relative pl-8 before:absolute before:left-0 before:top-2 before:w-px before:h-[calc(100%+32px)] before:bg-slate-800 last:before:hidden">
                                            <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-white">{exp.title}</h3>
                                                        <p className="text-blue-400 text-sm font-medium">{exp.company}</p>
                                                    </div>
                                                    <span className="text-xs text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                                                        {new Date(exp.startDate).getFullYear()} - {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-400 leading-relaxed pt-2">{exp.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 italic text-sm text-center py-4">No work history provided yet.</p>
                            )}
                        </div>

                        {/* Reviews Section */}
                        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Client Reviews
                            </h2>
                            {reviews.length > 0 ? (
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < review.ratingOverall ? 'text-yellow-500 fill-yellow-500' : 'text-slate-700'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-slate-500">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-slate-300 text-sm italic">&quot;{review.comment}&quot;</p>
                                            <div className="pt-2 border-t border-slate-800/50">
                                                <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">
                                                    Client: {review.reviewer_id.slice(0, 8)}...
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 space-y-2">
                                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto opacity-50">
                                        <Star className="w-6 h-6 text-slate-500" />
                                    </div>
                                    <p className="text-slate-500 text-sm">No reviews yet. Be the first to hire!</p>
                                </div>
                            )}
                        </div>

                        {/* Portfolio Section */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white px-4">Portfolio</h2>
                            {freelancer.portfolio?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {freelancer.portfolio.map((item) => (
                                        <div key={item.id} className="group rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-blue-500/30 transition-all">
                                            <div className="aspect-video bg-slate-800 relative">
                                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                                    {item.projectUrl && (
                                                        <a href={item.projectUrl} target="_blank" className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl">
                                                            <ExternalLink className="w-5 h-5" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-6 space-y-2">
                                                <h3 className="font-bold text-white">{item.title}</h3>
                                                <p className="text-sm text-slate-400 line-clamp-2">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/50">
                                    <p className="text-slate-500 italic text-sm">Portfolio items are being curated.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6 lg:sticky lg:top-32 h-fit">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-6 rounded-3xl bg-blue-600 space-y-6 shadow-2xl shadow-blue-600/20"
                        >
                            <div className="flex justify-between items-center text-white">
                                <div className="space-y-1">
                                    <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider">Hourly Rate</p>
                                    <h3 className="text-3xl font-bold">${freelancer.hourlyRate || 50}</h3>
                                </div>
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                            </div>

                            <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg active:scale-95">
                                Hire {freelancer.firstName}
                            </button>

                            <button className="w-full py-4 bg-blue-700/50 text-white rounded-2xl font-bold border border-blue-400/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                <Mail className="w-5 h-5" /> Send Message
                            </button>
                        </motion.div>

                        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                            <h3 className="font-bold text-white">Reputation Stats</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{Number(freelancer.rating).toFixed(1)}</p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Rating</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400">{freelancer.reviewCount} Reviews</span>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{freelancer.jobSuccessScore}%</p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Job Success</p>
                                        </div>
                                    </div>
                                    <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500" style={{ width: `${freelancer.jobSuccessScore}%` }} />
                                    </div>
                                </div>
                            </div>

                            {freelancer.education?.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-slate-800">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-blue-400" /> Education
                                    </h3>
                                    {freelancer.education.map(edu => (
                                        <div key={edu.id} className="space-y-1">
                                            <p className="text-sm font-semibold text-white truncate">{edu.institution}</p>
                                            <p className="text-xs text-slate-400">{edu.degree} in {edu.fieldOfStudy}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-4 pt-4 border-t border-slate-800">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-blue-400" /> Verifications
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">Payment Verified</span>
                                        {freelancer.isPaymentVerified ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">Identity Verified</span>
                                        {freelancer.isIdentityVerified ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">Email Verified</span>
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-800">
                                <button className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-2">
                                    <MoreHorizontal className="w-4 h-4" /> View full qualifications
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
