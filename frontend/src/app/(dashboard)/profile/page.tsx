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
    Loader2,
    Trash2,
    CheckCircle2,
    XCircle,
    Building2,
    Lock,
    Unlock,
    ShieldCheck
} from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import { getPublicUrl } from '@/lib/utils';
import { EducationModal } from '@/components/EducationModal';
import { ExperienceModal } from '@/components/ExperienceModal';
import { PortfolioModal } from '@/components/PortfolioModal';
import { CertificationModal } from '@/components/CertificationModal';
import { ProfileCompleteness } from '@/components/ProfileCompleteness';
import { BadgeList } from '@/components/BadgeList';
import { VerificationModal } from '@/components/VerificationModal';
import { LanguageModal } from '@/components/LanguageModal';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import { ProfileSwitcher } from '@/components/ProfileSwitcher';
import { SpecializedProfileModal } from '@/components/SpecializedProfileModal';
import { VideoKYCModal } from '@/components/VideoKYCModal';
import { TwoFactorSetupModal } from '@/components/profile/TwoFactorSetupModal';
import SpecializedProfileCard from '@/components/profile/SpecializedProfileCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Review {
    id: string;
    rating: number;
    comment: string;
    reply?: string;
    repliedAt?: string;
    createdAt: string;
    reviewer_id: string;
}

interface UserData {
    id: string;
    avatarUrl?: string;
    firstName: string;
    lastName: string;
    title: string;
    overview: string;
    email: string;
    rating: number;
    reviewCount: number;
    jobSuccessScore: number;
    skills: string[];
    isAvailable: boolean;
    createdAt: string;
    roles: string[];
    languages?: { language: string; proficiency: string }[];
    companyName?: string;
    companyLogo?: string;
    coverImageUrl?: string;
    isPaymentVerified: boolean;
    kycStatus: string;
    twoFactorEnabled: boolean;
    education: any[];
    experience: any[];
    portfolio: any[];
    certifications: any[];
    phone?: string;
    address?: string;
    country?: string;
    website?: string;
    githubUsername?: string;
    behanceUsername?: string;
    dribbbleUsername?: string;
    linkedinUsername?: string;
    twitterUsername?: string;
    linkedinId?: string;
    specializedProfiles: any[];
}

