'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    MapPin,
    Clock,
    DollarSign,
    Filter,
    Briefcase,
    ChevronRight,
    Loader2
} from 'lucide-react';
import api from '@/lib/api';
import { ProposalModal } from '@/components/ProposalModal';
import { useKeycloak } from '@/components/KeycloakProvider';

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
    preferredCommunicationStyle?: string;
}

interface UserProfile {
    communicationStyle?: string;
    skills: string[];
}

export default function JobsPage() {
    const { userId } = useKeycloak();
    const [searchQuery, setSearchQuery] = useState('');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        types: [] as string[],
        levels: [] as string[],
        minSalary: 0
    });

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('q', searchQuery);
            if (filters.types.length > 0) params.append('types', filters.types.join(','));
            if (filters.levels.length > 0) params.append('levels', filters.levels.join(','));
            if (filters.minSalary > 0) params.append('minSalary', filters.minSalary.toString());

            const response = await api.get(`/search/jobs?${params.toString()}`);
            setJobs(response.data.results || []);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch jobs', err);
            setError('Failed to load jobs. Please try again later.');
            // Fallback to mock data
            setJobs([
                {
                    id: '1',
                    title: 'Senior React Developer',
                    company: 'TechFlow Inc.',
                    location: 'Remote',
                    salary: '$80 - $120 / hr',
                    type: 'Full-time',
                    posted: '2 hours ago',
                    description: 'We are looking for an experienced React developer to lead our frontend team in building a next-generation SaaS platform.',
                    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS']
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            api.get(`/users/${userId}`).then(res => setUserProfile(res.data)).catch(console.error);
        }
    }, [userId]);

    useEffect(() => {
        fetchJobs();
    }, [filters]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchJobs();
    };

    return (
        <div className="space-y-8">
            {/* Header & Search */}
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-white">Find Your Next Job</h1>
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
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
                    <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all">
                        Search
                    </button>
                    <button type="button" className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white flex items-center gap-2 hover:bg-slate-800 transition-all">
                        <Filter className="w-5 h-5" />
                        Filters
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar (Desktop) */}
                <div className="hidden lg:block space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-white">Job Type</h3>
                        <div className="space-y-2">
                            {['Full-time', 'Contract', 'Part-time', 'Freelance'].map((type) => (
                                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filters.types.includes(type)}
                                        onChange={(e) => {
                                            const newTypes = e.target.checked
                                                ? [...filters.types, type]
                                                : filters.types.filter(t => t !== type);
                                            setFilters({ ...filters, types: newTypes });
                                        }}
                                        className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-blue-500/20"
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
                                        onChange={(e) => {
                                            const newLevels = e.target.checked
                                                ? [...filters.levels, level]
                                                : filters.levels.filter(l => l !== level);
                                            setFilters({ ...filters, levels: newLevels });
                                        }}
                                        className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-blue-500/20"
                                    />
                                    <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{level}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-800">
                        <h3 className="font-semibold text-white">Min Salary ($)</h3>
                        <input
                            type="range"
                            min="0"
                            max="200000"
                            step="5000"
                            value={filters.minSalary}
                            onChange={(e) => setFilters({ ...filters, minSalary: parseInt(e.target.value) })}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>${filters.minSalary.toLocaleString()}</span>
                            <span>$200k+</span>
                        </div>
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
                        jobs.map((job, idx) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/30 transition-all group cursor-pointer"
                                onClick={() => {
                                    setSelectedJob(job);
                                    setIsModalOpen(true);
                                }}
                            >
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                                                <Briefcase className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{job.title}</h3>
                                                    {userProfile?.communicationStyle && job.preferredCommunicationStyle === userProfile.communicationStyle && (
                                                        <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20 flex items-center gap-1">
                                                            ✨ Smart Match
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-400">{job.company}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4" />
                                                {job.location}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <DollarSign className="w-4 h-4" />
                                                {job.salary}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                {job.posted}
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
                                        <button className="p-2 rounded-full bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white transition-all">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {selectedJob && (
                <ProposalModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    jobId={selectedJob.id}
                    jobTitle={selectedJob.title}
                />
            )}
        </div>
    );
}
