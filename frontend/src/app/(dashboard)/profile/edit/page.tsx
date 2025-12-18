'use client';

import React, { useState } from 'react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import { Loader2, Plus, Trash2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfileEditPage() {
    const { userId } = useKeycloak();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        overview: '',
        hourlyRate: 0,
        skills: [] as string[],
    });

    const [skillInput, setSkillInput] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Assuming user.sub is the user ID
            await api.patch(`/users/${userId}`, formData);
            router.push('/profile');
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const addSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <h2 className="text-xl font-semibold text-white">Professional Info</h2>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Professional Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            placeholder="e.g. Senior Full Stack Developer"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Overview</label>
                        <textarea
                            value={formData.overview}
                            onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 h-32"
                            placeholder="Describe your expertise and experience..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Hourly Rate ($)</label>
                        <input
                            type="number"
                            value={formData.hourlyRate}
                            onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
                            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Skills */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <h2 className="text-xl font-semibold text-white">Skills</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            placeholder="Add a skill..."
                        />
                        <button
                            type="button"
                            onClick={addSkill}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.skills.map(skill => (
                            <span key={skill} className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm flex items-center gap-2">
                                {skill}
                                <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-400">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
