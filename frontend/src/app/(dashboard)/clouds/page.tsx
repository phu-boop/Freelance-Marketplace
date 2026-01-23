'use client';

import React from 'react';
import { CloudLayout } from '@/components/clouds/CloudLayout';
import { CloudMembers } from '@/components/clouds/CloudMembers';
import { InvitationsList } from '@/components/clouds/InvitationsList';
import api from '@/lib/api';
import { Cloud, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CloudsPage() {
    const [clouds, setClouds] = React.useState<any[]>([]);
    const [selectedCloud, setSelectedCloud] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState<'overview' | 'jobs' | 'talent' | 'access'>('overview');
    const [jobs, setJobs] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchClouds = async () => {
            try {
                const res = await api.get('/clouds'); // talent-cloud-service
                setClouds(res.data);
                if (res.data.length > 0) {
                    // Automatically select the first one for now
                    handleSelectCloud(res.data[0]);
                }
            } catch (error) {
                console.error('Failed to fetch clouds:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchClouds();
    }, []);

    const handleSelectCloud = async (cloud: any) => {
        setSelectedCloud(cloud);
        setLoading(true);
        try {
            // Fetch Job details for this cloud
            const jobsRes = await api.get(`/jobs/cloud/${cloud.id}`);
            setJobs(jobsRes.data.results);

            // Fetch full cloud details (members, etc)
            const detailsRes = await api.get(`/clouds/${cloud.id}`);
            setSelectedCloud(detailsRes.data); // Update with full details including members
        } catch (error) {
            console.error('Failed to fetch cloud details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !selectedCloud) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (!selectedCloud) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <InvitationsList />
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Your Talent Clouds</h1>
                        <p className="text-slate-400 mt-2">Manage your private pools of vetted talent.</p>
                    </div>
                    <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Create Cloud
                    </button>
                </div>

                {clouds.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-[2.5rem] border-dashed">
                        <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Cloud className="w-10 h-10 text-slate-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">No Talent Clouds Found</h2>
                        <p className="text-slate-500 max-w-sm mx-auto mb-8">Start building your private network of elite freelancers today.</p>
                        <button className="px-6 py-3 bg-white text-slate-950 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all">
                            Create First Cloud
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {clouds.map((cloud) => (
                            <div key={cloud.id} onClick={() => handleSelectCloud(cloud)} className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] hover:border-indigo-500/50 cursor-pointer group transition-all">
                                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Cloud className="w-6 h-6 text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{cloud.name}</h3>
                                <p className="text-sm text-slate-400 line-clamp-2 mb-6">{cloud.description || 'No description provided.'}</p>
                                <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{cloud._count?.members || 0} Members</span>
                                    <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button onClick={() => setSelectedCloud(null)} className="mb-6 text-slate-500 hover:text-white text-sm font-bold flex items-center gap-2 transition-colors">
                <ArrowRight className="w-4 h-4 rotate-180" /> Back to Clouds
            </button>

            <CloudLayout cloud={selectedCloud} activeTab={activeTab} onTabChange={setActiveTab}>
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Stats */}
                        <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] space-y-2">
                            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Spend</div>
                            <div className="text-3xl font-black text-white">$12,450</div>
                        </div>
                        <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] space-y-2">
                            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Jobs</div>
                            <div className="text-3xl font-black text-white">{jobs.length}</div>
                        </div>
                        <div className="p-8 bg-indigo-600 rounded-[2.5rem] space-y-2 shadow-2xl shadow-indigo-500/20 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="text-sm font-bold text-indigo-200 uppercase tracking-widest">Talent Pool</div>
                                <div className="text-3xl font-black">{selectedCloud.members?.length || 0}</div>
                            </div>
                            <Cloud className="absolute -bottom-4 -right-4 w-32 h-32 text-indigo-500 opacity-50 rotate-[-12deg]" />
                        </div>
                    </div>
                )}

                {activeTab === 'talent' && (
                    <CloudMembers members={selectedCloud.members || []} />
                )}

                {activeTab === 'jobs' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {jobs.length > 0 ? (
                            jobs.map((job) => (
                                <div key={job.id} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl hover:border-slate-700 transition-all">
                                    <h3 className="text-lg font-bold text-white mb-1">{job.title}</h3>
                                    <div className="flex gap-4 text-sm text-slate-400">
                                        <span>Budget: ${job.budget}</span>
                                        <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-slate-500">No exclusive jobs posted yet.</div>
                        )}
                    </div>
                )}
                {activeTab === 'access' && (
                    <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-[2.5rem] border-dashed">
                        <p className="text-slate-500">Access Control Settings coming soon.</p>
                    </div>
                )}
            </CloudLayout>
        </div>
    );
}
