'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Search,
    MapPin,
    Clock,
    DollarSign,
    Filter,
    Briefcase,
    ChevronRight,
    Loader2,
    ArrowLeft,
    ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';
import { ProposalModal } from '@/components/ProposalModal';

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    type: string;
    posted: string;
    description: string;
    skills: string[];
}

export default function PublicJobsPage() {
    const { authenticated, login } = useKeycloak();
    const [searchQuery, setSearchQuery] = useState('');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(10);

    // Filter states
    const [filters, setFilters] = useState({
        location: '',
        minSalary: '',
        maxSalary: '',
        types: [] as string[],
        levels: [] as string[]
    });

    const fetchJobs = async (query = searchQuery, page = currentPage, currentFilters = filters) => {
        setLoading(true);
        try {
            let url = `/search/jobs?q=${query}&page=${page}&limit=${itemsPerPage}`;
            if (currentFilters.location) url += `&location=${encodeURIComponent(currentFilters.location)}`;
            if (currentFilters.minSalary) url += `&minSalary=${currentFilters.minSalary}`;
            if (currentFilters.maxSalary) url += `&maxSalary=${currentFilters.maxSalary}`;
            if (currentFilters.types.length) url += `&types=${currentFilters.types.join(',')}`;
            if (currentFilters.levels.length) url += `&levels=${currentFilters.levels.join(',')}`;

            const response = await api.get(url);
            // Check if response has pagination wrapper
            if (response.data.results) {
                setJobs(response.data.results);
                setTotalItems(response.data.total);
            } else {
                setJobs(response.data || []);
                setTotalItems(response.data?.length || 0);
            }
            setError(null);
        } catch (err) {
            console.error('Failed to fetch jobs', err);
            setError('Failed to load jobs. Please try again later.');
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs(searchQuery, currentPage, filters);
    }, [currentPage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchJobs(searchQuery, 1, filters);
    };

    const handleFilterChange = (key: keyof typeof filters, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        setCurrentPage(1);
        fetchJobs(searchQuery, 1, newFilters);
    };

    const toggleFilter = (key: 'types' | 'levels', value: string) => {
        const current = filters[key];
        const newValues = current.includes(value)
            ? current.filter(t => t !== value)
            : [...current, value];
        handleFilterChange(key, newValues);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const router = useRouter();
    const handleJobClick = (job: Job) => {
        router.push(`/jobs/${job.id}`);
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

            <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto space-y-8">
                {/* Header & Search */}
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-5xl font-bold text-white">Browse Open Positions</h1>
                    <p className="text-slate-400 max-w-2xl">
                        Discover thousands of opportunities from top companies worldwide.
                        Sign in to apply and start your next project.
                    </p>
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 pt-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search for jobs, skills, or companies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                        </div>
                        <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20">
                            Search
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar (Desktop) */}
                    <div className="hidden lg:block space-y-6">
                        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-white">Job Type</h3>
                                <div className="space-y-2">
                                    {['Full-time', 'Contract', 'Part-time', 'Freelance'].map((type) => (
                                        <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={filters.types.includes(type)}
                                                onChange={() => toggleFilter('types', type)}
                                                className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500/20"
                                            />
                                            <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-800">
                                <h3 className="font-semibold text-white">Experience Level</h3>
                                <div className="space-y-2">
                                    {['Entry Level', 'Intermediate', 'Senior', 'Expert'].map((level) => (
                                        <label key={level} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={filters.levels.includes(level)}
                                                onChange={() => toggleFilter('levels', level)}
                                                className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500/20"
                                            />
                                            <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{level}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-800">
                                <h3 className="font-semibold text-white">Location</h3>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Remote, USA..."
                                        value={filters.location}
                                        onChange={(e) => handleFilterChange('location', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-800">
                                <h3 className="font-semibold text-white">Budget Range</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-500">Min ($)</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={filters.minSalary}
                                            onChange={(e) => handleFilterChange('minSalary', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-500">Max ($)</label>
                                        <input
                                            type="number"
                                            placeholder="Any"
                                            value={filters.maxSalary}
                                            onChange={(e) => handleFilterChange('maxSalary', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    const reset = {
                                        location: '',
                                        minSalary: '',
                                        maxSalary: '',
                                        types: [],
                                        levels: []
                                    };
                                    setFilters(reset);
                                    fetchJobs(searchQuery, 1, reset);
                                }}
                                className="w-full py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                Clear all filters
                            </button>
                        </div>
                    </div>

                    {/* Jobs List */}
                    <div className="lg:col-span-3 space-y-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                                <p className="text-slate-400">Searching for the best opportunities...</p>
                            </div>
                        ) : error ? (
                            <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
                                <p className="text-red-400">{error}</p>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="p-20 text-center text-slate-400">
                                No jobs found matching your criteria.
                            </div>
                        ) : (
                            <>
                                {jobs.map((job, idx) => (
                                    <motion.div
                                        key={job.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/30 transition-all group cursor-pointer"
                                        onClick={() => handleJobClick(job)}
                                    >
                                        <div className="flex flex-col md:flex-row justify-between gap-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                                                        <Briefcase className="w-6 h-6 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{job.title}</h3>
                                                        <p className="text-sm text-slate-400">{job.company}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="w-4 h-4" />
                                                        {job.location || 'Remote'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <DollarSign className="w-4 h-4" />
                                                        {job.salary || 'Competitive'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4" />
                                                        {job.posted || 'Recent'}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-400 line-clamp-2">{job.description}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {job.skills?.map((skill) => (
                                                        <span key={skill} className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-300 border border-slate-700">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex md:flex-col justify-between items-end gap-4">
                                                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                                                    {job.type}
                                                </span>
                                                <button className="px-4 py-2 rounded-xl bg-blue-600/10 text-blue-400 text-sm font-bold hover:bg-blue-600 hover:text-white transition-all">
                                                    {authenticated ? 'Apply Now' : 'Sign in to Apply'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-4 pt-8">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>

                                        <div className="flex items-center gap-2">
                                            {[...Array(totalPages)].map((_, i) => (
                                                <button
                                                    key={i + 1}
                                                    onClick={() => setCurrentPage(i + 1)}
                                                    className={`w-10 h-10 rounded-xl font-medium transition-all ${currentPage === i + 1
                                                        ? 'bg-blue-600 text-white'
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
                                            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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

            {selectedJob && (
                <ProposalModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    jobId={selectedJob.id}
                    jobTitle={selectedJob.title}
                />
            )}

            {/* Footer */}
            <footer className="py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
                    © 2025 FreelanceHub. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
