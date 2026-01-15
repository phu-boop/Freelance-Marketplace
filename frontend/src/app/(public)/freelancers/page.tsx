'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    MapPin,
    Star,
    CheckCircle2,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Briefcase,
    DollarSign,
    Filter,
    Award,
    TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { getPublicUrl } from '@/lib/utils';
import { useKeycloak } from '@/components/KeycloakProvider';

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
    isPaymentVerified: boolean;
}

export default function FreelancerListPage() {
    const { authenticated } = useKeycloak();
    const [searchQuery, setSearchQuery] = useState('');
    const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(10);

    const fetchFreelancers = async (query = searchQuery, page = currentPage) => {
        setLoading(true);
        try {
            const endpoint = query
                ? `/search/users?q=${query}&page=${page}&limit=${itemsPerPage}`
                : `/users?role=FREELANCER&page=${page}&limit=${itemsPerPage}`;

            const response = await api.get(endpoint);

            if (response.data.results) {
                setFreelancers(response.data.results);
                setTotalItems(response.data.total);
            } else {
                setFreelancers(response.data || []);
                setTotalItems(response.data?.length || 0);
            }
            setError(null);
        } catch (err) {
            console.error('Failed to fetch freelancers', err);
            setError('Failed to load freelancers. Please try again later.');
            setFreelancers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFreelancers(searchQuery, currentPage);
    }, [currentPage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchFreelancers(searchQuery, 1);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
            {/* Header Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                                FreelanceHub
                            </span>
                        </Link>
                        <div className="flex gap-4">
                            <Link href="/jobs" className="text-sm text-slate-400 hover:text-white transition-colors">Find Jobs</Link>
                            <Link href="/freelancers" className="text-sm text-blue-400 font-medium font-medium transition-colors">Find Talent</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto space-y-8">
                {/* Hero Section & Search */}
                <div className="space-y-6 text-center lg:text-left">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                            Find the <span className="text-blue-500">perfect</span> talent.
                        </h1>
                        <p className="text-slate-400 max-w-2xl mx-auto lg:mx-0 text-lg">
                            Work with the world&apos;s best freelancers from over 180 countries.
                            From web developers to digital marketers, your project is in safe hands.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="max-w-3xl flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <div className="absolute inset-0 bg-blue-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name, title, or skills..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-all relative z-10"
                            />
                        </div>
                        <button type="submit" className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                            Find Experts
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filter Sidebar Placeholder */}
                    <aside className="hidden lg:block space-y-6">
                        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-8">
                            <div className="space-y-4">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-blue-400" /> Filters
                                </h3>
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Rated</label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500/20" />
                                        <span className="text-sm text-slate-400 group-hover:text-white transition-colors">4.5 & up</span>
                                    </label>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-blue-600/5 border border-blue-500/10 space-y-3 text-center">
                                <Award className="w-8 h-8 text-blue-400 mx-auto" />
                                <p className="text-xs text-slate-400">Join our Professional Network of over 10,000 satisfied clients.</p>
                            </div>
                        </div>
                    </aside>

                    {/* Freelancer Cards */}
                    <div className="lg:col-span-3 space-y-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                                <p className="text-slate-400 animate-pulse">Searching for best talent...</p>
                            </div>
                        ) : freelancers.length === 0 ? (
                            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/50">
                                <p className="text-slate-400">No freelancers found matching your criteria.</p>
                            </div>
                        ) : (
                            <>
                                {freelancers.map((user, idx) => (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/30 transition-all group overflow-hidden relative shadow-lg"
                                    >
                                        <div className="flex flex-col md:flex-row gap-6 relative z-10">
                                            {/* Avatar & Availability */}
                                            <div className="relative shrink-0">
                                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-slate-800 ring-4 ring-slate-800/50">
                                                    <img
                                                        src={getPublicUrl(user.avatarUrl) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                                                        alt={user.firstName}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                {user.isAvailable && (
                                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-slate-900 rounded-full shadow-lg" />
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 space-y-4">
                                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                                                {user.firstName} {user.lastName}
                                                            </h3>
                                                            {user.jobSuccessScore >= 90 && (
                                                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20 uppercase">
                                                                    <Award className="w-3 h-3" /> Top Rated
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-blue-400 font-medium">{user.title || "Elite Professional"}</p>
                                                    </div>

                                                    <div className="flex items-center gap-6">
                                                        <div className="text-center">
                                                            <p className="text-xl font-bold text-white">${user.hourlyRate || 50}</p>
                                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">/ hr</p>
                                                        </div>
                                                        <Link
                                                            href={`/freelancers/${user.id}`}
                                                            className="px-6 py-2 bg-blue-600/10 text-blue-400 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-all border border-blue-500/20"
                                                        >
                                                            View Profile
                                                        </Link>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-4 text-xs">
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                        <span className="text-white font-bold">{Number(user.rating).toFixed(1)}</span>
                                                        <span>({user.reviewCount} reviews)</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        <span className="text-white font-bold">{user.jobSuccessScore}%</span>
                                                        <span>Job Success</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{user.country || "Remote"}</span>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                                                    {user.overview || "Highly experienced professional dedicated to delivering exceptional results. Specializing in advanced problem solving and creative execution."}
                                                </p>

                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {(user.skills || ['React', 'Node.js', 'UI/UX']).slice(0, 5).map((skill) => (
                                                        <span key={skill} className="px-3 py-1 rounded-lg bg-slate-950 text-[11px] text-slate-300 border border-slate-800 group-hover:border-blue-500/20 transition-colors">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {user.skills?.length > 5 && (
                                                        <span className="text-xs text-slate-500 self-center">+{user.skills.length - 5} more</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-4 pt-12">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>

                                        <div className="flex items-center gap-3">
                                            {[...Array(totalPages)].map((_, i) => (
                                                <button
                                                    key={i + 1}
                                                    onClick={() => setCurrentPage(i + 1)}
                                                    className={`w-12 h-12 rounded-2xl font-bold transition-all ${currentPage === i + 1
                                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-blue-500/30'
                                                        }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
