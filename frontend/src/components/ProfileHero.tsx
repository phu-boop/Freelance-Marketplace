'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { User, MapPin, Calendar, Globe, ShieldCheck, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPublicUrl } from '@/lib/utils';
import ImageUpload from './ImageUpload';
import api from '@/lib/api';

interface ProfileHeroProps {
    user: any;
    isOwnProfile: boolean;
}

export default function ProfileHero({ user, isOwnProfile }: ProfileHeroProps) {
    const handleAvatarUpdate = async (url: string) => {
        try {
            await api.patch(`/users/${user.id}`, { avatarUrl: url });
            window.location.reload();
        } catch (error) {
            console.error('Failed to update avatar', error);
        }
    };

    const handleCoverUpdate = async (url: string) => {
        try {
            await api.patch(`/users/${user.id}`, { coverImageUrl: url });
            window.location.reload();
        } catch (error) {
            console.error('Failed to update cover image', error);
        }
    };

    return (
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl mb-8">
            {/* Background Cover */}
            <div className="h-56 relative overflow-hidden group/cover">
                {user.coverImageUrl ? (
                    <img
                        src={getPublicUrl(user.coverImageUrl)}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/cover:scale-110"
                        alt="Cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20" />
                )}

                {/* Visual grid overlay */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

                {/* Cover Edit Button */}
                {isOwnProfile && (
                    <div className="absolute top-4 right-4 z-10 transition-all">
                        <ImageUpload
                            type="coverImage"
                            onUploadSuccess={handleCoverUpdate}
                            className="opacity-0 group-hover/cover:opacity-100 transition-opacity"
                        >
                            <Button variant="outline" size="sm" className="bg-slate-950/50 backdrop-blur-md border-slate-700 text-white hover:bg-slate-900">
                                <Camera className="w-4 h-4 mr-2" />
                                Edit Cover
                            </Button>
                        </ImageUpload>
                    </div>
                )}

                {/* Glassy overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
            </div>

            <div className="px-8 pb-8 relative">
                {/* Avatar Row */}
                <div className="-mt-16 mb-6 flex flex-col md:flex-row justify-between items-end gap-6">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                    >
                        {isOwnProfile ? (
                            <ImageUpload
                                type="avatar"
                                currentImage={getPublicUrl(user.avatarUrl)}
                                onUploadSuccess={handleAvatarUpdate}
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-3xl bg-slate-950 p-1.5 ring-4 ring-slate-950 shadow-xl overflow-hidden">
                                {user.avatarUrl ? (
                                    <img src={getPublicUrl(user.avatarUrl)} alt={user.firstName} className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 rounded-2xl flex items-center justify-center">
                                        <User className="w-12 h-12 text-slate-400" />
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {isOwnProfile && (
                        <div className="flex gap-3 mb-2 flex-wrap">
                            <Link href="/settings/profile">
                                <Button variant="outline" className="text-white hover:text-white border-slate-700 bg-slate-800/50 backdrop-blur-md">
                                    Edit Profile
                                </Button>
                            </Link>
                            <Link href={`/freelancers/${user.id}`}>
                                <Button className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20">
                                    View Public Profile
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="flex flex-col lg:flex-row gap-8 justify-between">
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-4xl font-extrabold text-white tracking-tight">
                                {user.firstName} {user.lastName}
                            </h1>
                            {user.isIdentityVerified && (
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-full p-1.5" title="Identity Verified">
                                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                                </div>
                            )}
                        </div>

                        <h2 className="text-xl text-slate-300 font-medium mb-6">
                            {user.title || user.companyName || 'No Title Set'}
                        </h2>

                        <div className="flex flex-wrap gap-6 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <div className="p-1 px-2 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-400" />
                                    <span className="text-slate-300">{user.country || 'Global'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <Globe className="w-4 h-4" />
                                {user.timezone || 'UTC'}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <Calendar className="w-4 h-4" />
                                Member since {new Date(user.createdAt).getFullYear()}
                            </div>
                        </div>
                    </div>

                    {/* Stats Highlights (Freelancer Only) */}
                    {user.roles?.includes('FREELANCER') && (
                        <div className="flex items-center gap-4 lg:self-start">
                            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-5 rounded-2xl flex items-center gap-5">
                                <div className="relative w-16 h-16 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
                                        <circle
                                            cx="32" cy="32" r="28"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="transparent"
                                            className="text-blue-500"
                                            strokeDasharray={175.9}
                                            strokeDashoffset={175.9 - (175.9 * (user.stats?.jss || 100)) / 100}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="absolute text-sm font-bold text-white">{user.stats?.jss || 100}%</span>
                                </div>
                                <div className="pr-2">
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Job Success</div>
                                    <div className="text-sm font-semibold text-white">Top Rated Choice</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
