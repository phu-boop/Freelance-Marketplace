'use client';

import React, { useState, useEffect } from 'react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import { getPublicUrl } from '@/lib/utils';
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
        phone: '',
        address: '',
        country: '',
        website: '',
        githubUsername: '',
        linkedinUsername: '',
        twitterUsername: '',
        behanceUsername: '',
        dribbbleUsername: '',
        avatarUrl: '',
        coverImageUrl: '',
        primaryCategoryId: '',
    });

    const [skillInput, setSkillInput] = useState('');
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;
            try {
                const response = await api.get(`/users/${userId}`);
                const user = response.data;
                setFormData({
                    title: user.title || '',
                    overview: user.overview || '',
                    hourlyRate: Number(user.hourlyRate) || 0,
                    skills: user.skills || [],
                    phone: user.phone || '',
                    address: user.address || '',
                    country: user.country || '',
                    website: user.website || '',
                    githubUsername: user.githubUsername || '',
                    linkedinUsername: user.linkedinUsername || '',
                    twitterUsername: user.twitterUsername || '',
                    behanceUsername: user.behanceUsername || '',
                    dribbbleUsername: user.dribbbleUsername || '',
                    avatarUrl: user.avatarUrl || '',
                    coverImageUrl: user.coverImageUrl || '',
                    primaryCategoryId: user.primaryCategoryId || '',
                });
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Ensure hourlyRate is a valid number
            const payload = {
                ...formData,
                hourlyRate: isNaN(formData.hourlyRate) ? 0 : formData.hourlyRate
            };
            await api.patch(`/users/${userId}`, payload);
            router.push('/profile');
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            if (error.response?.data) {
                console.error('Validation errors:', JSON.stringify(error.response.data, null, 2));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB
            alert('File size too large. Please upload an image smaller than 2MB.');
            return;
        }

        setLoading(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);

            const uploadRes = await api.post('/storage/upload', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { fileName } = uploadRes.data;
            const urlRes = await api.get(`/storage/url/${fileName}`);
            const { url } = urlRes.data;

            setFormData(prev => ({ ...prev, avatarUrl: url }));
        } catch (error) {
            console.error('Failed to upload avatar:', error);
            alert('Failed to upload avatar. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit for cover
            alert('File size too large. Please upload an image smaller than 5MB.');
            return;
        }

        setLoading(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);

            const uploadRes = await api.post('/storage/upload', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { fileName } = uploadRes.data;
            const urlRes = await api.get(`/storage/url/${fileName}`);
            const { url } = urlRes.data;

            setFormData(prev => ({ ...prev, coverImageUrl: url }));
        } catch (error) {
            console.error('Failed to upload cover image:', error);
            alert('Failed to upload cover image. Please try again.');
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

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Visuals: Avatar & Cover */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                    <h2 className="text-xl font-semibold text-white">Profile Visuals</h2>

                    {/* Cover Image */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Cover Image</label>
                        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-800 border-2 border-dashed border-slate-700 hover:border-blue-500 transition-all group">
                            {formData.coverImageUrl ? (
                                <img src={getPublicUrl(formData.coverImageUrl)} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                                    <span className="text-sm">Upload Cover Image</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <span className="text-sm font-bold text-white">Change Cover</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleCoverUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        <p className="text-xs text-slate-500">Recommended: 1200x300px JPG, PNG up to 5MB.</p>
                    </div>

                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center">
                        <div className="relative group cursor-pointer">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-800 flex items-center justify-center">
                                {formData.avatarUrl ? (
                                    <img src={getPublicUrl(formData.avatarUrl)} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-16 h-16 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs font-bold text-white">Change</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Profile Picture</p>
                    </div>
                </div>

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
                        <label className="text-sm font-medium text-slate-400">Primary Category</label>
                        <select
                            value={formData.primaryCategoryId}
                            onChange={(e) => setFormData({ ...formData, primaryCategoryId: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 appearance-none"
                        >
                            <option value="">Select a category</option>
                            <option value="Web Development">Web Development</option>
                            <option value="Mobile Development">Mobile Development</option>
                            <option value="Design & Creative">Design & Creative</option>
                            <option value="Writing">Writing</option>
                            <option value="Sales & Marketing">Sales & Marketing</option>
                            <option value="Admin Support">Admin Support</option>
                            <option value="Customer Service">Customer Service</option>
                            <option value="Data Science & Analytics">Data Science & Analytics</option>
                            <option value="Engineering & Architecture">Engineering & Architecture</option>
                        </select>
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
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
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

                {/* Contact & Social */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <h2 className="text-xl font-semibold text-white">Contact & Social</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Phone</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                placeholder="+1 234 567 890"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                placeholder="City, State"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Country</label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                placeholder="United States"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Website</label>
                            <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                placeholder="https://example.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">GitHub Username</label>
                            <input
                                type="text"
                                value={formData.githubUsername}
                                onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                placeholder="johndoe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">LinkedIn Username</label>
                            <input
                                type="text"
                                value={formData.linkedinUsername}
                                onChange={(e) => setFormData({ ...formData, linkedinUsername: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                placeholder="john-doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Twitter Username</label>
                            <input
                                type="text"
                                value={formData.twitterUsername}
                                onChange={(e) => setFormData({ ...formData, twitterUsername: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                placeholder="johndoe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Behance Username</label>
                            <input
                                type="text"
                                value={formData.behanceUsername}
                                onChange={(e) => setFormData({ ...formData, behanceUsername: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                placeholder="johndoe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Dribbble Username</label>
                            <input
                                type="text"
                                value={formData.dribbbleUsername}
                                onChange={(e) => setFormData({ ...formData, dribbbleUsername: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                placeholder="johndoe"
                            />
                        </div>
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
            </form >
        </div >
    );
}