export default function ProfilePage() {
    const { userId, logout } = useKeycloak();
    const [user, setUser] = useState<UserData | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'portfolio' | 'security' | 'availability'>('about');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
    const [specializedProfiles, setSpecializedProfiles] = useState<any[]>([]);

    // Modal states
    const [eduModal, setEduModal] = useState({ open: false, data: null });
    const [expModal, setExpModal] = useState({ open: false, data: null });
    const [portModal, setPortModal] = useState({ open: false, data: null });
    const [certModal, setCertModal] = useState({ open: false, data: null });
    const [verifyModal, setVerifyModal] = useState(false);
    const [langModal, setLangModal] = useState(false);
    const [specializedProfileModal, setSpecializedProfileModal] = useState<{ open: boolean, data?: any }>({ open: false });
    const [videoKycModal, setVideoKycModal] = useState(false);
    const [twoFactorModal, setTwoFactorModal] = useState(false);

    const portfolioItemsToDisplay = (user?.portfolio || []).filter(item =>
        selectedProfileId ? item.specializedProfileId === selectedProfileId : true
    );

    const educationToDisplay = (user?.education || []).filter(item =>
        selectedProfileId ? item.specializedProfileId === selectedProfileId : true
    );

    const experienceToDisplay = (user?.experience || []).filter(item =>
        selectedProfileId ? item.specializedProfileId === selectedProfileId : true
    );

    const certificationsToDisplay = (user?.certifications || []).filter(item =>
        selectedProfileId ? item.specializedProfileId === selectedProfileId : true
    );

    const fetchProfileData = async () => {
        if (!userId) return;
        try {
            const [userRes, reviewsRes] = await Promise.all([
                api.get(`/users/${userId}`),
                api.get(`/reviews/reviewee/${userId}`)
            ]);
            setUser(userRes.data);
            setReviews(reviewsRes.data);
            if (userRes.data.specializedProfiles) {
                setSpecializedProfiles(userRes.data.specializedProfiles);
            }
        } catch (error) {
            console.error('Failed to fetch profile data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [userId]);

    const handleToggleAvailability = async () => {
        if (!userId) return;
        try {
            await api.post(`/users/${userId}/toggle-availability`);
            fetchProfileData();
        } catch (error) {
            console.error('Failed to toggle availability', error);
        }
    };

    const handleDelete = async (type: 'education' | 'experience' | 'portfolio' | 'certifications', id: string) => {
        if (!confirm('Are you sure you want to delete this?')) return;
        try {
            await api.delete(`/users/${type === 'certifications' ? 'certifications' : type}/${id}`);
            fetchProfileData();
        } catch (error) {
            console.error(`Failed to delete ${type}`, error);
        }
    };

    const handleToggle2FA = async () => {
        if (!user) return;
        if (user.twoFactorEnabled) {
            if (confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
                try {
                    await api.post(`/users/${userId}/toggle-2fa`);
                    fetchProfileData();
                } catch (error) {
                    console.error('Failed to disable 2FA', error);
                }
            }
        } else {
            setTwoFactorModal(true);
        }
    };

    const handleVerifyPayment = async () => {
        if (!userId) return;
        try {
            await api.post(`/users/${userId}/verify-payment`);
            fetchProfileData();
        } catch (error) {
            console.error('Failed to verify payment', error);
        }
    };

    const handleReply = async (reviewId: string) => {
        if (!replyText.trim()) return;
        setReplyLoading(true);
        try {
            await api.post(`/reviews/${reviewId}/reply`, { reply: replyText });
            setReplyText('');
            setReplyingTo(null);
            fetchProfileData();
        } catch (error) {
            console.error('Failed to submit reply', error);
            alert('Failed to submit reply. Please try again.');
        } finally {
            setReplyLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="relative">
                    <Skeleton className="h-48 rounded-3xl" />
                    <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                        <Skeleton className="w-32 h-32 rounded-3xl border-4 border-slate-950" />
                        <div className="pb-4 space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </div>
                <div className="pt-12 flex gap-8 border-b border-slate-800">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="w-20 h-4 mb-4" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <Skeleton className="h-64 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-48 rounded-2xl" />
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-48 rounded-2xl" />
                        <Skeleton className="h-96 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <div className="text-center text-slate-400">User not found</div>;
    }

    const selectedProfile = selectedProfileId ? specializedProfiles.find(p => p.id === selectedProfileId) : null;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Profile Header */}
            <div className="relative">
                <div className="h-48 rounded-3xl bg-slate-800 relative overflow-hidden shadow-xl">
                    {user.coverImageUrl ? (
                        <img src={getPublicUrl(user.coverImageUrl)} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
                    )}
                </div>
                <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                    <div className="w-32 h-32 rounded-3xl bg-slate-900 border-4 border-slate-950 p-1">
                        <div className="w-full h-full rounded-2xl bg-slate-800 flex items-center justify-center overflow-hidden">
                            {user.avatarUrl ? (
                                <img src={getPublicUrl(user.avatarUrl)} alt={user.firstName} className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-16 h-16 text-slate-400" />
                            )}
                        </div>
                    </div>
                    <div className="pb-4 space-y-2">
                        <h1 className="text-3xl font-bold text-white">{user.firstName} {user.lastName}</h1>
                        <div className="flex flex-col gap-2">
                            <p className="text-slate-400 flex items-center gap-2">
                                {user.roles.includes('CLIENT') ? (
                                    <span className="flex items-center gap-1.5">
                                        <Building2 className="w-4 h-4" /> {user.companyName || 'Client'}
                                    </span>
                                ) : (
                                    selectedProfile?.headline || user.title || 'Freelancer'
                                )}
                            </p>
                            <BadgeList userId={user.id} />
                            {!user.roles.includes('CLIENT') && (
                                <button
                                    onClick={handleToggleAvailability}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border transition-all w-fit ${user.isAvailable
                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                                        : 'bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/20'
                                        }`}
                                >
                                    {user.isAvailable ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                    {user.isAvailable ? 'Available' : 'Busy'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-12 right-8 pb-4">
                    <button onClick={() => window.location.href = '/profile/edit'} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20">
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
                <button
                    onClick={() => setActiveTab('portfolio')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'portfolio' ? 'text-blue-500' : 'text-slate-400 hover:text-white'
                        }`}
                >
                    Portfolio ({portfolioItemsToDisplay?.length || 0})
                    {activeTab === 'portfolio' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                    )}
                </button>
                {!user.roles.includes('CLIENT') && (
                    <button
                        onClick={() => setActiveTab('availability')}
                        className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'availability' ? 'text-blue-500' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Availability
                        {activeTab === 'availability' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </button>
                )}
                <button
                    onClick={() => setActiveTab('security')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'security' ? 'text-blue-500' : 'text-slate-400 hover:text-white'
                        }`}
                >
                    Security
                    {activeTab === 'security' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {activeTab === 'about' ? (
                    <>
                        {/* Left Column: Info & Socials */}
                        <div className="space-y-6">
                            {!user.roles.includes('CLIENT') && (
                                <div className="space-y-4">
                                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Profile View</h3>
                                            <button
                                                onClick={() => setSpecializedProfileModal({ open: true, data: null })}
                                                className="p-1 hover:bg-slate-800 rounded text-blue-500 transition-all"
                                                title="Add Specialized Profile"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <ProfileSwitcher
                                            profiles={specializedProfiles}
                                            selectedId={selectedProfileId}
                                            onSelect={setSelectedProfileId}
                                        />
                                    </div>

                                    {selectedProfile && (
                                        <SpecializedProfileCard
                                            profile={selectedProfile}
                                            onEdit={(p: any) => setSpecializedProfileModal({ open: true, data: p })}
                                            onDelete={async (id: string) => {
                                                if (confirm('Are you sure you want to delete this specialized profile?')) {
                                                    await api.delete(`/profiles/specialized/${id}`);
                                                    fetchProfileData();
                                                }
                                            }}
                                            onSetDefault={async (id: string) => {
                                                await api.patch(`/profiles/specialized/${id}/set-default`);
                                                fetchProfileData();
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                            <ProfileCompleteness user={user} />

                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                                <h3 className="font-semibold text-white">About</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {selectedProfile?.bio || user.overview || 'No overview provided yet.'}
                                </p>
                                <div className="space-y-3 pt-4 border-t border-slate-800">
                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                        <MapPin className="w-4 h-4" /> {[user.address, user.country].filter(Boolean).join(', ') || 'Remote'}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                        <Mail className="w-4 h-4" /> {user.email}
                                    </div>
                                    {user.phone && (
                                        <div className="flex items-center gap-3 text-sm text-slate-400">
                                            <span className="font-bold text-xs">Ph:</span> {user.phone}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                        <Calendar className="w-4 h-4" /> Joined {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-white">Languages</h3>
                                    <button
                                        onClick={() => setLangModal(true)}
                                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {user.languages && user.languages.length > 0 ? (
                                        user.languages.map((lang, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <span className="text-white font-medium">{lang.language}</span>
                                                <span className="text-slate-500">{lang.proficiency}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">No languages added.</p>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                                <h3 className="font-semibold text-white">Social Profiles</h3>
                                <div className="space-y-3">
                                    {[
                                        { icon: Github, label: 'GitHub', username: user.githubUsername, url: `https://github.com/${user.githubUsername}`, color: 'hover:text-white' },
                                        { icon: Linkedin, label: 'LinkedIn', username: user.linkedinUsername, url: `https://linkedin.com/in/${user.linkedinUsername}`, color: 'hover:text-blue-400' },
                                        { icon: Twitter, label: 'Twitter', username: user.twitterUsername, url: `https://twitter.com/${user.twitterUsername}`, color: 'hover:text-sky-400' },
                                        { icon: Globe, label: 'Website', username: user.website, url: user.website, color: 'hover:text-emerald-400' },
                                        { icon: Award, label: 'Behance', username: user.behanceUsername, url: `https://behance.net/${user.behanceUsername}`, color: 'hover:text-blue-400' },
                                        { icon: Award, label: 'Dribbble', username: user.dribbbleUsername, url: `https://dribbble.com/${user.dribbbleUsername}`, color: 'hover:text-pink-400' },
                                    ].filter(s => s.username).map((social) => (
                                        <a
                                            key={social.label}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={"flex items-center justify-between group p-2 rounded-lg hover:bg-slate-800 transition-all " + social.color}
                                        >
                                            <div className="flex items-center gap-3">
                                                <social.icon className="w-4 h-4 text-slate-500 group-hover:text-inherit transition-colors" />
                                                <span className="text-sm text-slate-400 group-hover:text-inherit transition-colors">{social.label}</span>
                                            </div>
                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                                        </a>
                                    ))}
                                    {![user.githubUsername, user.linkedinUsername, user.twitterUsername, user.website, user.behanceUsername, user.dribbbleUsername].some(Boolean) && (
                                        <p className="text-sm text-slate-500 italic">No social profiles added.</p>
                                    )}
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
                                    {(selectedProfile?.skills || user.skills)?.length > 0 ? (selectedProfile?.skills || user.skills).map((skill: string) => (
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
                                    <button
                                        onClick={() => setExpModal({ open: true, data: null })}
                                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-8">
                                    {experienceToDisplay?.length > 0 ? experienceToDisplay.map((exp) => (
                                        <div key={exp.id} className="relative pl-8 group before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-blue-500 before:rounded-full after:absolute after:left-[3px] after:top-6 after:bottom-[-32px] after:w-[2px] after:bg-slate-800 last:after:hidden">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="text-sm font-bold text-white">{exp.role || exp.title}</div>
                                                    <div className="text-xs text-blue-400 font-medium mt-0.5">
                                                        {exp.company} • {new Date(exp.startDate).getFullYear()} - {exp.current ? 'Present' : new Date(exp.endDate).getFullYear()}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={() => setExpModal({ open: true, data: exp })}
                                                        className="p-1 hover:text-blue-400 text-slate-500 transition-colors"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete('experience', exp.id)}
                                                        className="p-1 hover:text-red-400 text-slate-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-400 mt-2 leading-relaxed">{exp.description}</p>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-slate-500">No experience added yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-white">Certifications</h3>
                                    <button
                                        onClick={() => setCertModal({ open: true, data: null })}
                                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {certificationsToDisplay?.length > 0 ? certificationsToDisplay.map((cert: any) => (
                                        <div key={cert.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-blue-500/30 transition-all group">
                                            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                                                <Award className="w-6 h-6 text-orange-500" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-white text-sm">{cert.title}</h4>
                                                        <p className="text-xs text-slate-400 mt-0.5">{cert.issuer}</p>
                                                    </div>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            onClick={() => handleDelete('certifications', cert.id)}
                                                            className="p-1 hover:text-red-400 text-slate-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                {cert.verificationUrl && (
                                                    <a href={cert.verificationUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-flex items-center gap-1">
                                                        Verify Credential <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${cert.status === 'VERIFIED'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                        : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                                        }`}>
                                                        {cert.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-slate-500">No certifications added yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-white">Education</h3>
                                    <button
                                        onClick={() => setEduModal({ open: true, data: null })}
                                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-8">
                                    {educationToDisplay?.length > 0 ? educationToDisplay.map((edu) => (
                                        <div key={edu.id} className="relative pl-8 group before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-indigo-500 before:rounded-full after:absolute after:left-[3px] after:top-6 after:bottom-[-32px] after:w-[2px] after:bg-slate-800 last:after:hidden">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="text-sm font-bold text-white">{edu.degree} in {edu.fieldOfStudy}</div>
                                                    <div className="text-xs text-indigo-400 font-medium mt-0.5">
                                                        {edu.institution} • {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={() => setEduModal({ open: true, data: edu })}
                                                        className="p-1 hover:text-blue-400 text-slate-500 transition-colors"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete('education', edu.id)}
                                                        className="p-1 hover:text-red-400 text-slate-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-400 mt-2 leading-relaxed">{edu.description}</p>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-slate-500">No education added yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : activeTab === 'reviews' ? (
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
                                        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                                                    <UserIcon className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <div className="text-xs font-medium text-slate-400">
                                                    Reviewer ID: {review.reviewer_id.substring(0, 8)}...
                                                </div>
                                            </div>
                                            {!review.reply && !replyingTo && (
                                                <button
                                                    onClick={() => {
                                                        setReplyingTo(review.id);
                                                        setReplyText('');
                                                    }}
                                                    className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5" /> Reply
                                                </button>
                                            )}
                                        </div>

                                        {review.reply && (
                                            <div className="mt-4 ml-6 p-4 rounded-xl bg-slate-800/50 border-l-2 border-blue-500/50 space-y-2">
                                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                    <span>Your Response</span>
                                                    <span>{new Date(review.repliedAt!).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-slate-300 italic">
                                                    "{review.reply}"
                                                </p>
                                            </div>
                                        )}

                                        {replyingTo === review.id && (
                                            <div className="mt-4 space-y-3">
                                                <textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Type your response..."
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none h-24"
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => setReplyingTo(null)}
                                                        className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleReply(review.id)}
                                                        disabled={replyLoading || !replyText.trim()}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
                                                    >
                                                        {replyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Post Reply'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
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
                ) : activeTab === 'portfolio' ? (
                    <div className="lg:col-span-3 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Portfolio Projects</h3>
                            <button
                                onClick={() => setPortModal({ open: true, data: null })}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Project
                            </button>
                        </div>
                        {portfolioItemsToDisplay?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {portfolioItemsToDisplay.map((item) => (
                                    <div key={item.id} className="group relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-blue-500/50 transition-all">
                                        <div className="aspect-video relative overflow-hidden">
                                            <img src={getPublicUrl(item.imageUrl)} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => setPortModal({ open: true, data: item })}
                                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all"
                                                >
                                                    <Edit3 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete('portfolio', item.id)}
                                                    className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-400 backdrop-blur-md transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-bold text-white mb-1">{item.title}</h4>
                                            <p className="text-sm text-slate-400 line-clamp-2">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                                <Plus className="w-12 h-12 text-slate-700 mx-auto" />
                                <div className="space-y-1">
                                    <p className="text-white font-bold">No projects yet</p>
                                    <p className="text-slate-500 text-sm">Showcase your best work to attract clients.</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'security' ? (
                    <div className="lg:col-span-3 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 2FA Section */}
                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <Lock className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <button
                                        onClick={handleToggle2FA}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${user.twoFactorEnabled
                                            ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                            : 'bg-blue-600 text-white hover:bg-blue-500'
                                            }`}
                                    >
                                        {user.twoFactorEnabled ? 'Disable' : 'Enable'}
                                    </button>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Two-Factor Authentication</h4>
                                    <p className="text-sm text-slate-400 mt-1">Add an extra layer of security to your account.</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium">
                                    <span className={`w-2 h-2 rounded-full ${user.twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                                    <span className={user.twoFactorEnabled ? 'text-emerald-500' : 'text-slate-500'}>
                                        {user.twoFactorEnabled ? 'Currently Enabled' : 'Currently Disabled'}
                                    </span>
                                </div>
                            </div>

                            {/* KYC Section */}
                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                        <ShieldCheck className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${user.kycStatus === 'VERIFIED'
                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                        : user.kycStatus === 'PENDING'
                                            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                            : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                        }`}>
                                        {user.kycStatus}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Identity Verification (KYC)</h4>
                                    <p className="text-sm text-slate-400 mt-1">Verify your identity to increase trust and unlock higher limits.</p>
                                </div>
                                {user.kycStatus === 'NOT_STARTED' && (
                                    <div className="flex flex-col gap-3">
                                        <Button
                                            onClick={() => setVerifyModal(true)}
                                            className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                                        >
                                            Verify Identity Document
                                        </Button>
                                        <Button
                                            onClick={() => setVideoKycModal(true)}
                                            className="w-full bg-purple-600 hover:bg-purple-500 text-white"
                                        >
                                            Verify via Video KYC (Instant)
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Payment Verification (Client Only) */}
                            {user.roles.includes('CLIENT') && (
                                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                            <Award className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        {!user.isPaymentVerified && (
                                            <button
                                                onClick={handleVerifyPayment}
                                                className="px-4 py-1.5 bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg text-sm font-bold transition-all"
                                            >
                                                Verify Now
                                            </button>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Payment Verification</h4>
                                        <p className="text-sm text-slate-400 mt-1">Verify your payment method to attract top talent.</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium">
                                        <span className={`w-2 h-2 rounded-full ${user.isPaymentVerified ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                                        <span className={user.isPaymentVerified ? 'text-emerald-500' : 'text-slate-500'}>
                                            {user.isPaymentVerified ? 'Payment Method Verified' : 'No Verified Payment Method'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : activeTab === 'availability' ? (
                    <div className="lg:col-span-3">
                        <AvailabilityCalendar userId={userId!} />
                    </div>
                ) : null}
            </div>

            {/* Modals */}
            <EducationModal
                isOpen={eduModal.open}
                onClose={() => setEduModal({ open: false, data: null })}
                onSuccess={fetchProfileData}
                userId={userId!}
                initialData={eduModal.data}
                specializedProfiles={specializedProfiles}
            />
            <ExperienceModal
                isOpen={expModal.open}
                onClose={() => setExpModal({ open: false, data: null })}
                onSuccess={fetchProfileData}
                userId={userId!}
                initialData={expModal.data}
                specializedProfiles={specializedProfiles}
            />
            <PortfolioModal
                isOpen={portModal.open}
                onClose={() => setPortModal({ open: false, data: null })}
                onSuccess={fetchProfileData}
                userId={userId!}
                initialData={portModal.data}
                specializedProfiles={specializedProfiles}
            />
            <VideoKYCModal
                isOpen={videoKycModal}
                onClose={() => setVideoKycModal(false)}
                onSuccess={fetchProfileData}
                userId={userId || ''}
            />

            <CertificationModal
                isOpen={certModal.open}
                onClose={() => setCertModal({ open: false, data: null })}
                onSuccess={fetchProfileData}
                userId={userId!}
                initialData={certModal.data}
                specializedProfiles={specializedProfiles}
            />
            <VerificationModal
                isOpen={verifyModal}
                onClose={() => setVerifyModal(false)}
                onSuccess={fetchProfileData}
                userId={userId!}
            />
            <LanguageModal
                isOpen={langModal}
                onClose={() => setLangModal(false)}
                onSuccess={fetchProfileData}
                userId={userId!}
                existingLanguages={user.languages || []}
            />
            <SpecializedProfileModal
                isOpen={specializedProfileModal.open}
                onClose={() => setSpecializedProfileModal({ open: false, data: null })}
                onSuccess={fetchProfileData}
                userId={userId!}
                initialData={specializedProfileModal.data}
            />

            {twoFactorModal && (
                <TwoFactorSetupModal
                    isOpen={twoFactorModal}
                    onClose={() => setTwoFactorModal(false)}
                    onSuccess={() => {
                        fetchProfileData();
                        setTwoFactorModal(false);
                    }}
                    userId={userId!}
                />
            )}
        </div>
    );
}
